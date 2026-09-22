/*
  The period arithmetic lives in TypeScript (src/crm/periods.ts), so its test
  does too; this runs it under tsx so the full suite, which runs every
  tools/audit-*.mjs, includes it.

      node tools/audit-crm-periods.mjs
*/
import { spawnSync } from 'node:child_process'

const r = spawnSync('npx', ['tsx', 'tools/audit-crm-periods.ts'], { stdio: 'inherit' })
process.exit(r.status ?? 1)
