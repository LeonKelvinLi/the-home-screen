/*
  THE CRM, END TO END, THROUGH ITS API — on a private throwaway database.

  Every rule the CRM exists for gets a check here: a lead created from an
  existing business without duplicating it, the backfill run twice creating
  nothing the second time, locations of one business kept apart but grouped,
  referred-by / assigned-to / closed-by staying three different things, every
  stage change in the history, follow-ups surfacing as overdue, a won deal
  producing one-time revenue, MRR and ARR, a price change afterwards leaving
  that deal alone, the referral link crediting first touch through a real
  Reserve-a-spot request, a forged cookie crediting nobody, and roles enforced
  on the server for team members and referral partners.

      node tools/audit-crm.mjs
*/
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { openSync, readFileSync, rmSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('crm')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = `/tmp/audit-crm-${port}.log`
try { rmSync(LOG, { force: true }) } catch {}
const out = openSync(LOG, 'a')
const TOKEN = `op_${randomBytes(20).toString('hex')}`
const srv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['ignore', out, out],
  env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', ALLOW_MOCK_PAYMENTS: '1', OPERATOR_TOKEN: TOKEN, PASS_SECRET: `ps_${randomBytes(16).toString('hex')}`, RESEND_API_KEY: '', LEAD_EMAIL: '' },
})
const base = `http://localhost:${port}`
let up = false
for (let i = 0; i < 120; i++) { try { if ((await fetch(base + '/api/health')).ok) { up = true; break } } catch {} await new Promise((r) => setTimeout(r, 250)) }
const finish = async (code) => { srv.kill(); try { await TESTDB.drop?.() } catch {} process.exit(code) }
if (!up) { console.log('FAIL: server never came up'); console.log(readFileSync(LOG, 'utf8').slice(-2000)); await finish(1) }

/* ---- a tiny client with a cookie jar per actor ---- */
const jar = () => new Map()
async function call(method, path, { body, j, token, raw } = {}) {
  const headers = { 'content-type': 'application/json' }
  if (token) headers.authorization = `Bearer ${token}`
  if (j && j.size) headers.cookie = [...j.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
  const res = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' })
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [kv] = c.split(';'); const eq = kv.indexOf('=')
    const k = kv.slice(0, eq).trim(); const v = kv.slice(eq + 1).trim()
    if (j) { if (/Max-Age=0/i.test(c) || v === '') j.delete(k); else j.set(k, v) }
  }
  if (raw) return res
  const ct = res.headers.get('content-type') ?? ''
  return { status: res.status, body: ct.includes('json') ? await res.json() : await res.text(), headers: res.headers }
}
const results = []
const check = (name, cond, detail = '') => {
  results.push(!!cond)
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* ---- signing in ---- */
const anon = await call('GET', '/api/crm/overview')
check('no session is refused', anon.status === 401, `status ${anon.status}`)
const admin = jar()
const bad = await call('POST', '/api/crm/session', { body: { token: 'wrong-token-wrong-token' }, j: admin })
check('a wrong operator key is refused', bad.status === 401)
const good = await call('POST', '/api/crm/session', { body: { token: TOKEN }, j: admin })
check('the operator key opens a CRM session', good.status === 200 && admin.has('beasty_crm'))
const me = await call('GET', '/api/crm/me', { j: admin })
check('the session is an admin', me.body?.actor?.role === 'admin')
check('and the key acts as Glenn', me.body?.actor?.name === 'Glenn' && me.body?.actor?.personId === 'p_glenn' && me.body?.actor?.via === 'operator')

/* ---- backfill: dry run, real run, rerun ---- */
const dry = await call('POST', '/api/crm/backfill', { body: { dryRun: true }, j: admin })
check('dry run reports without writing', dry.status === 200 && dry.body.created > 40 && dry.body.createdIds.length === 0, `${dry.body.created} would be created`)
const before = await call('GET', '/api/crm/leads?limit=1', { j: admin })
check('dry run created nothing', before.body.total === 0)
const run1 = await call('POST', '/api/crm/backfill', { body: { dryRun: false }, j: admin })
check('backfill creates the website opportunities', run1.status === 200 && run1.body.created === dry.body.created, `${run1.body.created} created, ${run1.body.skippedHasSite} have a site, ${run1.body.manualReview.length} to review`)
check('Individuals go to manual review, not into the pipeline', run1.body.manualReview.some((m) => /Individuals/.test(m.reason)))
check('the backfill reports possible duplicates without merging', Array.isArray(run1.body.duplicates))
const run2 = await call('POST', '/api/crm/backfill', { body: { dryRun: false }, j: admin })
check('a second run creates nothing', run2.body.created === 0 && run2.body.skippedExisting === run1.body.created, `created ${run2.body.created}, skipped ${run2.body.skippedExisting}`)
const ovImport = await call('GET', '/api/crm/overview', { j: admin })
check('imported leads do not count as new this week', ovImport.body.counts.newThisWeek === 0 && ovImport.body.counts.total === run1.body.created + run1.body.applications.created)
const importedOnly = await call('GET', '/api/crm/leads?imported=1&limit=1', { j: admin })
check('the imported filter finds exactly the imports', importedOnly.body.total === ovImport.body.counts.total)
/* Leon's rule of 2026-09-22: every blank "who" is Glenn. */
const byGlenn = await call('GET', '/api/crm/leads?referrer=p_glenn&limit=200', { j: admin })
check('every imported lead is referred by Glenn, by default', byGlenn.body.total === ovImport.body.counts.total && byGlenn.body.leads.every((l) => l.referralDefault && l.sourceType === 'glenn'))
const unowned = await call('GET', '/api/crm/leads?assigned=none&limit=1', { j: admin })
const glennOwns = await call('GET', '/api/crm/leads?assigned=p_glenn&limit=1', { j: admin })
check('and owned by Glenn: no lead is left unassigned', unowned.body.total === 0 && glennOwns.body.total === ovImport.body.counts.total)
check('a default referral does not count as an uncontacted referral', ovImport.body.attention.find((a) => a.key === 'uncontacted_referrals')?.count === 0)
const pipe = await call('GET', '/api/crm/pipeline', { j: admin })
check('the pipeline summary counts every lead once', pipe.status === 200 && pipe.body.stages.reduce((n, st) => n + st.count, 0) === ovImport.body.counts.total)
const runs = await call('GET', '/api/crm/backfill/runs', { j: admin })
check('each run is recorded with its report', runs.body.runs?.length === 2 && runs.body.runs[0].report)

/* ---- multi-location ---- */
const tacos = await call('GET', '/api/crm/leads?family=tacos-mi-reynita', { j: admin })
check('four Tacos Mi Reynita locations stay four opportunities', tacos.body.total === 4, tacos.body.leads.map((l) => l.city).join(', '))
const yummy = await call('GET', '/api/crm/leads?family=yummy-yummy-hibachi', { j: admin })
check('three Yummy Yummy Hibachi locations stay three', yummy.body.total === 3)
const fam = await call('GET', '/api/crm/businesses?q=tacos%20mi', { j: admin })
check('the business view rolls the family up', fam.body.families?.[0]?.locations === 4)

/* ---- one lead through the whole pipeline: Jazz Braids ---- */
const found = await call('GET', '/api/crm/leads?q=jazz%20braids', { j: admin })
const jazz = found.body.leads.find((l) => l.brandId === 'b_jazzbraids')
check('search finds Jazz Braids', !!jazz)
const ref = await call('POST', `/api/crm/leads/${jazz.id}/referral`, { body: { referrerId: 'p_janelle', note: 'Janelle brought them' }, j: admin })
check('Janelle is recorded as the referrer, replacing the Glenn default with no override', ref.status === 200)
let refs = await call('GET', '/api/crm/referrers?period=all', { j: admin })
const janelle0 = refs.body.referrers.find((r) => r.id === 'p_janelle')
check("Janelle's dashboard shows one referral", janelle0?.leads === 1)
await call('PATCH', `/api/crm/leads/${jazz.id}`, { body: { assignedTo: 'p_leon' }, j: admin })
let d = await call('GET', `/api/crm/leads/${jazz.id}`, { j: admin })
check('assigning Leon leaves the referrer alone', d.body.lead.assignee?.id === 'p_leon' && d.body.lead.referrer?.id === 'p_janelle')
const again = await call('POST', `/api/crm/leads/${jazz.id}/referral`, { body: { referrerId: 'p_leon' }, j: admin })
check('the original referral cannot be silently replaced', again.status === 409)
for (const s of ['contacted', 'replied', 'interested', 'proposal_sent']) await call('POST', `/api/crm/leads/${jazz.id}/stage`, { body: { stage: s }, j: admin })
const deal = await call('POST', `/api/crm/leads/${jazz.id}/deals`, { body: { offerId: 'website_beasty_year' }, j: admin })
check('a $199 Website + BEASTY deal is quoted', deal.status === 201)
const won = await call('POST', `/api/crm/deals/${deal.body.id}/won`, { body: { closedBy: 'p_glenn' }, j: admin })
check('the deal is won', won.status === 200)
d = await call('GET', `/api/crm/leads/${jazz.id}`, { j: admin })
const hist = d.body.history.map((h) => h.to_stage)
check('every transition is in the history', JSON.stringify(hist.slice(1)) === JSON.stringify(['contacted', 'replied', 'interested', 'proposal_sent', 'won']), hist.join(' → '))
check('each history row starts where the last ended', d.body.history.every((h, i) => i === 0 || h.from_stage === d.body.history[i - 1].to_stage))
check('referred by, assigned to and closed by are three people', d.body.lead.referrer?.id === 'p_janelle' && d.body.lead.assignee?.id === 'p_leon' && d.body.lead.closedBy?.id === 'p_glenn')
check('the timeline records the stage changes and the win', d.body.activities.filter((a) => a.type === 'STAGE_CHANGE').length === 5 && d.body.activities.some((a) => a.type === 'DEAL_WON'))
check('what the key did reads as Glenn in the timeline', d.body.activities.filter((a) => a.type === 'STAGE_CHANGE').every((a) => a.actor === 'Glenn'))
const replaced = d.body.activities.find((a) => a.type === 'REFERRAL' && a.data?.replacedDefault)
check('the log keeps that Glenn was the default before Janelle', replaced?.data?.previous?.referrerId === 'p_glenn')
let rev = await call('GET', '/api/crm/revenue?period=all', { j: admin })
check('one-time revenue is $199', rev.body.oneTimeCents === 19900)
check('MRR is $30 and ARR $360', rev.body.mrrCents === 3000 && rev.body.arrCents === 36000)
refs = await call('GET', '/api/crm/referrers?period=all', { j: admin })
const janelle = refs.body.referrers.find((r) => r.id === 'p_janelle')
check("Janelle's numbers follow the sale", janelle.contacted === 1 && janelle.replied === 1 && janelle.interested === 1 && janelle.proposals === 1 && janelle.won === 1 && janelle.oneTimeCents === 19900 && janelle.mrrCents === 3000 && janelle.conversion === 1)
const jd = await call('GET', '/api/crm/referrers/p_janelle?period=all', { j: admin })
check("Janelle's page lists Jazz Braids and its deal", jd.body.businesses.some((b) => b.brandId === 'b_jazzbraids' && b.deal?.status === 'won'))
check('revenue breaks down by referrer and salesperson', rev.body.byReferrer.some((r) => r.label === 'Janelle' && r.oneTimeCents === 19900) && rev.body.bySalesperson.some((r) => r.label === 'Glenn'))

/* ---- price change afterwards ---- */
const price = await call('PATCH', '/api/crm/offers/website_beasty_year', { body: { oneTimeCents: 24900 }, j: admin })
check('the offer price can change', price.status === 200)
rev = await call('GET', '/api/crm/revenue?period=all', { j: admin })
d = await call('GET', `/api/crm/leads/${jazz.id}`, { j: admin })
check('the old deal keeps its $199', rev.body.oneTimeCents === 19900 && d.body.deals[0].soldCents === 19900 && d.body.deals[0].quotedCents === 19900)
const shaka = (await call('GET', '/api/crm/leads?q=shaka%20shack', { j: admin })).body.leads[0]
const deal2 = await call('POST', `/api/crm/leads/${shaka.id}/deals`, { body: { offerId: 'website_beasty_year' }, j: admin })
const d2 = await call('GET', `/api/crm/leads/${shaka.id}`, { j: admin })
check('a new quote uses the new price', deal2.status === 201 && d2.body.deals[0].quotedCents === 24900)
await call('PATCH', '/api/crm/offers/website_beasty_year', { body: { oneTimeCents: 19900 }, j: admin })

/* ---- follow-ups and the attention queue ---- */
const fu = await call('POST', `/api/crm/leads/${shaka.id}/followups`, { body: { dueAt: Date.now() - 864e5, type: 'call', notes: 'Call about the site', ownerId: 'p_leon' }, j: admin })
check('a follow-up can be scheduled', fu.status === 201)
let ov = await call('GET', '/api/crm/overview', { j: admin })
const overdue = ov.body.attention.find((a) => a.key === 'overdue')
check('an overdue follow-up shows under Needs Attention', overdue?.count >= 1)
const ovList = await call('GET', '/api/crm/followups?view=overdue', { j: admin })
check('and in the overdue list', ovList.body.followups?.some((f) => f.id === fu.body.id))
const filtered = await call('GET', '/api/crm/leads?attention=overdue', { j: admin })
check('clicking it filters to that lead', filtered.body.leads.some((l) => l.id === shaka.id))
const fu2 = await call('POST', `/api/crm/leads/${shaka.id}/followups`, { body: { dueAt: Date.now() + 3 * 864e5, type: 'text' }, j: admin })
const shakaD = await call('GET', `/api/crm/leads/${shaka.id}`, { j: admin })
check('a follow-up with no owner named is Glenn\'s', shakaD.body.followups.find((f) => f.id === fu2.body.id)?.owner?.id === 'p_glenn')
await call('POST', `/api/crm/followups/${fu2.body.id}/complete`, { body: {}, j: admin })
const done = await call('POST', `/api/crm/followups/${fu.body.id}/complete`, { body: { outcome: 'Left a voicemail' }, j: admin })
d = await call('GET', `/api/crm/leads/${shaka.id}`, { j: admin })
check('completing it clears the next follow-up', done.status === 200 && d.body.lead.nextFollowupAt === null)
await call('POST', `/api/crm/leads/${shaka.id}/stage`, { body: { stage: 'interested' }, j: admin })
ov = await call('GET', '/api/crm/overview', { j: admin })
check('an interested lead with no next action is flagged', ov.body.attention.find((a) => a.key === 'interested_no_next')?.count >= 1)

/* ---- search and filters ---- */
const emails = await call('GET', '/api/crm/leads?hasEmail=1&limit=200', { j: admin })
check('the has-email filter only returns leads with an email', emails.body.total > 0 && emails.body.leads.every((l) => l.channels.email))
const missing = await call('GET', '/api/crm/leads?attention=missing_contact&limit=200', { j: admin })
check('missing contact means no phone, email or Instagram', missing.body.leads.every((l) => !l.channels.phone && !l.channels.email && !l.channels.instagram))

/* ---- contact details the team finds ---- */
const lost = missing.body.leads.find((l) => l.stage === 'need_contact_info')
const missingBefore = missing.body.total
const foundRes = await call('PATCH', `/api/crm/leads/${lost.id}`, { body: { phone: '(510) 555-0142' }, j: admin })
check('a phone the team found is saved on the lead', foundRes.status === 200 && foundRes.body.lead.channels.phone === '5105550142' && foundRes.body.lead.found.phone === '5105550142', `${foundRes.status} ${lost.name}`)
check('and a lead that was waiting for contact details moves on to Ready to contact', foundRes.body.lead.stage === 'ready_to_contact' && foundRes.body.history.at(-1)?.note === 'Contact details found')
check('the find is in its timeline', foundRes.body.activities.some((a) => a.type === 'SYSTEM' && /Contact details found: phone/.test(a.body ?? '')))
const missingAfter = await call('GET', '/api/crm/leads?attention=missing_contact&limit=1', { j: admin })
check('it leaves the missing-contact list', missingAfter.body.total === missingBefore - 1, `${missingBefore} → ${missingAfter.body.total}`)
check('the has-phone filter and search both see the found number', (await call('GET', '/api/crm/leads?hasPhone=1&limit=500', { j: admin })).body.leads.some((l) => l.id === lost.id) && (await call('GET', '/api/crm/leads?q=5550142', { j: admin })).body.leads.some((l) => l.id === lost.id))
const badPhone = await call('PATCH', `/api/crm/leads/${lost.id}`, { body: { phone: 'call me maybe' }, j: admin })
check('something that is not a phone number is refused, not stored', badPhone.status === 400)
{
  const { execFileSync } = await import('node:child_process')
  execFileSync('npx', ['tsx', '-e', "import { syncSnapshots } from './server/crm/backfill'; syncSnapshots().then(() => process.exit(0), (e) => { console.error(e); process.exit(1) })"], { encoding: 'utf8', env: { ...process.env, DATABASE_URL: TESTDB.url } })
  const kept = await call('GET', `/api/crm/leads/${lost.id}`, { j: admin })
  check('the listing refresh that runs at every boot leaves a found number alone', kept.body.lead.channels.phone === '5105550142' && kept.body.lead.found.phone === '5105550142')
}
const wonList = await call('GET', '/api/crm/leads?stage=won', { j: admin })
check('the stage filter works', wonList.body.leads.some((l) => l.id === jazz.id))
const gs = await call('GET', '/api/crm/search?q=janelle', { j: admin })
check('global search reaches a referrer', gs.body.people.some((p) => p.id === 'p_janelle'))
const byPhone = await call('GET', `/api/crm/leads?q=${encodeURIComponent('894-3975'.replace('-', ''))}`, { j: admin })
check('search matches a phone number', byPhone.body.leads.some((l) => l.id === jazz.id))
const byFormatted = await call('GET', `/api/crm/leads?q=${encodeURIComponent('894-3975')}`, { j: admin })
check('and the same number typed with a dash', byFormatted.body.leads.some((l) => l.id === jazz.id))
const byGlobal = await call('GET', `/api/crm/search?q=${encodeURIComponent('894-3975')}`, { j: admin })
check('global search reads it the same way', byGlobal.body.leads.some((l) => l.id === jazz.id))

/* ---- duplicates ---- */
const dupName = await call('POST', '/api/crm/leads', { body: { businessName: 'Jazz Braids', opportunityType: 'website' }, j: admin })
check('a prospect matching a listed business is refused with the match', dupName.status === 409 && dupName.body.candidates?.listed?.some((c) => c.brandId === 'b_jazzbraids'))
const dupOpp = await call('POST', '/api/crm/leads', { body: { brandId: 'b_jazzbraids', opportunityType: 'website' }, j: admin })
check('a second website opportunity for one business is refused', dupOpp.status === 409)
const seo = await call('POST', '/api/crm/leads', { body: { brandId: 'b_jazzbraids', opportunityType: 'seo' }, j: admin })
check('a different kind of opportunity for it is allowed', seo.status === 201)
const prospect = await call('POST', '/api/crm/leads', { body: { businessName: 'Totally New Test Cafe', phone: '(510) 555-0199', opportunityType: 'website', referrerId: 'p_janelle' }, j: admin })
check('a new prospect can be added', prospect.status === 201)
const ovNew = await call('GET', '/api/crm/overview', { j: admin })
check('leads added by hand count as new this week', ovNew.body.counts.newThisWeek === 2, `${ovNew.body.counts.newThisWeek}`)

/* ---- the referral link, through a real Reserve-a-spot request ---- */
const visitor = jar()
const r1 = await call('GET', '/r/janelle', { j: visitor, raw: true })
check('the referral link redirects to the page that sells a tile', r1.status === 302 && r1.headers.get('location') === '/money')
const cookie1 = visitor.get('beasty_crm_ref')
await call('GET', '/r/leon?via=qr', { j: visitor, raw: true })
check('a second link does not replace the first', visitor.get('beasty_crm_ref') === cookie1)
const ap = await call('POST', '/api/applications', { body: { business: 'Referral Test Bakery', contact: 'owner@referral-test.invalid', city: 'Oakland' }, j: visitor })
check('the visitor sends a Reserve-a-spot request', ap.status === 201)
await sleep(800)
const refLead = (await call('GET', '/api/crm/leads?q=referral%20test%20bakery', { j: admin })).body.leads[0]
check('it becomes a lead credited to Janelle by referral link', refLead?.referrer?.id === 'p_janelle' && refLead?.sourceType === 'referral_link' && refLead?.opportunityType === 'beasty_program')
refs = await call('GET', '/api/crm/referrers?period=all', { j: admin })
check('both clicks are counted', refs.body.referrers.find((r) => r.id === 'p_janelle').visits >= 1 && refs.body.referrers.find((r) => r.id === 'p_leon').visits >= 1)
const forged = jar()
forged.set('beasty_crm_ref', `p_leon.${Date.now()}.referral_link..abcdefghijkl.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`)
await call('POST', '/api/applications', { body: { business: 'Forged Cookie Diner', contact: '5105550142' }, j: forged })
await sleep(800)
const fLead = (await call('GET', '/api/crm/leads?q=forged%20cookie', { j: admin })).body.leads[0]
check('a forged referral cookie credits nobody', fLead && !fLead.referrer && fLead.sourceType === 'organic')

/* ---- roles, enforced on the server ---- */
async function member(name, email) {
  const j = jar()
  await call('POST', '/api/members/start', { body: { name, email }, j })
  let code
  for (let i = 0; i < 20 && !code; i++) {
    await sleep(250)
    const line = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()
    code = line?.match(/ (\d{6}) /)?.[1]
  }
  const v = await call('POST', '/api/members/verify', { body: { email, code }, j })
  return { j, ok: v.status < 300 && j.has('beasty_member'), status: v.status }
}
const team = await member('Janelle Test', `janelle-${port}@example.invalid`)
check('a member can sign in', team.ok, `verify answered ${team.status}`)
const notLinked = await call('GET', '/api/crm/overview', { j: team.j })
check('a member with no CRM role is refused', notLinked.status === 401)
await call('PATCH', '/api/crm/people/p_janelle', { body: { memberEmail: `janelle-${port}@example.invalid` }, j: admin })
const teamOk = await call('GET', '/api/crm/overview', { j: team.j })
check('linked as team, Janelle can work leads', teamOk.status === 200)
const teamOffer = await call('PATCH', '/api/crm/offers/seo', { body: { oneTimeCents: 1 }, j: team.j })
check('a team member cannot change prices', teamOffer.status === 403)
const teamBackfill = await call('POST', '/api/crm/backfill', { body: { dryRun: true }, j: team.j })
check('or run the backfill', teamBackfill.status === 403)
const teamOverride = await call('POST', `/api/crm/leads/${jazz.id}/referral`, { body: { referrerId: 'p_leon', override: true, reason: 'I think Leon found them' }, j: team.j })
check('or override an attribution', teamOverride.status === 409)
const aDefault = (await call('GET', '/api/crm/leads?referrer=p_glenn&limit=1&sort=name', { j: admin })).body.leads.find((l) => l.referralDefault)
const teamReplace = await call('POST', `/api/crm/leads/${aDefault.id}/referral`, { body: { referrerId: 'p_leon' }, j: team.j })
check('but the team can replace a Glenn default with the real referrer', teamReplace.status === 200)
const teamAgain = await call('POST', `/api/crm/leads/${aDefault.id}/referral`, { body: { referrerId: 'p_janelle' }, j: team.j })
check('once: after that the first real referrer stands', teamAgain.status === 409)
const noReason = await call('POST', `/api/crm/leads/${refLead.id}/referral`, { body: { referrerId: 'p_leon', override: true }, j: admin })
check('an admin override needs a reason', noReason.status === 400)
const withReason = await call('POST', `/api/crm/leads/${refLead.id}/referral`, { body: { referrerId: 'p_leon', override: true, reason: 'Test of the override path' }, j: admin })
const rd = await call('GET', `/api/crm/leads/${refLead.id}`, { j: admin })
const overrideAct = rd.body.activities.find((a) => a.type === 'REFERRAL' && a.data?.override)
check('an admin override is recorded with the previous source', withReason.status === 200 && overrideAct?.data?.previous?.referrerId === 'p_janelle')
const partnerM = await member('Pat Partner', `partner-${port}@example.invalid`)
const addP = await call('POST', '/api/crm/people', { body: { name: 'Pat Partner', slug: 'pat-partner', sourceType: 'influencer', role: 'partner', memberEmail: `partner-${port}@example.invalid` }, j: admin })
check('an admin can add a referral partner', addP.status === 201)
await call('POST', `/api/crm/leads/${prospect.body.id}/referral`, { body: { referrerId: addP.body.id, override: true, reason: 'Partner test' }, j: admin })
const pLeads = await call('GET', '/api/crm/leads', { j: partnerM.j })
check('a partner cannot see the lead list', pLeads.status === 403)
const pDetail = await call('GET', `/api/crm/leads/${jazz.id}`, { j: partnerM.j })
check('or anyone else’s lead', pDetail.status === 403)
const pMe = await call('GET', '/api/crm/partner/me', { j: partnerM.j })
const keys = new Set((pMe.body.businesses ?? []).flatMap((b) => Object.keys(b)))
check('a partner sees their own referrals only', pMe.status === 200 && pMe.body.businesses.length === 1 && pMe.body.businesses[0].name === 'Totally New Test Cafe')
check('with no contact details, notes or prices', [...keys].every((k) => ['name', 'city', 'status'].includes(k)))
const pQr = await call('GET', `/api/crm/people/${addP.body.id}/qr.svg`, { j: partnerM.j })
check('a partner can print their own QR code', pQr.status === 200 && String(pQr.body).includes('<svg'))
const pQrOther = await call('GET', '/api/crm/people/p_janelle/qr.svg', { j: partnerM.j })
check('but not anyone else’s', pQrOther.status === 403)
const teamQr = await call('GET', '/api/crm/people/p_janelle/qr.svg', { j: team.j })
check('the team can print any referrer’s code', teamQr.status === 200)
const anonQr = await call('GET', '/api/crm/people/p_janelle/qr.svg')
check('and nobody signed out can', anonQr.status === 401)

/* ---- open mode: no key, everyone is Glenn, and never in production ---- */
const { execFileSync } = await import('node:child_process')
const guard = execFileSync('npx', ['tsx', '-e', "import { crmOpenMode } from './server/crm/open'; console.log(JSON.stringify([crmOpenMode({ CRM_OPEN: '1' }, false), crmOpenMode({ CRM_OPEN: '1' }, true), crmOpenMode({}, false)]))"], { encoding: 'utf8' }).trim().split('\n').pop()
check('open mode is honoured outside production only', guard === '[true,false,false]', guard)
const openPort = await freePort()
const openDb = await freshTestDb('crmopen')
const openLog = openSync(`/tmp/audit-crm-open-${openPort}.log`, 'a')
const openSrv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['ignore', openLog, openLog],
  env: { ...process.env, PORT: String(openPort), DATABASE_URL: openDb.url, NODE_ENV: 'development', CRM_OPEN: '1', OPERATOR_TOKEN: TOKEN, PASS_SECRET: `ps_${randomBytes(16).toString('hex')}`, RESEND_API_KEY: '', LEAD_EMAIL: '' },
})
let openUp = false
for (let i = 0; i < 120 && !openUp; i++) { try { openUp = (await fetch(`http://localhost:${openPort}/api/health`)).ok } catch {} if (!openUp) await sleep(250) }
const openMe = openUp ? await (await fetch(`http://localhost:${openPort}/api/crm/me`)).json() : null
const openOv = openUp ? (await fetch(`http://localhost:${openPort}/api/crm/overview`)).status : 0
check('in open mode, /crm needs no key and everyone is Glenn', openMe?.actor?.name === 'Glenn' && openMe?.actor?.via === 'open' && openOv === 200, JSON.stringify(openMe?.actor ?? null))
openSrv.kill()
try { await openDb.drop?.() } catch {}

/* ---- the screen is served and kept out of search ---- */
const page = await call('GET', '/crm', { raw: true })
check('/crm serves the app and asks not to be indexed', page.status === 200 && /noindex/.test(page.headers.get('x-robots-tag') ?? ''))

const failed = results.filter((x) => !x).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
if (failed) { console.log('FAIL'); console.log(readFileSync(LOG, 'utf8').split('\n').filter((l) => /error|Error/.test(l)).slice(-15).join('\n')); await finish(1) }
console.log('\nPASS: CRM attribution, pipeline, revenue, backfill and roles hold end to end.')
await finish(0)
