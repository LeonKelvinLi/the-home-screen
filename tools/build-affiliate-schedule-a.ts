/*
  The Schedule A page for the DocuSeal affiliate packet: the agreement's
  commission and fee figures as fillable fields, defaults filled in.

    node --import tsx tools/build-affiliate-schedule-a.ts [--terms terms.json]

  --terms takes a Terms JSON (a published version from the CRM); without it the
  defaults in shared/affiliate-terms.ts are used. Writes:

    output/pdf/BEASTY-Affiliate-Schedule-A-Fillable-DRAFT.pdf
        for review: every field filled with its value, still editable.
    out/affiliate-forms/beasty-schedule-a-docuseal-import.pdf
        for DocuSeal: the same page with EMPTY fields. DocuSeal's importer
        turns filled widgets into fixed page content (docs/AFFILIATE-FORMS-SETUP.md),
        so the values go in afterwards as field defaults.
    out/affiliate-forms/schedule-a-fields.json
        field name -> default, in the order to enter them in DocuSeal.

  The field names are DOCUSEAL_FIELDS in the shared model, the same names the
  CRM's copy buttons use, so a sender preparing a request on the free plan
  pastes each affiliate's value into the field of the same name.
*/
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { PDFDocument, PDFTextField, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { DEFAULT_TERMS, DOCUSEAL_FIELDS, cleanTerms, docusealValues, termsCode } from '../shared/affiliate-terms'
import { winAnsi } from '../server/affiliate-terms-pdf'

const arg = process.argv.indexOf('--terms')
const terms = arg > 0 ? cleanTerms(JSON.parse(readFileSync(process.argv[arg + 1], 'utf8'))) : DEFAULT_TERMS
const values = docusealValues(terms)
const code = termsCode(terms)

const INK = rgb(0.078, 0.078, 0.086)
const MUTED = rgb(0.42, 0.44, 0.46)
const RULE = rgb(0.82, 0.84, 0.86)
const FIELD = rgb(0.98, 0.984, 0.988)
const YELLOW = rgb(0.965, 0.847, 0)
const W = 612
const H = 792
const M = 44

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = []
  for (const para of winAnsi(text).split('\n')) {
    let line = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(next, size) <= width || !line) line = next
      else {
        out.push(line)
        line = word
      }
    }
    out.push(line)
  }
  return out
}

async function build(filled: boolean): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle('BEASTY Affiliate Agreement - Schedule A (fillable)')
  doc.setAuthor('BEASTY Pages')
  const body = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const form = doc.getForm()
  let page!: PDFPage
  const byName = Object.fromEntries(DOCUSEAL_FIELDS.map((f) => [f.name, f]))
  let n = 0
  const text = (s: string, x: number, y: number, size: number, font = body, color = INK) => page.drawText(winAnsi(s), { x, y, size, font, color })

  const newPage = (title: string, sub: string) => {
    page = doc.addPage([W, H])
    n++
    page.drawRectangle({ x: 0, y: H - 104, width: W, height: 104, color: INK })
    page.drawRectangle({ x: 0, y: H - 108, width: W, height: 4, color: YELLOW })
    text('BEASTY', M, H - 32, 11, bold, YELLOW)
    text('AFFILIATE AGREEMENT · SCHEDULE A', M + 52, H - 32, 8.5, bold, rgb(1, 1, 1))
    text(title, M, H - 64, 20, bold, rgb(1, 1, 1))
    wrap(sub, body, 9, W - 2 * M).forEach((l, i) => text(l, M, H - 84 - i * 11, 9, body, rgb(0.85, 0.85, 0.87)))
    page.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.4, color: RULE })
    text('BEASTY Pages / Part of the BEASTY Affiliate Agreement. Keep completed forms in DocuSeal.', M, 32, 7.2, body, MUTED)
  }

  const section = (title: string, y: number) => {
    page.drawRectangle({ x: M, y: y - 1, width: 3, height: 10, color: YELLOW })
    text(title, M + 10, y, 9.6, bold)
    page.drawLine({ start: { x: M + 16 + bold.widthOfTextAtSize(winAnsi(title), 9.6), y: y + 3 }, end: { x: W - M, y: y + 3 }, thickness: 0.5, color: RULE })
    return y - 12
  }

  const field = (name: string, label: string, y: number, multiline = false) => {
    const h = multiline ? 58 : byName[name].multiline ? 30 : 20
    const labelLines = wrap(label, body, 8.8, 170)
    labelLines.forEach((l, i) => text(l, M, y - 13 - i * 10, 8.8, body, MUTED))
    const f: PDFTextField = form.createTextField(name)
    if (multiline || byName[name].multiline) f.enableMultiline()
    if (filled) f.setText(winAnsi(values[name]))
    f.addToPage(page, { x: M + 180, y: y - h, width: W - 2 * M - 180, height: h, font: body, textColor: INK, backgroundColor: FIELD, borderColor: RULE, borderWidth: 0.6 })
    f.setFontSize(h > 20 ? 8.6 : 9)
    return y - h - 9
  }

  newPage('Commission and Fee Schedule', 'The figures BEASTY and the Affiliate agree to. They are filled in by BEASTY before this packet is sent; the Affiliate reviews them and signs the agreement that this schedule is part of.')
  const groups: [string, string[]][] = [
    ['Prices and the Foundation contribution', ['Initiation Fee', 'Monthly Fee', 'Foundation Contribution', 'Promo Offer']],
    ['Commission', ['Commission Rate', 'Commission Term', 'Commission Per Member', 'Commission Per Initiation']],
    ['BARK points', ['Points Per User', 'Points Per Business', 'Point Value', 'Minimum Redemption', 'Promotion Days', 'Savings Bonus']],
    ['Payment', ['Payout Schedule', 'Schedule A Code']],
  ]
  let y = H - 136
  for (const [title, names] of groups) {
    y = section(title, y)
    for (const name of names) y = field(name, byName[name].label, y)
    y -= 6
  }
  if (y < 60) throw new Error(`Schedule A page 1 overflows (${y})`)

  newPage('Schedule A — standard terms', 'These apply to every Affiliate. Anything agreed only with this Affiliate is written in the last box and takes precedence for them.')
  y = H - 136
  const clauses: [string, string][] = [
    ['Qualifying referrals', terms.qualifying],
    ['Free months', 'No commission or points are earned on months a business does not pay for, including the free months of an introductory offer.'],
    ['Promotion days', terms.promoDays ? terms.promoDaysWhen : 'There are no promotion-day multipliers.'],
    ['Refunds and chargebacks', terms.clawback],
    ['The Foundation contribution', 'The Foundation contribution is taken before any commission is calculated and is never part of an Affiliate’s earnings.'],
  ]
  for (const [title, clause] of clauses) {
    y = section(title, y)
    for (const line of wrap(clause, body, 9.4, W - 2 * M)) {
      text(line, M, y, 9.4)
      y -= 13.5
    }
    y -= 10
  }
  y = section('Terms agreed with this Affiliate', y)
  y = field('Special Terms', byName['Special Terms'].label, y, true)
  if (y < 60) throw new Error(`Schedule A page 2 overflows (${y})`)

  doc.getPages().forEach((p, i) => {
    page = p
    const folio = winAnsi(`Schedule A · page ${i + 1} of ${n}`)
    text(folio, W - M - body.widthOfTextAtSize(folio, 7.2), 20, 7.2, body, MUTED)
  })
  if (filled) form.updateFieldAppearances(body)
  return doc.save()
}

mkdirSync('output/pdf', { recursive: true })
mkdirSync('out/affiliate-forms', { recursive: true })
const review = 'output/pdf/BEASTY-Affiliate-Schedule-A-Fillable-DRAFT.pdf'
const cloud = 'out/affiliate-forms/beasty-schedule-a-docuseal-import.pdf'
writeFileSync(review, await build(true))
writeFileSync(cloud, await build(false))
writeFileSync('out/affiliate-forms/schedule-a-fields.json', JSON.stringify({ code, fields: DOCUSEAL_FIELDS.map((f) => ({ name: f.name, default: values[f.name] })) }, null, 2) + '\n')

/* Prove it: the names, the defaults in the review copy, the empty import copy. */
const r = (await PDFDocument.load(readFileSync(review))).getForm()
const c = (await PDFDocument.load(readFileSync(cloud))).getForm()
const names = DOCUSEAL_FIELDS.map((f) => f.name).sort()
if (JSON.stringify(r.getFields().map((f) => f.getName()).sort()) !== JSON.stringify(names)) throw new Error('review copy fields do not match DOCUSEAL_FIELDS')
if (JSON.stringify(c.getFields().map((f) => f.getName()).sort()) !== JSON.stringify(names)) throw new Error('import copy fields do not match DOCUSEAL_FIELDS')
for (const f of DOCUSEAL_FIELDS) {
  if (r.getTextField(f.name).getText() !== winAnsi(values[f.name])) throw new Error(`review copy: ${f.name} not filled`)
  if (c.getTextField(f.name).getText()) throw new Error(`import copy: ${f.name} is not empty`)
}
console.log(`Schedule A: ${DOCUSEAL_FIELDS.length} fields, code ${code}\n  ${review}\n  ${cloud}\n  out/affiliate-forms/schedule-a-fields.json`)
