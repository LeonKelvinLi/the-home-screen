/*
  EVERY MEMBER HOLDS THEIR OWN RAFFLE TICKETS, NUMBERED.

  Glenn, 2026-09-06: "make sure they have their own digital raffle for every
  user." A ticket is a row with a serial on it, minted at every third
  referral, listed only to the member who earned it, and never the same number
  as anybody else's. Driven through the real sign-up so the referral chain is
  the one that mints — an insert straight into the table would prove nothing
  about the app.
*/
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, readFileSync, openSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('raffle')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = '/tmp/audit-raffle.log'
try { rmSync(LOG, { force: true }) } catch {}
const out = openSync(LOG, 'a')
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { stdio: ['ignore', out, out], env: {
  ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, ALLOW_MOCK_PAYMENTS: '1', NODE_ENV: 'development',
} })
const B = `http://localhost:${port}`
for (let i = 0; i < 80; i++) { try { if ((await fetch(B + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const fails = []
const check = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) fails.push(msg) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const done = async (code) => { srv.kill(); await TESTDB.drop?.(); process.exit(code) }
/* Seven sign-ups is past the sign-up route's burst, so a 429 is waited out
   rather than counted: the limiter is doing its job, not answering. */
const call = async (method, path, body, headers = {}) => {
  for (let i = 0; i < 20; i++) {
    const r = await fetch(B + path, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined })
    if (r.status === 429) { await sleep(5500); continue }
    const text = await r.text()
    let json = {}
    try { json = JSON.parse(text) } catch {}
    return { status: r.status, body: json, text, cookie: r.headers.get('set-cookie') }
  }
  throw new Error('rate limited for the whole run')
}
const codeFor = (dest) => readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${dest} `)).pop()?.match(/ (\d{6}) /)?.[1]
const signUp = async (name, phone, ref) => {
  const s = await call('POST', '/api/members/start', { name, phone, ...(ref ? { ref } : {}) })
  if (s.status !== 202) throw new Error(`start ${s.status} ${s.text}`)
  const code = codeFor(phone)
  if (!code) throw new Error(`no code logged for ${phone}`)
  const v = await call('POST', '/api/members/verify', { phone, code })
  if (v.status >= 300) throw new Error(`verify ${v.status} ${v.text}`)
  return { account: v.body, cookie: (v.cookie || '').split(';')[0] }
}

try {
  const stamp = String(Date.now()).slice(-4)
  check((await call('GET', '/api/members/tickets')).status === 401, 'signed out, there are no tickets to list')
  const ora = await signUp('Ora Nakamura', `+1510601${stamp}`)
  const as = (m) => ({ cookie: m.cookie })
  const none = await call('GET', '/api/members/tickets', null, as(ora))
  check(none.status === 200 && Array.isArray(none.body.tickets) && none.body.tickets.length === 0, 'a new member holds no tickets yet')

  const friends = []
  for (let i = 1; i <= 6; i++) friends.push(await signUp(`Friend ${i}`, `+151060${i + 1}${stamp}`, ora.account.referralCode))
  const me = await call('GET', '/api/members/me', null, as(ora))
  check(me.body.referrals === 6 && me.body.raffleTickets.total === 2, `six sign-ups on her code minted two tickets (${me.body.referrals} referrals, ${me.body.raffleTickets.total} tickets)`)

  const t = await call('GET', '/api/members/tickets', null, as(ora))
  const tickets = t.body.tickets ?? []
  check(t.status === 200 && tickets.length === 2, 'her tickets are listed, one row each')
  check(tickets.length === me.body.raffleTickets.total, 'the list and the count on the account agree')
  const serials = tickets.map((x) => x.serial)
  check(serials.every((n) => Number.isInteger(n) && n > 0), `every ticket carries a serial (${serials.join(', ')})`)
  check(new Set(serials).size === serials.length && serials[0] < serials[1], 'the serials are distinct and in the order they were earned')
  check(tickets.map((x) => x.earnedAtReferral).join(',') === '3,6', 'each ticket says which sign-up earned it')
  check(tickets.every((x) => x.usedAt === null && typeof x.earnedAt === 'number' && x.id.startsWith('rt_')), 'none is spent yet, each is dated')

  const f1 = await call('GET', '/api/members/tickets', null, as(friends[0]))
  check(f1.status === 200 && f1.body.tickets.length === 0, 'a friend who referred nobody holds none')
  check(!f1.body.tickets.some((x) => tickets.some((y) => y.id === x.id)), 'nobody else\'s tickets are ever listed to a member')

  /* A second earner gets numbers that do not collide with hers. */
  const f2 = friends[1]
  for (let i = 1; i <= 3; i++) await signUp(`Cousin ${i}`, `+151061${i}${stamp}`, f2.account.referralCode)
  const t2 = await call('GET', '/api/members/tickets', null, as(f2))
  check(t2.body.tickets?.length === 1, 'three sign-ups on a second member\'s code minted her one ticket')
  check(t2.body.tickets?.length === 1 && !serials.includes(t2.body.tickets[0].serial), `her ticket has its own number (${t2.body.tickets?.[0]?.serial})`)
} catch (e) {
  console.log('FAIL: ' + (e?.stack || e))
  await done(1)
}

if (fails.length) { console.log(`\nFAIL: ${fails.join('; ')}`); await done(1) }
console.log('\nPASS: every member holds their own numbered tickets, minted by the referral chain and listed to nobody else.')
await done(0)
