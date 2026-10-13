import assert from 'node:assert/strict'
import { sendEmail } from '../server/email'

process.env.RESEND_API_KEY = 'test-key'
process.env.OTP_FROM_EMAIL = 'BEASTY <hello@beastypages.com>'
const original = globalThis.fetch
const error = console.error
console.error = () => {}
try {
  globalThis.fetch = async () => new Response('{"id":"email-test"}', { status: 200 })
  assert.equal(await sendEmail('test@example.com', 'Invite', 'Test'), 'accepted')
  globalThis.fetch = async () => new Response('{}', { status: 403 })
  assert.equal(await sendEmail('test@example.com', 'Invite', 'Test'), 'failed')
  globalThis.fetch = async () => { throw new Error('timeout') }
  assert.equal(await sendEmail('test@example.com', 'Invite', 'Test'), 'failed')
  delete process.env.RESEND_API_KEY
  assert.equal(await sendEmail('test@example.com', 'Invite', 'Test'), 'not_configured')
  console.log('PASS: accepted, rejected, network failure and missing email configuration')
} finally {
  globalThis.fetch = original
  console.error = error
}
