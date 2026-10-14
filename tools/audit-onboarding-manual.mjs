/* Free DocuSeal handoff, synthetic data, isolated Postgres, no vendor calls. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { openSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import pg from 'pg'
import { freshTestDb } from './pgtest.mjs'

const testdb = await freshTestDb('manual_signing')
const listener = createServer()
await new Promise(r => listener.listen(0, '127.0.0.1', r))
const port = listener.address().port
await new Promise(r => listener.close(r))
mkdirSync('.verify', { recursive: true })
const log = `.verify/manual-${port}.log`
const operator = `op_${randomBytes(16).toString('hex')}`
const server = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  detached: true, stdio: ['ignore', openSync(log, 'w'), openSync(log, 'a')],
  env: { ...process.env, PORT: String(port), DATABASE_URL: testdb.url,
    NODE_ENV: 'development', OPERATOR_TOKEN: operator, RESEND_API_KEY: '',
    LEAD_EMAIL: '', AFFILIATE_PROVIDERS: '', AFFILIATE_SIGNING: 'manual',
    AFFILIATE_PAYOUTS: '', DOCUSEAL_API_KEY: '', DOCUSEAL_AFFILIATE_TEMPLATE_ID: '',
    DOCUSEAL_MANUAL_TEMPLATE_ID: '7777777', CRM_MEMBER_SIGNIN: '1' },
})
const base = `http://localhost:${port}`
const database = new pg.Client({ connectionString: testdb.url })
let count = 0
const check = (name, actual) => { assert.ok(actual, name); count++; console.log('PASS:', name) }
let personNumber = 20
function person() {
  const cookies = new Map(); const ip = `10.8.0.${personNumber++}`
  return {
    cookies,
    async call(method, path, body) {
      const response = await fetch(base + path, { method, redirect: 'manual',
        headers: { 'x-forwarded-for': ip,
          cookie: [...cookies].map(([k,v]) => `${k}=${v}`).join('; '),
          ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
        body: body === undefined ? undefined : JSON.stringify(body) })
      for (const raw of response.headers.getSetCookie()) {
        const [pair] = raw.split(';'); const i = pair.indexOf('=')
        cookies.set(pair.slice(0,i), pair.slice(i+1))
      }
      const text = await response.text()
      let data; try { data = JSON.parse(text) } catch {}
      return { status: response.status, data, text, headers: response.headers }
    },
  }
}
async function signIn(p, email, name) {
  await p.call('POST', '/api/members/start', { email, name })
  let code
  for (let i=0;i<40;i++) {
    code = readFileSync(log,'utf8').split('\n').filter(l=>l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]
    if (code) break
    await new Promise(r=>setTimeout(r,100))
  }
  const verified = await p.call('POST','/api/members/verify',{email,code})
  check(`${name} signs in`, verified.status>=200 && verified.status<300)
}

try {
  let ready = false
  for(let i=0;i<160;i++) {
    try { ready=(await fetch(base+'/api/health')).ok } catch {}
    if(ready) break
    await new Promise(r=>setTimeout(r,200))
  }
  check('server starts', ready)
  await database.connect()
  const anon=person(), admin=person(), affiliate=person(), other=person(), team=person()
  const setup=(await anon.call('GET','/api/onboarding/setup')).data
  check('free handoff is enabled without an API key', setup.signing && setup.signingMode==='manual' && !setup.payouts)
  check('operator signs into CRM', (await admin.call('POST','/api/crm/session',{token:operator})).status===200)
  const email=`manual-${port}@example.invalid`
  const invite=await admin.call('POST','/api/crm/onboarding/invites',{name:'Manual QA',email})
  check('invite persists when email is not configured', invite.status===201 && invite.data.emailStatus==='not_configured')
  await signIn(affiliate,email,'Manual QA')
  const redeemed=await affiliate.call('POST',`/api/onboarding/invite/${invite.data.link.split('/join/')[1]}/redeem`)
  check('invite becomes this member’s application', redeemed.status===201)
  const appId=redeemed.data.id, path=`/api/crm/onboarding/${appId}`
  check('packet waits for complete details', (await affiliate.call('POST','/api/onboarding/me/agreement/sign')).status===409)
  const profile={legalFirst:'Manual',legalLast:'QA',email,phone:'5105550142',line1:'100 Example St',city:'Oakland',state:'CA',zip:'94612',kind:'individual',promote:['instagram']}
  check('profile saves', (await affiliate.call('PUT','/api/onboarding/me/profile',{revision:redeemed.data.revision,profile})).status===200)
  const requests=await Promise.all([affiliate.call('POST','/api/onboarding/me/agreement/sign'),affiliate.call('POST','/api/onboarding/me/agreement/sign')])
  check('concurrent packet requests are harmless', requests.every(r=>r.status===200 && r.data.requested))
  check('one requested packet is created', Number((await database.query('SELECT count(*) FROM onboarding_documents WHERE application_id=$1',[appId])).rows[0].count)===1)
  check('details can be submitted while Glenn prepares the packet', (await affiliate.call('POST','/api/onboarding/me/submit')).status===200)
  check('approval is blocked before packet review', (await admin.call('POST',path+'/decision',{action:'approve'})).status===409)
  let detail=(await admin.call('GET',path)).data
  check('CRM explains the manual handoff', detail.manualPacket && detail.steps.agreement.mode==='manual' && detail.manualPacket.approvedTemplateUrl.endsWith('/7777777'))
  const packet={revision:detail.manualPacket.revision,submissionUrl:'https://docuseal.com/submissions/8888888',affiliateUrl:'https://docuseal.com/s/TESTaffiliate012345',companyUrl:'https://docuseal.com/s/TESTcompany012345',templateVersion:'7777777',termsApproved:true,recipientConfirmed:true}
  check('unauthenticated callers cannot attach links', (await anon.call('POST',path+'/packet',packet)).status===401)
  check('an applicant cannot attach their own links', (await affiliate.call('POST',path+'/packet',packet)).status===401)
  check('unapproved template is refused', (await admin.call('POST',path+'/packet',{...packet,templateVersion:'6399497'})).status===409)
  check('recipient confirmation is required', (await admin.call('POST',path+'/packet',{...packet,recipientConfirmed:false})).status===400)
  check('unapproved terms are refused', (await admin.call('POST',path+'/packet',{...packet,termsApproved:false})).status===400)
  for(const bad of ['https://docuseal.com.evil.invalid/s/TESTaffiliate012345','https://docuseal.com@evil.invalid/s/TESTaffiliate012345','http://docuseal.com/s/TESTaffiliate012345','https://docuseal.com/s/TESTaffiliate012345?leak=1','javascript:alert(1)']) {
    check('untrusted signing URL is refused', (await admin.call('POST',path+'/packet',{...packet,affiliateUrl:bad})).status===400)
  }
  check('two roles cannot share a signing link', (await admin.call('POST',path+'/packet',{...packet,companyUrl:packet.affiliateUrl})).status===400)
  const attached=await admin.call('POST',path+'/packet',packet)
  check('admin attaches the request and sees notification failure accurately', attached.status===200 && attached.data.emailStatus==='not_configured')
  check('stale attach cannot overwrite it', (await admin.call('POST',path+'/packet',packet)).status===409)
  const mine=(await affiliate.call('GET','/api/onboarding/me')).data
  check('portal does not expose company link or DocuSeal account reference', !JSON.stringify(mine).includes(packet.companyUrl) && !JSON.stringify(mine).includes('8888888'))
  check('affiliate opens their own link', (await affiliate.call('POST','/api/onboarding/me/agreement/sign')).data.url===packet.affiliateUrl)
  await signIn(other,`other-${port}@example.invalid`,'Other QA')
  check('another member cannot open this packet', (await other.call('POST','/api/onboarding/me/agreement/sign')).status===404)
  check('an unfinished packet has no completed copy', (await affiliate.call('GET','/api/onboarding/me/agreement.pdf')).status===404)
  const review=await affiliate.call('POST','/api/onboarding/me/agreement/review')
  check('applicant can request review without claiming signatures', review.status===200 && !review.data.steps.agreement.affiliateSigned && review.data.steps.agreement.status==='pending_review')
  await affiliate.call('POST','/api/onboarding/me/agreement/review')
  check('review requests are idempotent', Number((await database.query("SELECT count(*) FROM onboarding_events WHERE application_id=$1 AND kind='packet_review_requested'",[appId])).rows[0].count)===1)
  detail=(await admin.call('GET',path)).data
  const evidence={revision:detail.manualPacket.revision,affiliateSigned:true,companySigned:false,taxComplete:true,bankComplete:true,idUploaded:true,auditReviewed:true}
  check('a missing ID blocks verification', (await admin.call('POST',path+'/packet/verify',{...evidence,idUploaded:false})).status===400)
  const verified=await admin.call('POST',path+'/packet/verify',evidence)
  check('operator records reviewed affiliate signature', verified.status===200)
  detail=(await admin.call('GET',path)).data
  check('verified packet waits for company signature', detail.steps.agreement.affiliateSigned && !detail.steps.agreement.countersigned && detail.countersignAvailable)
  check('admin opens BEASTY’s separate signing link', (await admin.call('POST',path+'/countersign')).data.url===packet.companyUrl)
  check('approval still waits for company signature', (await admin.call('POST',path+'/decision',{action:'approve'})).status===409)
  check('old review cannot overwrite newer evidence', (await admin.call('POST',path+'/packet/verify',evidence)).status===409)
  check('admin records completed packet after checking both signatures', (await admin.call('POST',path+'/packet/verify',{...evidence,revision:detail.manualPacket.revision,companySigned:true})).status===200)
  check('refresh preserves manual evidence without a provider call', (await affiliate.call('GET','/api/onboarding/me?refresh=1')).data.steps.agreement.countersigned)
  const completed=await affiliate.call('GET','/api/onboarding/me/agreement.pdf')
  check('signed packet opens the owner’s DocuSeal completion page', completed.status===302 && completed.headers.get('location')===packet.affiliateUrl)
  check('admin can approve after verification', (await admin.call('POST',path+'/decision',{action:'approve'})).status===200)
  detail=(await admin.call('GET',path)).data
  check('verification actor and checklist remain on record', detail.manualPacket.verifiedBy && detail.manualPacket.evidence.idUploaded && detail.events.some(e=>e.kind==='packet_verified'))
  check('approved packet cannot be replaced', (await admin.call('POST',path+'/packet',{...packet,revision:detail.manualPacket.revision})).status===409)
  await signIn(team,`team-${port}@example.invalid`,'Team QA')
  const memberRow=(await database.query('SELECT id FROM members WHERE email=$1',[`team-${port}@example.invalid`])).rows[0]
  await database.query("UPDATE crm_people SET member_id=$1 WHERE id='p_janelle'",[memberRow.id])
  check('team can see progress but not private signing links', (await team.call('GET',path)).data.manualPacket===null)
  check('team cannot verify signatures', (await team.call('POST',path+'/packet/verify',evidence)).status===403)
  console.log(`PASS: ${count} manual handoff checks`)
  if(process.argv.includes('--serve')) {
    writeFileSync('.verify/manual-browser-qa.json',JSON.stringify({base,pid:server.pid,database:testdb.name,operator,email,appId,inviteLink:invite.data.link,profile}),{mode:0o600})
    console.log('Chrome QA fixture ready at '+base+'/crm#/affiliates')
    await new Promise(()=>{})
  }
} finally {
  try { process.kill(-server.pid,'SIGTERM') } catch {}
  await database.end().catch(()=>{})
  await testdb.drop()
}
