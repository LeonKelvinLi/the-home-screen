/*
  Schedule A as a PDF: the filled money terms, the way the TDS app hands back
  a filled disclosure. Built here with pdf-lib, so it needs no DocuSeal API
  (paid) and no Python: the CRM opens it, Glenn and Leon read it, and the
  approved one is uploaded into the DocuSeal template from the free dashboard
  (docs/AFFILIATE-TERMS-FORM.md, "Into the packet").

  Layout follows tools/affiliate_form_design.py — a black title band with a
  BEASTY-yellow rule, numbered sections, fine rules — in the PDF standard
  Helvetica, so nothing is embedded and every figure stays selectable text.
*/
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { schedule, type Overrides, type Terms } from '../shared/affiliate-terms'

export interface ScheduleMeta {
  /** "Standard schedule, version 3" or "For Jane Doe · standard v3 with 2 changes". */
  heading: string
  /** "Published 22 Oct 2026 by operator". */
  subheading: string
  code: string
  /** Printed across every page when the figures are not an approved version. */
  draft?: string
  /** Shown only on drafts: what has not been agreed with Glenn yet. */
  openQuestions?: string[]
  overrides?: Overrides
}

const INK = rgb(0.078, 0.078, 0.086)
const MUTED = rgb(0.42, 0.44, 0.46)
const RULE = rgb(0.82, 0.84, 0.86)
const YELLOW = rgb(0.965, 0.847, 0)
const RED = rgb(0.77, 0, 0.1)
const W = 612
const H = 792
const M = 50

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

  let page: PDFPage
  let y = 0
  const text = (s: string, x: number, yy: number, size: number, font = body, color = INK) =>
    page.drawText(winAnsi(s), { x, y: yy, size, font, color })

  const newPage = (first: boolean) => {
    page = doc.addPage([W, H])
    page.drawRectangle({ x: 0, y: H - (first ? 118 : 54), width: W, height: first ? 118 : 54, color: INK })
    page.drawRectangle({ x: 0, y: H - (first ? 122 : 58), width: W, height: 4, color: YELLOW })
    text('BEASTY', M, H - 32, 11, bold, YELLOW)
    text('AFFILIATE AGREEMENT · SCHEDULE A', M + 52, H - 32, 8.5, bold, rgb(1, 1, 1))
    if (first) {
      text('Commission and Fee Schedule', M, H - 66, 22, bold, rgb(1, 1, 1))
      text(meta.heading, M, H - 88, 10.5, body, rgb(1, 1, 1))
      text(`${meta.subheading}   ·   Code ${meta.code}`, M, H - 104, 8.5, body, rgb(0.8, 0.8, 0.82))
      y = H - 150
    } else y = H - 86
    if (meta.draft) {
      const label = winAnsi(meta.draft.toUpperCase())
      const size = 8
      const w = bold.widthOfTextAtSize(label, size) + 16
      page.drawRectangle({ x: W - M - w, y: H - 40, width: w, height: 16, color: RED })
      text(label, W - M - w + 8, H - 35, size, bold, rgb(1, 1, 1))
    }
  }
  const room = (need: number) => {
    if (y - need < 64) newPage(false)
  }

  newPage(true)
  const sections = schedule(terms, meta.overrides)
  sections.forEach((s, i) => {
    room(60)
    text(String(i + 1), M, y, 11, bold)
    text(s.title, M + 18, y, 11, bold)
    y -= 8
    page.drawRectangle({ x: M, y, width: W - 2 * M, height: 1.2, color: YELLOW })
    y -= 16
    for (const r of s.rows) {
      const detail = r.detail ? wrap(r.detail, body, 8.5, W - 2 * M - 340) : []
      room(Math.max(1, detail.length) * 11 + 8)
      text(r.label, M, y, 9.5)
      text(r.value, M + 182, y, 9.5, bold)
      detail.forEach((line, k) => text(line, M + 340, y - k * 11, 8.5, body, MUTED))
      y -= Math.max(1, detail.length) * 11 + 4
      page.drawLine({ start: { x: M, y: y + 3 }, end: { x: W - M, y: y + 3 }, thickness: 0.4, color: RULE })
      y -= 6
    }
    if (s.text) {
      for (const line of wrap(s.text, body, 9.2, W - 2 * M)) {
        room(14)
        text(line, M, y, 9.2, body, INK)
        y -= 13
      }
    }
    y -= 14
  })

  if (meta.overrides && Object.keys(meta.overrides).length) {
    room(30)
    text('* Agreed for this Affiliate in place of the standard schedule.', M, y, 8.5, body, MUTED)
    y -= 22
  }
  if (meta.openQuestions?.length) {
    room(40)
    text('Not agreed with Glenn yet', M, y, 10, bold, RED)
    y -= 16
    for (const q of meta.openQuestions) {
      for (const [k, line] of wrap(q, body, 8.8, W - 2 * M - 14).entries()) {
        room(13)
        if (k === 0) text('•', M, y, 8.8, body, RED)
        text(line, M + 12, y, 8.8)
        y -= 12
      }
    }
  }

  const pages = doc.getPages()
  pages.forEach((p, i) => {
    page = p
    p.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.4, color: RULE })
    text('Part of the BEASTY Affiliate Agreement. Not legal advice; the agreement wording is reviewed by Glenn and his lawyer.', M, 34, 7.2, body, MUTED)
    const folio = winAnsi(`Schedule A · ${meta.code} · page ${i + 1} of ${pages.length}`)
    text(folio, W - M - body.widthOfTextAtSize(folio, 7.2), 22, 7.2, body, MUTED)
  })
  return doc.save()
}
