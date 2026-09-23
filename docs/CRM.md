# BEASTY CRM

The internal growth tool: where a business came from, who brought it, who is
working it, what was sold, and what needs doing next. It lives at `/crm`,
beside the kitchen screen, and it never replaces the listings: **a business is
still defined by its entry in `src/data`**, and the CRM only points at it.

## What exists (audit, 2026-09-21)

| Question | Answer, traced in code |
| --- | --- |
| Frontend | React 18 + Vite SPA. `src/main.tsx` picks a standalone screen by path before `App` mounts (`/kitchen` does this today). |
| Backend | Express 4, one process, `server/index.ts`. Routes are `app.<verb>('/api/...', rateLimiter(...), handler)`. |
| Database | Postgres through `server/db/schema.ts`: a tiny `db.prepare(sql).get/all/run` wrapper with `?` placeholders and `db.transaction`. Schema is one idempotent SQL string run by `migrate()` at boot: `CREATE TABLE IF NOT EXISTS` plus `ADD COLUMN IF NOT EXISTS`. Timestamps are `BIGINT` ms; money is `INTEGER` cents. |
| Auth | Members: email/SMS one-time code, then an httpOnly `beasty_member` session cookie (hashed in `member_sessions`). Operator: `Authorization: Bearer $OPERATOR_TOKEN`, compared in constant time (`isOperator`). Kitchens: hashed per-device keys. No roles table. |
| Businesses | **Not in the database.** `BRANDS` (`src/data/brands.ts`) is built from `roster.ts`, `localBrands.ts` and the generated `rosterResearch.ts`; the server imports the same module. Ids are stable strings (`b_jazzbraids`). `brand_signals` already references brands by id with no foreign key; the CRM does the same. |
| Individuals | Brands too, seated on the BEASTY • Individuals sheet (`beasty-individuals-N`). Janelle is `b_nanacasas`. |
| Cities / categories | `CITY_PLACEMENTS` (`src/data/placements.ts`) maps `<city>-<page>-<index>` to a brand id; the category is the page's category list at that index (`src/data/slots.ts`); city names are `CITY_PAGES` (`src/data/cities.ts`). A brand's city is its first non-BEASTY seat. |
| Listing tier | `brand.tier` (1 = free listing, unset = full page). |
| Contact | `brand.phone`, `brand.email`, `brand.instagram` (handle), `brand.address`, `brand.hours`. Instagram-only businesses sometimes carry the profile as `brand.site`. |
| Research notes | `flags` in `research/roster/batchNN.json` (last file wins per id). Not shipped to the client. |
| Website status | Derived, not stored: `!site` = none; `site && needsSite` = a stopgap; `beastyOwner` is exempt. The red ring (`src/apps/registry.tsx`) uses exactly this. |
| Multi-location | One brand id per location, same `name` (Tacos Mi Reynita ×4, Yummy Yummy Hibachi ×3, Pho Nation ×2). No family field. |
| Inbound leads | `applications` table: Reserve-a-spot requests and Collab creator requests (`cuisine = 'BEASTY Collab — food creator'`). Operator-only read. |
| Existing referrals | Member-to-member (`members.referred_by`, `?ref=CODE`) and register cards (`members.joined_via`). Both are about sign-ups, not business sales, and stay untouched. |
| Deploy | Render auto-deploys `main`; `migrate()` runs on boot. Tests are `tools/audit-*.mjs`, each on a private throwaway Postgres (`tools/pgtest.mjs`), run together by `tools/audit-all.mjs`. |

## Data model

All tables are new and additive (`server/db/crm-schema.ts`, run by `migrate()`
after the existing schema). Nothing existing is altered.

```
crm_source_types   lookup: celebrity, individual, influencer, glenn, leon, team,
                   business, organic, instagram, cold_outreach, referral_link,
                   qr_code, other. New types are rows, not migrations.
crm_people         referrers AND team in one table (a person can be both).
                   slug (referral link), source_type, role admin|team|partner|none,
                   is_team, brand_id (their BEASTY page, if any), member_id (their
                   account, for sign-in). Seeded: Glenn, Leon, Janelle.
crm_opportunities  one per (brand_id, opportunity_type), or per application.
                   brand_id is the canonical business; business_name, city,
                   category, website_status and normalized phone/email/instagram
                   are snapshots refreshed from BRANDS at boot (never edited by
                   hand). Attribution: referrer_id, source_type, campaign,
                   referred_at, referral_note. Ownership: assigned_to, closed_by.
                   stage + stage_changed_at; next_followup_at and
                   last_activity_at are denormalized for fast lists.
crm_stage_history  every transition: from, to, changed_at, changed_by, note.
crm_activities     typed timeline (NOTE, CALL, TEXT, EMAIL, INSTAGRAM_DM,
                   REFERRAL, STAGE_CHANGE, FOLLOW_UP, PROPOSAL, DEAL_WON,
                   DEAL_LOST, ASSIGNMENT, SYSTEM); type is text, so new kinds
                   need no migration.
crm_followups      due_at, owner, priority, type, notes, completed_at/by.
crm_offers         the price list, editable: Website Build $149, SEO $150,
                   Website + 1 Year BEASTY $199, each $30/month.
crm_deals          price SNAPSHOT at quote/sale: offer_name, quoted_cents,
                   sold_cents, monthly_cents, status open|won|lost, won_at,
                   lost_at, loss_reason, closed_by, recurring_active. Changing an
                   offer never touches a deal.
crm_referral_visits one row per click on /r/<slug> (or its QR).
crm_sessions       operator sign-in for the CRM screen (hashed, 30 days).
crm_backfill_runs  every import, with its full report.
```

### Rules the schema enforces

- **Referred by, assigned to and closed by are three columns.** Assigning or
  closing never touches `referrer_id`. The first attribution wins; changing it
  later is admin-only, needs a reason, and is recorded as a `REFERRAL` activity
  holding the old and new values.
- **Stages are never overwritten silently.** Every change inserts a
  `crm_stage_history` row and a `STAGE_CHANGE` activity in one transaction.
- **No duplicate opportunities**: unique `(brand_id, opportunity_type)` and
  unique `application_id`. Locations of one business are separate brands, so
  they are separate opportunities sharing a `family_key` (the normalized name),
  which is what "how is Yummy Yummy Hibachi doing overall" groups by.
- **Revenue comes from deals only.** One-time = sum of `sold_cents` on won
  deals; MRR = sum of `monthly_cents` on won deals with `recurring_active`;
  ARR = MRR × 12. Pipeline value = open opportunities' potential.

## Attribution

`GET /r/<slug>` (and `/r/<slug>?via=qr` for the printed code) records a visit,
sets a signed, httpOnly `beasty_crm_ref` cookie for 90 days and redirects to
`/money`, the page that sells a tile. The cookie is **first-touch**: a later
link from someone else does not replace it. When that visitor sends a
Reserve-a-spot request, the new CRM lead is created with that referrer,
`source_type` referral_link or qr_code, and the original click time as
`referred_at`. The signature (HMAC with the server secret, domain-separated)
means the cookie cannot be edited to credit someone else.

## Permissions (server-side)

- **admin**: the operator token (header, or a CRM session made from it), or a
  member linked to a `crm_people` row with role admin. Everything, including
  offers, people, backfill and attribution overrides.
- **team**: a linked member with role team. Leads, activities, follow-ups,
  stages, deals. No offers, people or overrides.
- **partner**: a linked member with role partner. Only
  `GET /api/crm/partner/me` (their own referral counts and, per business, the
  name, city and stage bucket) and their own QR code. No notes, no contact
  details, nobody else's data.

## Backfill

`POST /api/crm/backfill` (admin; `{"dryRun": true}` first). Scans every seated
brand once: skips owners, businesses with a working site and Individuals
(people are flagged for manual review, not assumed to be website leads);
creates one `website` (or `website_redesign`, for a site that exists but is a
problem) opportunity per remaining brand, at `need_contact_info` when nothing
can reach them and `ready_to_contact` when a phone, email or Instagram can.
Existing opportunities are skipped, so reruns create nothing. Shared phone,
email or Instagram between different businesses is reported as a possible
duplicate and never merged. Reserve-a-spot requests become `beasty_program`
leads. Every run is stored with its report.

"New this week" and "new leads, 30 days" leave imported leads out, so the day
the import runs does not read as a week of new business. `?imported=1` (or
`0`) filters the lead list the same way.

## The screen

`/crm`, chosen in `src/main.tsx` before the app mounts, like `/kitchen`, and
lazy-loaded, so no customer downloads it. Routes live in the hash (`#/leads`,
`#/lead/<id>`, `#/referrer/<id>`, ...), so Back, a refresh and a pasted link
land where they were, and each history entry remembers its scroll position.

| Section | What it is for |
| --- | --- |
| Home | The numbers first. "Right now" totals (users, leads, customers, monthly plans), what needs Glenn today, then everything over one period picked at the top (7 days, 30 days, 90 days, 12 months, all time or custom dates): users (sign-ups, active, returning, activated, the sign-up chart against the period before, where users came from, the sign-up funnel, cohorts, the sign-up list, what users did) and leads and money. Every number names its days and what it is compared with. See "Users and tracking" below. |
| To do | Who to reach now: late and due reminders, businesses someone sent, ones to keep warm, ready for a first hello, and ones still missing a phone or Instagram. |
| Leads | Search plus filters for stage, website status, opportunity, city, category, referrer, assignee, source, phone/email/Instagram present, date added, never contacted and overdue. All filters live in the URL. On a phone, rows become cards with Call / Text / Email / IG. |
| Lead | Reach them (real `tel:`, `sms:`, `mailto:` and Instagram links; tapping one gets that log type ready), log what happened, move the stage, schedule the next step, quote and close a deal, attribution, who works it, details, the listing and research notes, other locations, timeline and stage history. |
| Pipeline | Open leads by stage, movable from each card. |
| Businesses | One row per business family with locations, cities, open and won counts, pipeline and revenue. |
| Referrers | The leaderboard: leads, contacted, replied, interested, proposals, won, conversion, revenue, MRR, link visits, by period. Each person's page has their link, a QR code, the funnel and every business they sent. |
| Follow-ups | Overdue, due today, upcoming, no next action, recently completed. |
| Revenue | One-time, MRR, ARR and pipeline, by referrer, salesperson, offer, month, city and category. |
| Analytics | The funnel from stage history, time to first contact, time to close, time in each stage. |
| Settings (admin) | People and roles, offers and prices, and the import (preview first). |

Signing in: the operator key typed once makes a 30-day CRM session cookie.
Team members and partners sign in to beastypages.com as usual; once an admin
links their account email to their person in Settings and gives them a role,
`/crm` opens for them. A partner sees only their own page.

## Users and tracking

**A user is a person with a BEASTY account** (a row in `members`), never a
lead (a business the team is selling to) and never the team. Accounts with a
reserved test address (`example.com`, `.test`, `.invalid`) or a fictional
555-01xx number are left out of every user number, and so is any account an
admin marks as a test account from the sign-up list ("Test account?"; it can
be put back under "Accounts left out of the numbers"). The Home says how many
are left out.

| Number | Means | Counted from |
| --- | --- | --- |
| Users | Accounts, all time | `members.created_at`, since the first sign-up |
| New sign-ups | Accounts created in the period, Pacific days | the same, so all history |
| Active users | Did something **meaningful** in the period | tracked events only, from when tracking began |
| Returning users | Active in the period, signed up before it began | tracked events only |
| Activated | Did a **core** thing at any time after signing up | core events, plus the tables that always kept them: likes, saves and shares, orders, pass scans, friends who joined |

A period is compared with the stretch just before it, of the same length
(`src/crm/periods.ts`), so today's unfinished day is weighed against an
equally unfinished stretch. A change from zero has no percentage: it reads
"24 vs 0 in the 30 days before". A stretch tracking did not cover reads "Not
tracked", never 0, and a cohort cell that is not over yet or began before
tracking says which.

**Events** (`server/analytics.ts`, table `analytics_events`, append-only). One
list of names, each marked meaningful and/or core; `track()` never throws and
never joins the caller's transaction. Members: `user_signed_up`,
`user_signed_in`, `user_signed_out`, `app_opened` (once a day, not
meaningful), `business_viewed` (once a day per business), `business_liked` /
`_unliked`, `business_saved` / `_unsaved`, `business_shared`, `order_placed`,
`pass_opened` (once a day), `pass_scanned`, `friend_joined`,
`membership_chosen`. Visitors: `site_visited` (a beacon, once a day per device,
never for crawlers or signed-in members), `signup_started`. The team, recorded
after each successful CRM write: `crm_lead_created`, `crm_lead_updated`,
`crm_stage_changed`, `crm_contact_logged`, `crm_followup_created`,
`crm_followup_completed`, `crm_deal_created`, `crm_deal_won`,
`crm_leads_imported`. `tracking_started` is written once, at the first boot
with this code: nothing before it was tracked.

**Privacy.** No names, emails, phone numbers, IP addresses or full URLs in an
event. A visitor is a hash of the device cookie. Where a sign-up came from is
kept on the member (`members.signup_attribution`): the five UTM fields, the
referring host (never its path) and the landing path (never its query).
Deleting a member deletes their events.

**API.** `GET /api/crm/home?period=7d|30d|90d|12m|all|custom&start=&end=`
(team) answers the whole Home in one response, counts only.
`GET /api/crm/users/cohorts?unit=week|month` (team). `GET /api/crm/users`
(admin only: names and contacts; search, source, dates, cohort, sort, pages of
up to 100). `GET /api/crm/users/left-out` and `POST /api/crm/users/:id/test`
(admin). Partners get none of it.

## Tests

- `node tools/audit-crm.mjs`: the API end to end on a throwaway database
  (backfill, multi-location, the full Jazz Braids flow, revenue, the price
  snapshot, follow-ups, filters, duplicates, the referral link and a forged
  cookie, roles).
- `node tools/audit-crm-ui.mjs`: the screen at iPhone size and at desktop
  width (needs `npm run build` first): sign in, import, search, reach,
  log, move, schedule, sell, credit, Back to the same place, the Home's user
  numbers and period picker, and no page that scrolls sideways.
- `node tools/audit-crm-periods.mjs`: the period arithmetic on its own:
  Pacific days across both clock changes, comparison windows, custom ranges,
  the wording of a change, chart buckets.

The API audit also covers users: who may see what, a sign-up from a campaign
link keeping its source, a friend's invite, each tracked action and its
once-a-day rule, one minute either side of midnight, test accounts, custom
dates, cohorts and retention cells, and the team's own events.

Both run as part of `node tools/audit-all.mjs`.

## Deploying

1. Merge to `main`; Render deploys it and `migrate()` creates the `crm_*`
   tables and `analytics_events` at boot, and adds two nullable columns
   (`members.signup_attribution`, `login_codes.pending_attribution`) and an
   index on `members.created_at`. Every statement is `IF NOT EXISTS` / `ON
   CONFLICT DO NOTHING`; nothing existing is changed. Tracking starts at that
   boot.
2. Open `https://beastypages.com/crm`, enter the operator key.
3. Settings → Import from BEASTY → Preview, read it, then Run the import.
   Running it again later only adds businesses listed since.
4. In Settings → People, link Janelle's BEASTY account email to her person
   (she has the team role) so she can sign in; add any other referrers.
5. On Home, in Recent sign-ups, mark the team's own test sign-ups as test
   accounts so the user numbers count people.

Rolling back the code leaves the tables and columns in place and unused;
nothing else reads them, and the old code writes members exactly as before.

### The CRM at an address of its own

Leon, 2026-09-22: "CRM dashboard will be another url in render". The same
repository runs as a second Render web service, on the same database:

| | beastypages.com (the existing service) | the CRM service (new) |
|---|---|---|
| Branch | `main` | `main` |
| Build / start | as now | the same: `npm ci --include=dev && npm run build`, `npm start` |
| Health check | `/api/health` | `/api/health` |
| `DATABASE_URL` | beasty-db | the same beasty-db |
| `CRM_ONLY` | unset | `1` |
| `PUBLIC_URL` | unset | `https://beastypages.com` |
| `CRM_URL` | the CRM service's address, once it is up | unset |
| Everything else | as now | the same values (Render's environment groups share them), except `CRM_OPEN`, which is never set on either |

What each one answers:

- **The CRM service** answers `/crm`, `/api/crm/*`, the member sign-in
  endpoints (`/api/members/start`, `verify`, `signout`, `channels`) and
  `/api/health`. `/` opens `/crm`. Every other page, a referral link
  (`/r/<slug>`) included, is sent to `PUBLIC_URL`, so the visit is credited on
  the cookie the sign-up reads. Every other API path is a 404, everything is
  `noindex`, and its `robots.txt` disallows all of it. The kitchen simulator
  never runs there.
- **beastypages.com** keeps everything the CRM learns from: sign-ups and
  tracking, `/r/<slug>`, and Reserve a Spot turning into leads. With
  `CRM_URL` set, `beastypages.com/crm` sends people to the new address.

Signing in there: a browser keeps a site's sign-in to that site, so being
signed in on beastypages.com does not carry over. The sign-in card offers a
code to the BEASTY account a person already has (by text or email, whichever
the site can deliver) and the operator key. The card only ever signs in: an
address with no account is answered like one with an account but sent no
code, and the CRM service never makes an account at all. Referral links and
their QR codes are built with `PUBLIC_URL`, so they always open
beastypages.com.

Both services run `migrate()` at boot. Every statement in it is
`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`, and it holds a database lock
while it runs, because two boots creating the same new table at the same
moment collide in Postgres (tried: three runs out of three failed without
the lock, none with it).

Order: deploy `main` with the CRM merged, create the CRM service with the
variables above, check its address, then set `CRM_URL` on beastypages.com.
A custom domain (for example crm.beastypages.com) is a CNAME at the domain's
DNS, added in Render's Custom Domains for the CRM service.
