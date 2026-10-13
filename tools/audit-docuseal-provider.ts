import assert from 'node:assert/strict'
import { makeProviders } from '../server/onboarding-providers'

process.env.DOCUSEAL_API_KEY = 'test-key'
process.env.DOCUSEAL_AFFILIATE_TEMPLATE_ID = '123'
process.env.DOCUSEAL_COMPANY_EMAIL = 'glenn@beastypages.com'
const original = globalThis.fetch
let posted: any = null
let template: any = {
  submitters: [{ name: 'Affiliate', uuid: 'aff' }, { name: 'BEASTY', uuid: 'co' }],
  fields: [{ name: 'Legal Name', submitter_uuid: 'aff' }, { name: 'BEASTY Representative', submitter_uuid: 'co' }],
}
globalThis.fetch = async (_url, opts) => {
  if (opts?.method === 'GET') return Response.json(template)
  posted = JSON.parse(String(opts?.body))
  return Response.json([
    { role: 'Affiliate', submission_id: 99, slug: 'affiliate-test' },
    { role: 'BEASTY', submission_id: 99, slug: 'company-test' },
  ])
}
const input = { applicationId: 'test-app', name: 'Test Person', email: 'test@example.com', returnUrl: 'https://beastypages.com/join', prefill: { 'Legal Name': 'Test Person', 'BEASTY Representative': 'Unauthorized', Unknown: 'ignored' } }
try {
  const p = makeProviders(true)
  const signed = await p.createAgreement(input)
  assert.equal(signed.submissionRef, '99')
  assert.deepEqual(posted.submitters[0].values, { 'Legal Name': 'Test Person' })
  assert.equal(posted.order, 'preserved')
  assert.equal(posted.send_email, false)
  template = { submitters: [{ name: 'First Party', uuid: 'wrong' }], fields: [] }
  posted = null
  await assert.rejects(p.createAgreement(input), /signer roles/)
  assert.equal(posted, null, 'Do not create an envelope against the wrong template')
  globalThis.fetch = async () => new Response('{}', { status: 403 })
  await assert.rejects(p.createAgreement(input), /403/)
  console.log('PASS: role-scoped prefills, signer order, no automatic email, invalid templates refused')
} finally { globalThis.fetch = original }
