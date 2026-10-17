# BEASTY category pages

Glenn, 2026-09-30: "a multitude of BEASTY pages as its own individual
categories … the best 24 of each category will hold their spot", "each
affiliate will be on their own cities page as well", "limit the amount of pages
on the home screen to let's say 9 categories … all of these extra categories are
searchable", and "create a category button on the search page to list them all".

## What is where (since 2026-10-05)

**BEASTY • Pages is the first page** (Glenn, 2026-10-03: "What if we make the
Home Screen BEASTY • Pages? Then have 24 top categories spots as the BEASTY
categories on each spot?"). It holds 24 category tiles (`PAGES_TILES` in
`src/data/categoryGlyphs.ts`), each a square of its page's background with a
line drawing. A tile for a page on the swipe turns to it. A tile for any other
page adds that page to the swipe, and asks a signed-out visitor to sign up
first, as Search does. Home on a business page lands here.

**Then the nine** (`HOME_KINDS` in `src/data/slots.ts`): Eats, Sweets ("after
BEASTY • Eats"), AYCE ("after BEASTY • Sweets"), Goods, Services, Online,
Individuals, Tattoo, Automotive. Then the two yellow sheets, then the apps
page.

**Search.** Two buttons under the field:

- **Categories** lists all 31 BEASTY pages A to Z, each with its tile and how
  many businesses are on it.
- **Cities** lists every city A to Z.

Typing a category ("tattoo", "gym", "djs") shows it first. Search has a Share
button too; the link is beastypages.com/search.

**Cities are not in the swipe.** A city's four pages are added to the end of
the swipe when someone opens it from Search, or from the place button on a
business page ("Oakland • Goods >"). Going Home takes them off again.

## BEASTY • Eats and BEASTY • Sweets: one business per kind

Glenn, 2026-09-30: "BEASTY • Eats will showcase 24 of the best variety of
cuisine. No two cuisines alike on this page … the first who signs up holds a
spot", with his list of 24 cuisines, and a list of 24 kinds of dessert for
Sweets. Each spot is a kind of food (`EATS_CATEGORIES`, `SWEETS_CATEGORIES`).
A business seated by hand (`BEASTY_EATS_ROSTER`, `BEASTY_SWEETS_ROSTER` in
`src/data/roster.ts`) keeps its spot; an open spot fills with the first
business on BEASTY whose type line fits that kind, leaving out free Tier 1
listings and businesses already seated on one of BEASTY's own sheets. Glenn's
earlier picks that did not fit a cuisine, or shared one with a glowing tile,
went to More eats, as he said ("Any forgotten varieties of food will push over
to the second yellow pages"). A kind nobody fits shows as an open spot named
for it ("Udon — spot available").

## The category pages

The list is in `src/data/categories.ts`: Tattoo, Athletes, AI, Artists, Dancers,
Donations, DJ's, Chefs, Foodies, Realtors, Media, Photographers, Automotive
(the first Whips, renamed on 2026-10-04 with the repair shops added), Whips
(the cars themselves, seated from the centre out: MeterSF in the centre, spot 10, then MrCheeze408 beside it; the order is in `placements.ts`), Pit's, Pets (from 2026-10-09; King Lou is spot 1), Models, Meats, Gyms,
Barbershops, Salons, AYCE, Food Trucks, Cafe (Coffee until 2026-10-12), Bakery (from 2026-10-11:
bread, pastry and cake shops by their type line; a bakery can be on Sweets too)
Podcast (from 2026-10-12, "a great category that we can collab with"; a
podcast fits Media's type line too), and four from the night of 2026-10-14: Juice
(juice bars, smoothies, açaí; Go Fresh in Oakland first), Bar/Lounge (bars, lounges,
taprooms; J&A Lounge in Santa Rosa with it), Events (rentals, mobile bars, planners)
and Youth (kids' clubs, classes, camps and play; not dog daycare). All four are on
More pages and in Search, not on BEASTY • Pages.

Each category page holds 24 spots. Seat ids look like `beasty-tattoo-0` through
`beasty-tattoo-23`, the same shape as every other seat.

## How a category page fills

1. **By hand first.** A seat written in `src/data/placements.ts`, for example
   `'beasty-tattoo-0': 'b_oldcrowtattoo'`, keeps that number. Use this for a
   spot that has been sold or promised, or to put the best at the top.
2. **Then automatically.** Every business on BEASTY whose own type line
   (`cuisine`) passes the category's `test` takes the lowest open number, in the
   order it joined. A business with several locations takes one spot. This is
   how "each affiliate will be on their own cities page as well" holds without
   anyone remembering to do it. The seat a business holds on a city page is not
   used, because those seats were filled wherever there was room (the Barber
   seats also hold a brew boat and a vineyard).

`node tools/audit-data.mjs` prints how full each page is. It warns if more than
24 businesses fit a category, because then only the first 24 show and the best
should be seated by hand.

On 30 September (before Automotive, Coffee, AYCE and Food Trucks):

| Filled | Categories |
|---|---|
| 15 | Gyms |
| 13 | Whips |
| 8 | Salons |
| 7 | Tattoo |
| 6 | Barbershops, Chefs |
| 5 | Artists, Photographers |
| 2 | DJ's, Media, Realtors |
| 1 | AI, Athletes, Dancers, Pit's |
| 0 (24 open spots) | Donations, Foodies, Meats, Models |

## Backgrounds

`public/wallpapers/cat-<kind>.webp` are drawn by `tools/make-category-walls.py`
(gradients and simple shapes, so there is nothing to license). They are kept
dark so the white tile labels read. To use a photograph instead, save it under
the same file name at 1320x2868, then re-run the script's thumbnail step or make
a 132px `-thumb.webp` by hand.

## Adding a category

1. Add a line to `BEASTY_CATEGORIES` in `src/data/categories.ts`: a `kind`
   (lower-case letters), its heading, a one-line `about`, and a `test`.
2. Add a motif to `tools/make-category-walls.py` and run
   `python3 tools/make-category-walls.py <kind>`.
3. Run `node tools/audit-data.mjs` and `node tools/audit-categories.mjs`.

Everything else (the server's event checks, the CRM, Reserve a Spot, Search)
reads the page kinds from `PAGE_KINDS` in `src/data/slots.ts`.

To change which nine are on the home screen, edit `HOME_KINDS`, then update the
list in `tools/audit-categories.mjs` and `tools/live-verify.mjs` to match.


Games was added on 16 October 2026, opened by Super Savage Games in spot 1. It covers video games, consoles, arcades and game shops, with its own controller glyph and wallpaper, and appears in More pages and Search. Existing businesses that match fill remaining spots automatically.
