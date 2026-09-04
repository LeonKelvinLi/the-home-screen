/*
  THE SIGN-IN FORM MUST ASK FOR SOMETHING THE SERVER CAN ACTUALLY SEND TO.

  Sign-in moved to SMS on 2026-08-29. The deployment had — and still has — no
  SMS provider and a working email one. So the form asked every visitor for a
  phone number, the server dutifully chose the SMS channel, nothing was sent,
  and the code screen said "texting is not connected on this site yet". It also
  printed the address the code had NOT gone to: the confirmation line named the
  email field while the code went by text.

  Nobody could sign up for two days. Glenn's nephew is the one who reported it.

  Every existing audit passed throughout, because they all sign in through the
  API and never look at what the form asks a human for. This one runs the form,
  in both worlds:

    - with email configured and SMS not, the way production actually is
    - with SMS configured, the way it was designed

  and in each checks that the required field is the one that can be delivered,
  that the code screen names the destination the code REALLY went to, and that
  a failure blames the right channel.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, openSync, readFileSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'

const fails = []
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })

/* A fake sender is enough: the question is which channel the form ASKS for,
   not whether Twilio is reachable. TWILIO_* set to anything makes the server
   report SMS as configured, which is exactly the state being tested. */
const WORLDS = [
  {
    /*
      NO RESEND KEY, DELIBERATELY. With one set the server hands the code to
      Resend and — correctly — never logs it, so this audit could not read it
      back and could not finish signing in. Without one the code is logged and
      the whole path is testable. The FORM does not care either way: it asks
      for an email whenever texting cannot deliver, which is exactly what
      production does, so what is exercised here is what runs there.
    */
    name: 'email only (production today)',
    /* Configured, so the server CHOOSES email — which is the path being
       tested. The key is fake, so the send fails and the code is printed by
       the development-only branch, which is how it gets read back below. */
    env: { RESEND_API_KEY: 're_test_notreal', OTP_FROM_EMAIL: 'BEASTY <hello@beastypages.com>' },
    wants: 'email',
    canFinish: true,
  },
  {
    /*
      Verify-backed, which is how this would really be configured — Twilio
      makes and checks its own code, so ours is never logged and a sign-in
      cannot be completed here without calling Twilio for real. This world
      therefore checks the SHAPE of the form and stops, and says so rather than
      pretending it proved more.
    */
    name: 'sms configured',
    env: {
      TWILIO_ACCOUNT_SID: 'AC0000000000000000000000000000dead',
      TWILIO_AUTH_TOKEN: 'notreal',
      TWILIO_VERIFY_SERVICE_SID: 'VA0000000000000000000000000000beef',
    },
    wants: 'sms',
    canFinish: false,
  },
]

for (const world of WORLDS) {
  const LOG = `/tmp/beasty-channel-${world.wants}.log`
  try { rmSync(LOG) } catch {}
  const out = openSync(LOG, 'a')
  const TESTDB = await freshTestDb(`chan${world.wants}`)
  const port = await freePort()
  const srv = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: ['ignore', out, out],
    env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', ...world.env },
  })
  const base = `http://localhost:${port}`
  for (let i = 0; i < 80; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

  const said = await (await fetch(base + '/api/members/channels')).json()
  console.log(`\n--- ${world.name}: server reports ${JSON.stringify(said)}`)
  if ((world.wants === 'sms') !== !!said.sms) fails.push(`${world.name}: server says sms=${said.sms}`)

  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
  await p.goto(base, { waitUntil: 'networkidle' })
  /* Through the door first. The join sheet lives on the home screen, and
     dispatching the event over a landing that is still counting down opens
     nothing — which reads as "the form renders no inputs". */
  const enter = p.locator('[aria-label="Enter BEASTY"]').first()
  try {
    await enter.waitFor({ state: 'visible', timeout: 15000 })
    await enter.click()
    await p.waitForTimeout(2600)
  } catch { await p.waitForTimeout(1200) }
  if (await p.locator('[aria-label="Enter BEASTY"]').count()) {
    await enter.click().catch(() => {})
    await p.waitForTimeout(2600)
  }
  await p.evaluate(() => window.dispatchEvent(new CustomEvent('beasty:join')))
  await p.waitForSelector('.join', { timeout: 15000 }).catch(() => {})

  /* WHICH FIELD IS REQUIRED — this is the whole bug. */
  const form = await p.evaluate(() => ({
    tel: !!document.querySelector('input[type=tel]')?.required,
    email: !!document.querySelector('input[type=email]')?.required,
    lead: document.querySelector('.join-lead')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
  }))
  const wantTel = world.wants === 'sms'
  console.log(`required   : tel=${form.tel} email=${form.email}`)
  if (form.tel !== wantTel) fails.push(`${world.name}: the number is ${form.tel ? '' : 'not '}required, expected ${wantTel ? '' : 'not '}required`)
  if (form.email !== !wantTel) fails.push(`${world.name}: the email is ${form.email ? '' : 'not '}required, expected ${!wantTel ? '' : 'not '}required`)
  if (form.lead.includes(wantTel ? 'We email you' : 'We text you')) fails.push(`${world.name}: the lede promises the wrong channel — "${form.lead.slice(0, 80)}"`)

  /* Fill BOTH, so the only thing deciding the channel is the server. */
  const phone = `+1510555${String(Date.now()).slice(-4)}`
  const email = `chan${Date.now()}@example.invalid`
  console.log('inputs     :', JSON.stringify(await p.evaluate(() =>
    [...document.querySelectorAll('input')].map((i) => ({ t: i.type, r: i.required, ph: i.placeholder })))))
  await p.locator('input[type=tel]').fill(phone)
  await p.locator('input[type=email]').fill(email)
  const nameBox = p.locator('.join input').first()
  await nameBox.fill('Chan Nel')
  await p.waitForTimeout(200)
  await p.evaluate(() => document.querySelector('.join button[type=submit]')?.click())
  /*
    WAIT FOR THE STEP, NOT FOR A GUESSED 1.6 SECONDS.

    Under `bash tools/audit-all.sh` six of these run at once, each with its own
    server and browser, and the code screen took longer than 1600ms to render
    perhaps one run in two — so this reported that the screen "does not name
    the address it was sent to" when the screen simply was not there yet.
    audit-all.sh's own header warns about exactly this.

    The catch is deliberate: if the step never arrives, the assertions below
    still run against an empty screen and still fail. This only removes the
    guess, never the check.
  */
  await p.waitForSelector('.join-code', { timeout: 25000 }).catch(() => {})

  const codeStep = await p.evaluate(() => ({
    title: document.querySelector('.chrome-title, h1, h2')?.textContent?.trim() ?? '',
    lead: document.querySelector('.join-lead')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    error: document.querySelector('.join-error')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    back: [...document.querySelectorAll('button, a')].map((n) => n.textContent.trim()).find((t) => /Use a different/.test(t)) ?? '',
  }))
  console.log(`code screen: ${JSON.stringify(codeStep).slice(0, 190)}`)

  /* IT MUST NAME WHERE THE CODE ACTUALLY WENT. */
  const shown = wantTel ? phone : email
  const notShown = wantTel ? email : phone
  if (!codeStep.lead.includes(shown)) fails.push(`${world.name}: the code screen does not name ${shown}, the address it was sent to`)
  if (codeStep.lead.includes(notShown)) fails.push(`${world.name}: the code screen names ${notShown}, which the code was NOT sent to`)
  if (codeStep.error) {
    const blamesText = /texting is not connected/.test(codeStep.error)
    if (blamesText !== wantTel) fails.push(`${world.name}: the failure blames ${blamesText ? 'texting' : 'email'} on the ${wantTel ? 'sms' : 'email'} path`)
  }
  if (codeStep.back && /number/.test(codeStep.back) !== wantTel) fails.push(`${world.name}: "${codeStep.back}" offers the wrong field`)

  /*
    AND THEN ACTUALLY FINISH SIGNING IN — this is the half that was missing.

    The checks above stop at the code screen, which is why they passed while
    typing the RIGHT six digits still answered "Enter the 6-digit code". The
    confirm handler sent the phone field as the destination no matter which
    channel had been used, so on the email path it sent an empty string, the
    server had nothing to look the code up by, and it rejected a correct code.
    Leon hit it on 2026-09-01; Glenn had been hitting it since the 30th.

    So the real code is read out of the server's own log — for the destination
    the server SAID it used, not the one this test would have guessed — typed
    into the boxes, and confirmed. A member has to exist at the end of it.
  */
  const dest = wantTel ? phone : email
  const line = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${dest} `)).pop()
  const realCode = line?.match(/ (\d{6}) /)?.[1]
  if (!world.canFinish) {
    console.log('signed in    : not attempted — Twilio Verify owns the code in this world')
  } else if (!realCode) {
    fails.push(`${world.name}: no code was logged for ${dest}, the destination the server reported`)
  } else {
    await p.locator('.join-code').fill(realCode)
    await p.waitForTimeout(300)
    await p.locator('.join button[type=submit]').click()
    await p.waitForTimeout(2000)
    const after = await p.evaluate(async () => {
      const r = await fetch('/api/members/me', { credentials: 'same-origin' })
      return { status: r.status, body: r.ok ? await r.json() : null,
               stillOnCode: !!document.querySelector('.join-code'),
               error: document.querySelector('.join-error')?.textContent?.trim() ?? null }
    })
    console.log(`signed in    : ${after.status} ${after.body?.name ?? ''} ${after.error ? '| ' + after.error : ''}`)
    if (after.status !== 200) fails.push(`${world.name}: the RIGHT code did not sign anybody in — /api/members/me is ${after.status}${after.error ? ` and the form says "${after.error}"` : ''}`)
    if (after.stillOnCode) fails.push(`${world.name}: the right code was entered and the form is still asking for a code`)
  }

  await b.close(); srv.kill(); await TESTDB.drop?.()
}

if (fails.length) { console.log('\nFAIL: ' + fails.join('; ')); process.exit(1) }
console.log('\nPASS: the form asks for what can be delivered, and the code screen names where it went.')
