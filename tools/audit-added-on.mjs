/*
  Every business on BEASTY has the day it went up (src/data/addedOn.ts), so the
  CRM's "Businesses added to BEASTY" and "Leads added" follow what was added.
  A batch that forgets `npx tsx tools/added-on.ts` fails here, before deploy.
*/
import { execFileSync } from 'node:child_process'
import { TSX } from './bin.mjs'
const out = execFileSync(process.execPath, [TSX, '-e', `
import { seatedBusinesses } from './server/crm/directory'
import { ADDED_ON } from './src/data/addedOn'
const missing = seatedBusinesses().filter((b) => !b.isCreator && !ADDED_ON[b.id]).map((b) => b.id)
console.log(JSON.stringify(missing))
`], { encoding: 'utf8', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'postgres://unused' } })
const missing = JSON.parse(out.trim().split('\n').pop())
if (missing.length) {
  console.log(`FAIL: ${missing.length} businesses on BEASTY have no added date: ${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ' …' : ''}`)
  console.log('Run: npx tsx tools/added-on.ts')
  process.exit(1)
}
console.log('PASS: every business on BEASTY has the day it went up, so the CRM counts it.')
