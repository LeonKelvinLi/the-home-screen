/*
  The Schedule A page for the DocuSeal affiliate packet.

    node --import tsx tools/build-affiliate-schedule-a.ts [--terms terms.json]

  --terms takes a Terms JSON (a published version from the CRM); without it the
  defaults in shared/affiliate-terms.ts are used. The money terms are BEASTY's,
  so they print as text; the page has two fields only:

    Schedule A Changes    BEASTY prefills it (read-only to the Affiliate):
                          "None", or this affiliate's changes from the CRM.
    Schedule A Initials   the Affiliate's initials (set its type to Initials
                          in DocuSeal; a PDF cannot say so).

  Writes:
    output/pdf/BEASTY-Affiliate-Schedule-A-DRAFT.pdf
        for review, the Changes field filled with "None".
    out/affiliate-forms/beasty-schedule-a-docuseal-import.pdf
        for DocuSeal, both fields EMPTY: its importer turns filled widgets
        into fixed page content (docs/AFFILIATE-FORMS-SETUP.md).
    out/affiliate-forms/schedule-a-fields.json
        the code and the Changes default.
*/
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import { DEFAULT_TERMS, SCHEDULE_A_FIELDS, cleanTerms, termsCode } from '../shared/affiliate-terms'
import { schedulePdf } from '../server/affiliate-terms-pdf'

const arg = process.argv.indexOf('--terms')
const terms = arg > 0 ? cleanTerms(JSON.parse(readFileSync(process.argv[arg + 1], 'utf8'))) : DEFAULT_TERMS
const code = termsCode(terms)
const meta = { heading: 'Standard terms', subheading: 'Figures are filled in by BEASTY before this packet is sent.', code, changes: 'None' }

mkdirSync('output/pdf', { recursive: true })
mkdirSync('out/affiliate-forms', { recursive: true })
const review = 'output/pdf/BEASTY-Affiliate-Schedule-A-DRAFT.pdf'
const cloud = 'out/affiliate-forms/beasty-schedule-a-docuseal-import.pdf'
writeFileSync(review, await schedulePdf(terms, { ...meta, fields: 'filled' }))
writeFileSync(cloud, await schedulePdf(terms, { ...meta, fields: 'empty' }))
writeFileSync('out/affiliate-forms/schedule-a-fields.json', JSON.stringify({ code, fields: [{ name: SCHEDULE_A_FIELDS.changes, default: 'None', readOnly: true, prefillable: true }, { name: SCHEDULE_A_FIELDS.initials, type: 'initials', role: 'Affiliate', required: true }] }, null, 2) + '\n')

/* Prove it: one page, exactly two fields, filled for review, empty for import. */
const names = Object.values(SCHEDULE_A_FIELDS).sort()
for (const [file, filled] of [[review, true], [cloud, false]] as const) {
  const doc = await PDFDocument.load(readFileSync(file))
  if (doc.getPageCount() !== 1) throw new Error(`${file}: ${doc.getPageCount()} pages, expected 1`)
  const got = doc.getForm().getFields().map((f) => f.getName()).sort()
  if (JSON.stringify(got) !== JSON.stringify(names)) throw new Error(`${file}: fields ${got.join(', ')}`)
  if ((doc.getForm().getTextField(SCHEDULE_A_FIELDS.changes).getText() ?? '') !== (filled ? 'None' : '')) throw new Error(`${file}: Changes field`)
}
console.log(`Schedule A: 1 page, 2 fields, code ${code}\n  ${review}\n  ${cloud}\n  out/affiliate-forms/schedule-a-fields.json`)
