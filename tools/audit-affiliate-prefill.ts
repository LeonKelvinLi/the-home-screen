import assert from 'node:assert/strict'
import { onboardingPrefill } from '../shared/onboarding-prefill'

const profile = { legalFirst: 'Example', legalLast: 'Affiliate', kind: 'business', businessName: 'Example Studio', email: 'example@example.invalid', phone: '5105550142', line1: '100 Example St', line2: 'Suite 2', city: 'Oakland', state: 'ca', zip: '94612', ssn: 'MUST NOT COPY', accountNumber: 'MUST NOT COPY', idPhoto: 'MUST NOT COPY', signature: 'MUST NOT COPY' }
const values = onboardingPrefill(profile)
assert.equal(values['Legal Name'], 'Example Affiliate')
assert.equal(values['ID Legal Name'], 'Example Affiliate')
assert.equal(values['Affiliate Legal Name'], 'Example Studio')
assert.equal(values['Taxpayer Legal Name'], '')
assert.equal(values['Business Name'], 'Example Studio')
assert.equal(values['Street Address'], '100 Example St, Suite 2')
assert.equal(values['City State ZIP'], 'Oakland, CA 94612')
assert.equal(values.Address, '100 Example St, Suite 2, Oakland, ca 94612')
assert.equal(values.Email, profile.email)
assert.equal(values.Phone, profile.phone)
assert.ok(!JSON.stringify(values).includes('MUST NOT COPY'))
assert.ok(!Object.keys(values).some(key => /classification|signature|signing date|security|routing|account number|id photo/i.test(key)))
assert.equal(onboardingPrefill({ ...profile, kind: 'individual' })['Business Name'], '')
assert.equal(onboardingPrefill({ ...profile, kind: 'individual' })['Taxpayer Legal Name'], 'Example Affiliate')
assert.ok(Object.values(onboardingPrefill({})).every(value => value === ''))
console.log('PASS: known profile details reused; sensitive values and classifications excluded.')
