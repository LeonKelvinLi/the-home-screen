#!/usr/bin/env node
/*
  Registration and sign-in, the properties audit-otp does not already cover.

  audit-otp proves the code itself: never returned to the client, single use,
  five wrong guesses locks it, a resend kills the old one, and the same reply
  for a known address as for an unknown one. This covers what happens either
  side of that — the code going stale, the session going stale, signing out
  actually ending the session on the server, an address typed in a different
  case being the same address, and the one configuration mistake that makes the
  whole flow silently useless in production.

  THE LAST ONE IS WHY THIS FILE EXISTS. On 2026-08-28 production had a valid
  Resend key, no verified domain, and OTP_FROM_EMAIL set to
  "BEASTY <onboarding@resend.dev>" — Resend's shared testing sender, which
  delivers only to the address that owns the Resend account. Every other
  customer was told to check an email that could never arrive. Nothing failed,
  nothing logged, the API returned 200; the only symptom was silence.

    node tools/audit-auth.mjs
*/
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { openSync, readFileSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'
import pg from 'pg'

/*
  THE AUDITS SIGN IN BY PHONE, because the screens do — "we want only SMS",
  2026-08-29. The server still accepts an email so the accounts that existed
  before then are not locked out, and audit-auth still proves that path; every
  other audit here walks the road a customer actually walks.

  555-01xx is the reserved fictional exchange: the right thing in a test and
  the wrong thing in production.
*/

const freePort = () =>
  new Promise((r) => {
    const s = createServer()
    s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) })
  })

const port = await freePort()
const TESTDB = await freshTestDb('auth')
const LOG = `/tmp/audit-auth-${process.pid}.log`
const fd = openSync(LOG, 'w')
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  stdio: ['ignore', fd, fd],
  env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', ALLOW_MOCK_PAYMENTS: '1' },
})
const base = `http://localhost:${port}`

const fails = []
const check = (ok, what) => {
  console.log(`${ok ? ' ok ' : 'FAIL'}  ${what}`)
  if (!ok) fails.push(what)
}
const codeFor = (email) => {
  const l = readFileSync(LOG, 'utf8').split('\n').filter((x) => x.includes(`[login-code] ${email} `)).pop()
  return l && l.match(/ (\d{6}) /)?.[1]
}
const post = async (path, body, cookie) => {
  const r = await fetch(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  })
  return { status: r.status, body: await r.json().catch(() => null), setCookie: r.headers.get('set-cookie') }
}

/*
  /api/members/start is rate limited to 8 a minute with a burst of 4, per IP,
  and this audit is one IP making a dozen sign-ups. The limiter doing its job
  was the first version's loudest finding — three assertions failed because the
  server was correctly throttling the test.

  So the limiter gets asserted once, on purpose, and every other start waits for
  a token rather than pretending the throttle is a defect. Refill is 8/min, so
  a token arrives every 7.5 seconds.
*/
const startCode = async (name, phone) => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const r = await post('/api/members/start', { name, phone })
    if (r.status !== 429) return r
    await new Promise((res) => setTimeout(res, 8000))
  }
  return { status: 429, body: null, setCookie: null }
}
const sessionCookie = (setCookie) => setCookie?.split(';')[0]

try {
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(base + '/api/health')).ok) break } catch {}
    await new Promise((r) => setTimeout(r, 250))
  }

  // ---- 1. the configuration that decides whether any of this is real ------
  {
    /*
      Asserted against the RULE rather than by importing the server, which would
      start a second one. The rule is small enough to restate and the point is
      that a resend.dev sender in production is a defect.
    */
    const from = process.env.OTP_FROM_EMAIL ?? ''
    const key = process.env.RESEND_API_KEY ?? ''
    const shared = /@resend\.dev\b/i.test(from)
    if (process.env.NODE_ENV === 'production') {
      check(!!key && !!from, 'production has an email provider configured')
      check(!shared, 'production does not send from resend.dev, which only reaches the account owner')
    } else {
      console.log(` --   email config is a production concern; here it is ${key && from ? (shared ? 'resend.dev (would fail in prod)' : 'set') : 'unset, codes go to the log'}`)
    }
  }

  // ---- 2. a code that has gone stale --------------------------------------
  // ---- 1b. the limiter itself, proved before it gets in the way ----------
  {
    const burst = []
    for (let i = 0; i < 7; i++) burst.push(await post('/api/members/start', { name: 'Burst Bob', phone: `+1510552${String(Date.now()).slice(-3)}${i}` }))
    check(burst.some((r) => r.status === 429), 'a burst of sign-up requests from one address is throttled')
    check(burst[0].status === 202, 'and the first of them still went through')
  }

  const stale = `+1510555${String(Date.now()).slice(-4)}`
  await startCode('Stale Sam', stale)
  const staleCode = codeFor(stale)
  check(!!staleCode, 'a code is issued')
  {
    const c = new pg.Client({ connectionString: TESTDB.url })
    await c.connect()
    await c.query('UPDATE login_codes SET expires_at = $1 WHERE destination = $2', [Date.now() - 1000, stale])
    await c.end()
  }
  const expired = await post('/api/members/verify', { phone: stale, code: staleCode })
  check(expired.status === 400, 'AN EXPIRED CODE IS REFUSED')
  const afterExpiry = await post('/api/members/verify', { phone: stale, code: staleCode })
  check(afterExpiry.status === 400, 'and stays refused when tried again')

  /*
    3. THE NUMBER IS THE NUMBER, HOWEVER IT WAS TYPED.

    This replaces the mixed-case email test and is the same property one layer
    down: the same person types (510) 555-0123, 510-555-0123, 5105550123 and
    +15105550123 on four different days, and all four have to be one account.
    Normalisation to E.164 happens on the way in AND on the way back, so the
    code can be requested in one shape and confirmed in another.

    If this ever fails, the uniqueness index on members.phone is meaningless —
    the same person would be able to create an account per punctuation style.
  */
  const tail = String(Date.now()).slice(-4)
  const typed = `(510) 551-${tail}`
  const e164 = `+1510551${tail}`
  await startCode('Punctuation Pat', typed)
  const punctCode = codeFor(e164)
  check(!!punctCode, 'a number typed with brackets and a dash is stored in E.164')
  const lower = await post('/api/members/verify', { phone: `510-551-${tail}`, code: punctCode ?? '' })
  check(lower.status === 201, 'AND CONFIRMING IT IN A DIFFERENT SHAPE SIGNS THEM IN')
  const session = sessionCookie(lower.setCookie)

  // ---- 4. the cookie a session rides on -----------------------------------
  const raw = lower.setCookie ?? ''
  check(/HttpOnly/i.test(raw), 'the session cookie is HttpOnly, so script cannot read it')
  check(/SameSite=Lax/i.test(raw), 'the session cookie is SameSite=Lax')
  check(/Max-Age=\d+/i.test(raw), 'the session cookie carries an expiry')
  check(!/beasty_member=[^;]*@/.test(raw), 'the session cookie is a token, not an address')

  // ---- 5. signing out ends it on the SERVER, not just in the browser ------
  const me = await fetch(base + '/api/members/me', { headers: { cookie: session } })
  check(me.ok, 'the session works')
  await post('/api/members/signout', {}, session)
  const afterOut = await fetch(base + '/api/members/me', { headers: { cookie: session } })
  check(afterOut.status === 401, 'THE OLD COOKIE IS DEAD AFTER SIGNING OUT, server-side')

  // ---- 6. a session that has aged out -------------------------------------
  const aged = `+1510555${String(Date.now()).slice(-4)}`
  await startCode('Aged Ann', aged)
  const agedIn = await post('/api/members/verify', { phone: aged, code: codeFor(aged) ?? '' })
  const agedCookie = sessionCookie(agedIn.setCookie)
  {
    const c = new pg.Client({ connectionString: TESTDB.url })
    await c.connect()
    await c.query('UPDATE member_sessions SET expires_at = $1', [Date.now() - 1000])
    await c.end()
  }
  const agedOut = await fetch(base + '/api/members/me', { headers: { cookie: agedCookie } })
  check(agedOut.status === 401, 'AN EXPIRED SESSION IS REFUSED')

  // ---- 7. signing in on a second device does not evict the first ----------
  const two = `+1510555${String(Date.now()).slice(-4)}`
  await startCode('Two Devices', two)
  const dev1 = await post('/api/members/verify', { phone: two, code: codeFor(two) ?? '' })
  const c1 = sessionCookie(dev1.setCookie)
  await startCode('Two Devices', two)
  const dev2 = await post('/api/members/verify', { phone: two, code: codeFor(two) ?? '' })
  const c2 = sessionCookie(dev2.setCookie)
  check(!!c1 && !!c2 && c1 !== c2, 'a second device gets its own session')
  const stillIn = await fetch(base + '/api/members/me', { headers: { cookie: c1 } })
  check(stillIn.ok, 'and the first device is still signed in')

  // ---- 8. the start route will not take just anything ---------------------
  const noEmail = await startCode('No Number', '12345')
  check(noEmail.status === 400, `a number that is too short is refused (got ${noEmail.status})`)
  const noName = await startCode('x', `+1510555${String(Date.now()).slice(-4)}`)
  check(noName.status === 400, `a one-character name is refused for everyone, which is what keeps it from being an oracle (got ${noName.status})`)
} finally {
  srv.kill()
  await TESTDB.drop()
}

console.log(fails.length ? `\n${fails.length} failed` : '\nauth: all good')
process.exit(fails.length ? 1 : 0)
