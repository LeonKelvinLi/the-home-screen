/*
  Schedule A as one page, the way a contract schedule reads: a short fee table
  with the amounts right-aligned, then a sentence each for commission, BARK,
  payment and qualifying referrals. One typeface (Helvetica, whose figures are
  tabular), hairline rules instead of boxes, one heading style, and BEASTY
  yellow once, under the title.

  The same page serves both places, so they cannot drift apart:
    - the CRM's "Open filled PDF" and an affiliate's own Schedule A, and
    - the DocuSeal packet (tools/build-affiliate-schedule-a.ts), where the
      only fields are "Schedule A Changes", which BEASTY prefills, and
      "Schedule A Initials", which the Affiliate signs.
  Built with pdf-lib, so no paid DocuSeal API and no Python are involved.
*/
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
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

const INK = rgb(0.1, 0.1, 0.11)
const SOFT = rgb(0.36, 0.37, 0.39)
const HAIR = rgb(0.72, 0.73, 0.75)
const YELLOW = rgb(0.965, 0.847, 0)
const RED = rgb(0.7, 0.05, 0.1)
const W = 612
const H = 792
const L = 72
const R = W - 72

/* Helvetica in a PDF speaks WinAnsi. The few characters the schedule uses
   outside it are swapped for their plain equivalents instead of crashing. */
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
  doc.setTitle(`BEASTY Affiliate Agreement - Schedule A (${meta.code})`)
  doc.setAuthor('BEASTY Pages')
  doc.setSubject(winAnsi(meta.heading))
  doc.setCreator('BEASTY CRM')
  const body = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const c = compactSchedule(terms)
  const fields = meta.fields ?? 'none'

  let page: PDFPage = doc.addPage([W, H])
  let y = H - 72
  const text = (s: string, x: number, yy: number, size: number, font = body, color = INK) => page.drawText(winAnsi(s), { x, y: yy, size, font, color })
  const right = (s: string, x: number, yy: number, size: number, font = body, color = INK) => text(s, x - font.widthOfTextAtSize(winAnsi(s), size), yy, size, font, color)
  const hair = (yy: number, x0 = L, x1 = R) => page.drawLine({ start: { x: x0, y: yy }, end: { x: x1, y: yy }, thickness: 0.5, color: HAIR })
  const room = (need: number) => {
    if (y - need >= 58) return
    page = doc.addPage([W, H])
    y = H - 72
  }
  const para = (s: string, size = 9.5, color = INK, lead = 13.6) => {
    for (const line of wrap(s, body, size, R - L - 22)) {
      room(lead)
      text(line, L + 22, y, size, body, color)
      y -= lead
    }
  }
  let n = 0
  const heading = (title: string) => {
    room(44)
    y -= 13
    n++
    text(`${n}.`, L, y, 10, bold)
    text(title, L + 22, y, 10, bold)
    y -= 15
  }

  /* Title block. */
  text('SCHEDULE A', L, y, 8, bold, SOFT)
  right('BEASTY AFFILIATE AGREEMENT', R, y, 8, bold, SOFT)
  y -= 26
  text('Commission and Fee Schedule', L, y, 19, bold)
  y -= 9
  page.drawRectangle({ x: L, y: y - 2, width: 36, height: 2, color: YELLOW })
  y -= 18
  text(meta.heading, L, y, 9.5, body, SOFT)
  right(`Code ${meta.code}`, R, y, 9.5, body, SOFT)
  if (meta.draft) right(winAnsi(meta.draft.toUpperCase()), R, H - 50, 8, bold, RED)
  y -= 12
  hair(y)

  /* 1. Fees: label and detail left, amount right-aligned. */
  heading('Fees paid by a Member Business')
  for (const f of c.fees) {
    const detail = wrap(f.detail, body, 9, 250)
    room(detail.length * 12 + 8)
    text(f.label, L + 22, y, 9.5)
    detail.forEach((line, k) => text(line, L + 168, y - k * 12, 9, body, SOFT))
    right(f.amount, R, y, 9.5, bold)
    y -= (detail.length - 1) * 12 + 7
    hair(y, L + 22)
    y -= 13
  }
  y += 2

  heading('Commission')
  para(c.commission)
  heading('BARK points')
  para(c.bark)
  if (c.barkFine) {
    y -= 2
    para(c.barkFine, 8.3, SOFT, 11.6)
  }
  heading('Payment and adjustments')
  para(c.payment)
  heading('Qualifying referrals')
  para(c.qualifying)

  /* Changes for this Affiliate: the one thing that differs per person. */
  heading('Changes for this Affiliate')
  const form = doc.getForm()
  const changes = meta.changes ?? 'None'
  if (fields === 'none') para(changes)
  else {
    room(46)
    const box = form.createTextField(SCHEDULE_A_FIELDS.changes)
    box.enableMultiline()
    if (fields === 'filled') box.setText(winAnsi(changes))
    box.addToPage(page, { x: L + 22, y: y - 32, width: R - L - 22, height: 40, font: body, textColor: INK, borderWidth: 0 })
    box.setFontSize(9.5)
    y -= 34
    hair(y, L + 22)
    y -= 6
  }

  /* Initials, then the open questions on internal drafts only. */
  room(36)
  y -= 24
  text('Affiliate initials', L, y, 9, body, SOFT)
  hair(y - 4, L + 84, L + 190)
  if (fields !== 'none') {
    const initials = form.createTextField(SCHEDULE_A_FIELDS.initials)
    initials.addToPage(page, { x: L + 86, y: y - 3, width: 102, height: 18, font: body, textColor: INK, borderWidth: 0 })
    initials.setFontSize(10)
  }
  right('This schedule forms part of the BEASTY Affiliate Agreement.', R, y, 8.3, body, SOFT)
  y -= 20

  if (meta.openQuestions?.length) {
    room(40)
    y -= 10
    text('Not yet agreed with Glenn (internal draft only)', L, y, 8.5, bold, RED)
    y -= 13
    for (const q of meta.openQuestions) {
      for (const [k, line] of wrap(q, body, 8, R - L - 12).entries()) {
        room(11)
        if (k === 0) text('•', L, y, 8, body, RED)
        text(line, L + 12, y, 8, body, SOFT)
        y -= 10.5
      }
    }
  }

  if (fields === 'filled') form.updateFieldAppearances(body)
  const pages = doc.getPages()
  pages.forEach((p, i) => {
    page = p
    const folio = winAnsi(`Schedule A · ${meta.code} · ${i + 1} of ${pages.length}`)
    text(folio, R - body.widthOfTextAtSize(folio, 7.5), 40, 7.5, body, SOFT)
    text(winAnsi(meta.subheading), L, 40, 7.5, body, SOFT)
  })
  return doc.save()
}
