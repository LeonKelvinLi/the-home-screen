/*
  Schedule A as one page, in the packet's own design (tools/affiliate_form_design.py): the BEASTY
  wordmark in Oswald over a hairline with the yellow tick, the title in Inter, numbered sections with
  the yellow bar, field boxes, and the same footer. It used to be set in Helvetica with a header of its
  own, so in DocuSeal it read as a page from a different document; now it is page 14 of the same one.

  The same page serves both places, so they cannot drift apart:
    - the CRM's "Open filled PDF" and an affiliate's own Schedule A, and
    - the DocuSeal packet (tools/build-affiliate-schedule-a.ts), where the
      only fields are "Schedule A Changes", which BEASTY prefills, and
      "Schedule A Initials", which the Affiliate signs.
  Built with pdf-lib and fontkit (the fonts are server/fonts, cut from public/fonts), so no paid
  DocuSeal API and no Python are involved.
*/
import { readFileSync } from 'node:fs'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { SCHEDULE_A_FIELDS, compactSchedule, type Overrides, type Terms } from '../shared/affiliate-terms'

export interface ScheduleMeta {
  /** "Standard terms, version 3" or "Terms for Jane Doe". */
  heading: string
  /** "Published 22 Oct 2026 by operator". */
  subheading: string
  code: string
  /** Printed top right when the figures are not an approved version. */
  draft?: string
  /** Shown only on internal drafts: what has not been agreed with Glenn yet. */
  openQuestions?: string[]
  overrides?: Overrides
  /** What differs for this affiliate ("None" on the standard schedule). */
  changes?: string
  /** DocuSeal form fields: none for the CRM's PDF, empty for import, filled for review. */
  fields?: 'none' | 'empty' | 'filled'
}

/* The packet's palette and margins (affiliate_form_design.py). */
const hex = (h: string) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255)
const INK = hex('#20252B')
const SOFT = hex('#59616A')
const HAIR = hex('#D3D8DC')
const YELLOW = hex('#F6D800')
const FIELD = hex('#FAFBFC')
const RED = hex('#B00D1A')
const W = 612
const H = 792
const L = 44
const R = 568

const font = (name: string) => readFileSync(new URL(`./fonts/${name}.ttf`, import.meta.url))

/* The text stays in WinAnsi: the fonts are cut to Google's latin subset, and the few characters the
   schedule uses outside it are swapped for their plain equivalents instead of drawing a blank. */
const SWAP: Record<string, string> = { '−': '-', '→': '->', '≤': '<=', '≥': '>=', ' ': ' ' }
const WIN_ANSI_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'
export function winAnsi(s: string): string {
  return [...s]
    .map((ch) => {
      if (SWAP[ch]) return SWAP[ch]
      const c = ch.charCodeAt(0)
      if ((c >= 0x20 && c < 0x7f) || (c >= 0xa0 && c <= 0xff) || WIN_ANSI_EXTRA.includes(ch)) return ch
      return ch === '\n' ? '\n' : '?'
    })
    .join('')
}

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

export async function schedulePdf(terms: Terms, meta: ScheduleMeta): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  doc.setTitle(`BEASTY Affiliate Agreement - Schedule A (${meta.code})`)
  doc.setAuthor('BEASTY Pages')
  doc.setSubject(winAnsi(meta.heading))
  doc.setCreator('BEASTY CRM')
  const body = await doc.embedFont(font('BeastyInter'), { subset: true })
  const medium = await doc.embedFont(font('BeastyInterMedium'), { subset: true })
  const bold = await doc.embedFont(font('BeastyInterBold'), { subset: true })
  const display = await doc.embedFont(font('BeastyOswald'), { subset: true })
  const c = compactSchedule(terms)
  const fields = meta.fields ?? 'none'

  let page: PDFPage = doc.addPage([W, H])
  const text = (s: string, x: number, yy: number, size: number, f = body, color = INK) => page.drawText(winAnsi(s), { x, y: yy, size, font: f, color })
  const right = (s: string, x: number, yy: number, size: number, f = body, color = INK) => text(s, x - f.widthOfTextAtSize(winAnsi(s), size), yy, size, f, color)
  const hair = (yy: number, x0 = L, x1 = R, thickness = 0.5) => page.drawLine({ start: { x: x0, y: yy }, end: { x: x1, y: yy }, thickness, color: HAIR })
  const box = (x: number, yy: number, w: number, h: number) => page.drawRectangle({ x, y: yy, width: w, height: h, color: FIELD, borderColor: HAIR, borderWidth: 0.6 })

  /* The packet's header: wordmark, what this is, the hairline with the yellow tick. */
  const masthead = () => {
    text('BEASTY', L, 749, 20, display)
    text('Affiliate agreement  /  Schedule A', L, 735, 8, medium, SOFT)
    if (meta.draft) {
      const label = winAnsi(meta.draft.toUpperCase())
      const w = Math.max(121, bold.widthOfTextAtSize(label, 7.8) + 24)
      page.drawRectangle({ x: R - w, y: 740, width: w, height: 23, borderColor: HAIR, borderWidth: 0.6, color: rgb(1, 1, 1) })
      text(label, R - w / 2 - bold.widthOfTextAtSize(label, 7.8) / 2, 748, 7.8, bold, RED)
    } else right(`Code ${meta.code}`, R, 745, 8, medium, SOFT)
    hair(718, L, R, 0.6)
    page.drawLine({ start: { x: L, y: 718 }, end: { x: L + 38, y: 718 }, thickness: 3, color: YELLOW })
  }
  masthead()
  text('Commission and fee schedule', L, 683, 21, bold)
  text(meta.heading, L, 663, 9.6, body, SOFT)
  let y = 634

  const room = (need: number) => {
    if (y - need >= 66) return
    page = doc.addPage([W, H])
    masthead()
    y = 690
  }
  const para = (s: string, size = 9.4, color = INK, lead = 13.2, f = body) => {
    for (const line of wrap(s, f, size, R - L)) {
      room(lead)
      text(line, L, y, size, f, color)
      y -= lead
    }
  }
  let n = 0
  /* The packet's section: yellow bar, number, title, hairline to the margin. */
  const heading = (title: string) => {
    room(48)
    n++
    page.drawRectangle({ x: L, y: y - 1, width: 3, height: 10, color: YELLOW })
    text(String(n).padStart(2, '0'), L + 12, y, 8, medium, SOFT)
    text(title, L + 36, y, 9.6, bold)
    hair(y + 3, L + 48 + bold.widthOfTextAtSize(winAnsi(title), 9.6), R)
    y -= 19
  }
  const gap = (h = 13) => { y -= h }

  /* 01 Fees: name, who pays and when, the amount right-aligned. */
  heading('Fees')
  for (const [k, f] of c.fees.entries()) {
    const detail = wrap(f.detail, body, 8.6, 250)
    room(detail.length * 11.5 + 12)
    text(f.label, L, y, 9.6, medium)
    detail.forEach((line, i) => text(line, L + 150, y - i * 11.5, 8.6, body, SOFT))
    right(f.amount, R, y, 9.6, bold)
    y -= (detail.length - 1) * 11.5 + 7
    if (k < c.fees.length - 1) hair(y)
    y -= 11.5
  }
  gap(12)

  heading('What a referral earns')
  para(c.commission)
  gap()
  heading('BARK points')
  para(c.bark)
  if (c.barkFine) {
    y -= 2
    para(c.barkFine, 8.3, SOFT, 11.6)
  }
  gap()
  heading('Payment and adjustments')
  para(c.payment)
  gap()
  heading('Qualifying referrals')
  para(c.qualifying)
  gap()

  /* Changes for this Affiliate, in the packet's field box: the one thing that differs per person. */
  heading('Changes for this Affiliate')
  const form = doc.getForm()
  const changes = meta.changes ?? 'None'
  room(48)
  box(L, y - 30, R - L, 40)
  if (fields === 'none') {
    const lines = wrap(changes, body, 9.6, R - L - 20)
    lines.slice(0, 2).forEach((line, i) => text(line, L + 10, y - 4 - i * 13, 9.6))
  } else {
    const field = form.createTextField(SCHEDULE_A_FIELDS.changes)
    field.enableMultiline()
    if (fields === 'filled') field.setText(winAnsi(changes))
    field.addToPage(page, { x: L + 4, y: y - 28, width: R - L - 8, height: 36, font: body, textColor: INK, borderWidth: 0 })
    field.setFontSize(9.6)
  }
  y -= 50

  /* Initials, in a box like the packet's signature boxes. */
  room(48)
  text('Affiliate initials', L, y, 8, medium, SOFT)
  box(L, y - 32, 150, 24)
  if (fields !== 'none') {
    const initials = form.createTextField(SCHEDULE_A_FIELDS.initials)
    initials.addToPage(page, { x: L + 4, y: y - 30, width: 142, height: 20, font: body, textColor: INK, borderWidth: 0 })
    initials.setFontSize(10)
  }
  right('This schedule forms part of the BEASTY Affiliate Agreement.', R, y - 22, 8.4, body, SOFT)
  y -= 50

  if (meta.openQuestions?.length) {
    room(40)
    text('Not yet agreed with Glenn (internal draft only)', L, y, 8.6, bold, RED)
    y -= 14
    for (const q of meta.openQuestions) {
      for (const [k, line] of wrap(q, body, 8.2, R - L - 12).entries()) {
        room(11)
        if (k === 0) text('•', L, y, 8.2, body, RED)
        text(line, L + 12, y, 8.2, body, SOFT)
        y -= 11
      }
    }
  }

  if (fields === 'filled') form.updateFieldAppearances(body)
  /* The packet's footer. */
  const pages = doc.getPages()
  pages.forEach((p, i) => {
    page = p
    hair(47, L, R, 0.6)
    text(`BEASTY Pages  /  ${meta.subheading}`, L, 32, 7.2, medium, SOFT)
    right(`Schedule A  ·  ${meta.code}  ·  ${String(i + 1).padStart(2, '0')} / ${String(pages.length).padStart(2, '0')}`, R, 32, 7.2, medium, SOFT)
  })
  return doc.save()
}
