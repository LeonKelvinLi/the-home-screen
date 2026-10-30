# Batch 82 — transparent page-corner windows

Covers Glenn’s thread after Batch 81’s **October 30, 2026, 10:59 am PDT** cutoff, through Leon’s **12:48 pm** acknowledgments. Glenn’s latest request is at **12:36 pm**. Read at **12:48 pm PDT** and again before pushing at **12:55 pm** using `tools/thread-dump.py --since 2026-10-30`, with `tools/gap-check.py`. The final refetch adds only Leon’s likes of the triangle change and the already-completed B i P category.

His only new request: **“the white triangle just be transparent to show the icons color.”** This supersedes the white upper triangle introduced in Batch 81. No new business, film, category or entry was sent. The [request manifest](../research/roster/batch82.json) records the change.

## Change

The shared `PageFold` SVG’s upper triangle now uses `fill="none"`, revealing the icon’s original artwork beneath it. The serialized SVG used by open spots receives the same change. The black lower fold and outline remain. This reaches the same brand, category, system, dock, Search and open-spot icons covered in Batch 81; no source image files are modified and no extra filter, mask or animation is added.

**All 1,500 existing placements are unchanged.** Owner’s contacts remains Glenn and Leon; B i P remains available with its existing access rules and open spots.

## Local verification

- Build and TypeScript passed.
- **17 Batch 82 checks passed**, including comparisons of rendered upper-corner pixels against the original source artwork: San San pink **`[238,152,190]`**, CHICHA light **`[255,255,255]`**, and Hungry Cow dark **`[17,17,17]`**. Each matches exactly. Their black lower triangles remain **`[21,21,21]`**.
- All 24 visible category windows and four dock windows use transparent fill; open spots show their existing tile color. Phone layout fits and navigation raises no JavaScript errors.
- **41 Batch 81 regression checks** and **16 iPhone WebKit entry checks** passed.
- Gap check: **541 business domains, 17 historical unmatched**, unchanged.

Reviewed the phone screenshot of San Leandro’s yellow sheet: the San San corner shows pink, light artwork stays light, and the empty tiles show their original dark plate rather than a white patch.

## Live verification

Pending deployment and production checks. Results will be recorded in a separate `[skip render]` commit.

No outbound message, production account, purchase or booking created. Affiliate agreement files and the separate affiliate worktree untouched.
