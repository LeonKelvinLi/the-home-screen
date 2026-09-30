# BEASTY category pages

Glenn, 2026-09-30: "a multitude of BEASTY pages as its own individual
categories … the best 24 of each category will hold their spot", "each
affiliate will be on their own cities page as well", "limit the amount of pages
on the home screen to let's say 9 categories … all of these extra categories are
searchable", and "create a category button on the search page to list them all".

## What is where

**Home screen swipe** (`HOME_KINDS` in `src/data/slots.ts`) has nine category
pages, then the two yellow sheets, then the apps page:

- Eats, Goods, Services, Online, Individuals (the flagship sheets, in Glenn's order)
- Tattoo, Whips, Gyms, Salons (the four category pages with the most businesses on 30 September)

**Search.** Two buttons under the field:

- **Categories** lists all 26 BEASTY pages A to Z, each with a piece of its
  background and how many businesses are on it.
- **Cities** lists every city A to Z.

Typing a category ("tattoo", "gym", "djs") shows it first.

**Cities are no longer in the swipe.** A city's four pages are added to the end
of the swipe when someone opens it from Search, or from the place button on a
business page ("Oakland • Goods >"). Going Home takes them off again. A
category that is not one of the nine works the same way.

## The 19 new categories

The list is in `src/data/categories.ts`, in Glenn's order: Tattoo, Athletes, AI,
Artists, Dancers, Donations, DJ's, Cooks, Foodies, Realtors, Media,
Photographers, Whips, Pit's, Models, Meats, Gyms, Barbershops, Salons.

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

On 30 September:

| Filled | Categories |
|---|---|
| 15 | Gyms |
| 13 | Whips |
| 8 | Salons |
| 7 | Tattoo |
| 6 | Barbershops, Cooks |
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
