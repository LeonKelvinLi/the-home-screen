import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { BRANDS } from '../src/data/brands'
import { ALL_PLACEMENTS } from '../src/data/categorySeats'
import { PORTAL_KINDS, ALL_BEASTY_PAGES } from '../src/data/slots'
import { REELS } from '../src/data/clips'
import { REVIEW_LINKS } from '../src/data/reviewLinks'

// Independent contract: Glenn's requested moves and the pre-import catalog.
const receipt = JSON.parse(readFileSync('research/roster/imessage-refetch-2026-10-04.json', 'utf8'))
for (const old of receipt.baselineBrands) {
  assert.equal(BRANDS.find(b => b.id === old.id)?.name, old.name, `Retain ${old.name}`)
}
assert.equal(BRANDS.length, receipt.baselineBrands.length + 81)
const moved = new Set(['beasty-goods-20', 'pittsburg-goods-6'])
for (const [seat, id] of Object.entries(receipt.baselinePlacements)) {
  if (moved.has(seat)) continue
  assert.equal(ALL_PLACEMENTS[seat.replace('beasty-whips-', 'beasty-automotive-')], id, `Preserve ${seat}`)
}
assert.equal(ALL_PLACEMENTS['beasty-goods-20'], 'b_nossooakland')
assert.equal(ALL_PLACEMENTS['beasty-sweets-0'], 'b_meadowlarkdairy')
assert.equal(ALL_PLACEMENTS['beasty-whips-0'], 'b_metersf')
assert.equal(ALL_PLACEMENTS['pittsburg-goods-6'], undefined)
assert.equal(ALL_PLACEMENTS['martinez-goods-6'], 'b_paulosausage')
assert.ok(Object.entries(ALL_PLACEMENTS).some(([seat, id]) => seat.startsWith('brentwood-') && id === 'b_paulosausage'))
assert.equal(BRANDS.find(b => b.id === 'b_nossooakland')?.tier, 3)
assert.equal(new Set(PORTAL_KINDS).size, 24)
for (const kind of PORTAL_KINDS) assert.ok(ALL_BEASTY_PAGES.some(p => p.kind === kind), `Door ${kind} opens a page`)
for (const review of REVIEW_LINKS) {
  for (const id of [review.businessId, review.creatorId]) if (id) assert.ok(BRANDS.some(b => b.id === id), `Review target ${id}`)
  for (const file of [review.clip.src, review.clip.poster]) if (file) assert.ok(existsSync(`public${file}`), `Missing ${file}`)
}
assert.equal(new Set(REELS.map(r => r.src)).size, REELS.length, 'Watch should show each source once')
assert.equal(BRANDS.find(b => b.id === 'b_metersf')?.photos?.length, 2)
assert.ok(BRANDS.find(b => b.id === 'b_metersf')?.clip?.src)
console.log(`October 4 contract passed: ${BRANDS.length} pages, 24 doors, ${REELS.length} unique Watch videos.`)
