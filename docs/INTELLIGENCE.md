# BEASTY intelligence: data model, screens and phases

Leon's brief of 2026-09-24 ("Behavioral Intelligence + Audience Opportunity
System"), the instrumentation audit it asked for first (kept outside the repo;
its findings are summarised below), and this plan, which Leon approved with
"continue" on 2026-09-24, taking the recommended answer to each open decision.

## Status

| Phase | State |
|---|---|
| 1. Audit | Done, 2026-09-24 |
| 2. Foundation | Built, 2026-09-24: `server/intel.ts`, `src/lib/track.ts`, the tables below, `POST /api/t/events`, the device cookie on the first page, the identity link on sign-up and sign-in, the team-device link `/t/team/<token>`, the directory snapshot and seat history at boot, retention. |
| 3. Instrumentation | Built, 2026-09-24. The page reports `page_viewed` and `tile_impression` (the home screen, settled 1 s), `business_opened` with where it came from (home tile, search result, Search's list, city row, Glenn's button, a shared link) and `business_closed` with dwell, `search_started`, `search_submitted` (typing paused 1.2 s, or a result tapped, with the result count), `search_result_clicked` (business, item or city, with rank), `outbound_clicked`, `place_navigated`, `share_clicked`, `gate_shown`, `reserve_started` (with the blank seat), and `clip_played` (2 s actually watched). The server adds `lead_submitted` and `guest_order_placed` against the device, and `membership_activated` and `membership_lapsed` from Stripe. The app switcher's previews count nothing. Positions count from 1. Proven by `tools/audit-analytics.mjs` (51 checks against the rows, including a visit tapped through on a phone). Not yet: `search_results_shown` (its count rides on `search_submitted`), `gate_converted`, a share id carried in the link, and the recents, favourites, news and gallery surfaces. |
| 4-7 | To come |

Decisions taken (Leon, "continue", 2026-09-24): a deleted member's events are
kept with the member link cleared; raw events are kept 395 days
(`ANALYTICS_RETENTION_DAYS`); submitted searches are kept normalized, and
dropped when they look like a phone number or an email; a browser sending
Global Privacy Control is counted with no visitor, session or member; the team
marks its own phones with a private link.

## Where we start (from the audit)

- **Already there.** One append-only table, `analytics_events`, with 27 named
  events, a `tracking_started` marker (2026-09-23), a daily visit beacon,
  sign-up attribution on members, and the CRM Home's user numbers. Every
  write goes through `track()` in `server/analytics.ts`, and it never throws.
- **Missing, and not recoverable later:**
  - no browsing sessions;
  - no tile impressions;
  - no record of which seat or surface an open came from;
  - no link from a visitor's history to their account;
  - no outbound clicks (call, directions, website, Instagram);
  - no search events;
  - no payment conversions;
  - no history of placements or business names.
- **Wrong today:**
  - Visitors are almost invisible: views are recorded for members only.
  - Each visit reports the first stored source rather than its own.
  - The app switcher's previews count as views.
  - Affiliate like and share counts include the team and bots.
  - Deleting a member deletes their events, so past totals change.

## Principles

1. **One event model.** No one-off counters. Raw events are append-only;
   everything the CRM shows comes from rollups.
2. **Record the context when it happens.** Store the seat, city, page kind,
   surface, position and a business snapshot on each event, because
   placements, names and page breaks change.
3. **Name every metric once.** Metrics are defined in one module used by both
   the server and the screens:
   - an impression is not a view;
   - a view is not an open;
   - people are not sessions.

   Every number shows its period and its "tracked since" date.
4. **Analytics never slows or breaks the site.** Events are queued in memory,
   batched, and sent with `sendBeacon` or a keepalive fetch. Nothing ever
   awaits them. If blocked or offline, they are simply lost.
5. **Explainable labels only.** Every label ("High opportunity", "Heating
   up") comes from a written rule and shows its evidence. No black-box
   scores; no LLM writing numbers.

## Data model

### Identity

| Table | Holds | Notes |
|---|---|---|
| `analytics_visitors` | `anon_id` PK, first_seen, last_seen, `first_touch` (source, medium, campaign, referrer host, entry type, landing), `member_id` (null until linked), linked_at, `is_internal` | `anon_id` is the existing httpOnly `beasty_device` cookie, hashed. It will be set on the first page response rather than the beacon, because a beacon's Set-Cookie may not stick on iOS Safari. First touch is written once and never overwritten. |
| `analytics_sessions` | `session_id` PK, anon_id, member_id, started_at, last_at, `entry_type` (direct, shared business, member referral, register QR, CRM referral link, UTM, search engine, social), landing, referrer host, utm fields, device class, platform, app version, event count, is_bot | The client mints the id and keeps it in localStorage with a last-activity time: a new session after 30 idle minutes or a new campaign link. The session's source is the last touch. |
| (link) | sign-up and sign-in write the current `anon_id` onto the member's events and set `analytics_visitors.member_id` | Earlier anonymous rows stay as they were. A member's timeline joins through the link, so original attribution is never rewritten. One member can have several devices. |

### Events: extend `analytics_events`, don't replace it

The 27 existing names keep working. New columns, each indexed where a screen
filters on it:

- **Who:** `anon_id`, `session_id` (browsing session; the login-token hash
  moves to metadata).
- **Business:** `brand_id`.
- **Where:** `city`, `page_kind` (goods, services, goods2, services2, online,
  individuals), `seat` (for example `union-city-goods-2`), `surface`, `position`.
- **Search:** `query_norm`.
- **Device:** `device` (phone, tablet, desktop), `platform`, `app_version`.
- **Flags:** `is_internal`, `is_bot`, `client_at`.

`surface` is one of: home tile, search result, city row, nav place button,
reel, share link, recents, favourites, news, gallery.

**New events:**

- **Sessions and pages:** `session_started`, `page_viewed` (a home page settled
  for at least 1 s, with city and kind).
- **Businesses:** `tile_impression` (at least half visible for 1 s, once per
  session per seat), `business_opened` (with its origin surface and seat),
  `business_closed` (with dwell time).
- **Search:** `search_started`, `search_submitted` (typing paused, or a result
  tapped; never individual keystrokes), `search_results_shown` (with a count
  and a zero flag), `search_result_clicked` (with rank).
- **Actions:** `outbound_clicked` (call, directions, website, order, menu,
  Instagram, clip source), `share_clicked` (every surface, with a share id
  carried in the link), `clip_played`.
- **Moves and gates:** `place_navigated` (Glenn's button and the city rows),
  `gate_shown` and `gate_converted` (which door a visitor hit).
- **Leads and money:**
  - `reserve_started` and `lead_submitted`, with the empty seat it came from;
  - `membership_activated` and `membership_lapsed`, from the Stripe webhook;
  - `guest_order_placed`.
- **Fixes to what exists:** views are recorded for visitors too, the app
  switcher stops counting, and the `source` field becomes consistent.

### History the repo can't keep

- `analytics_brand_days`: a daily snapshot per business (name, tier, seats,
  category, city, has website), written at boot and every night. Events can
  then be grouped by what a business *was* that day, and renames and removals
  keep their history.
- `analytics_placements`: seat, business, `from`, `to`. It is kept by diffing
  `CITY_PLACEMENTS` at each boot, so "this seat was Tony's Style until 22 Sep"
  is a fact, not a comment.

### Rollups, which is all the CRM reads

| Table | Grain | Holds |
|---|---|---|
| `analytics_business_daily` | Pacific day × business × surface × city | impressions, opens, unique viewers and openers that day, outbound clicks by kind, shares, saves, search appearances, search clicks |
| `analytics_business_people` | business × person × Pacific day, deduped | exact unique and returning people over any period, without scanning raw events |
| `analytics_search_daily` | Pacific day × normalized query × city context | searches, searchers, zero results, result clicks, opens after, the top businesses opened |
| `analytics_city_daily`, `analytics_category_daily` | Pacific day × city or kind | audience, opens, searches, businesses gaining |
| `analytics_sessions_daily` | Pacific day × entry type × device | sessions, new vs returning people, pages per session |

**How rollups run:**
- One job runs on the main service, never the CRM service, under an advisory
  lock. Every 10 minutes it recomputes today and yesterday in Pacific time; it
  is idempotent and DST-safe. Each night it recomputes the last 3 days.
- A test replays scripted journeys and checks the rollups against raw counts.

**Scale:**
- Impressions will be the biggest event.
- The indexes will be `(brand_id, occurred_at)`, `(anon_id, occurred_at)`,
  `(session_id)` and `(name, occurred_at)`.
- Raw events are kept 13 months by default (`ANALYTICS_RETENTION_DAYS`);
  rollups are kept forever.
- Before shipping I'll prove the query plans on a local copy with 1 million
  generated events.

### Data quality

- **Duplicates:** every client event carries its own id (dedupe key), and
  impressions are deduped per session, seat and business.
- **Bots:** user-agent filtering on every ingest path, not only the visit
  beacon, plus per-visitor rate limits.
- **Team traffic:**
  - members flagged internal, and every device linked to them;
  - a private "this is a team device" link;
  - CRM users.
- **Bad input:** unknown event names and malformed properties are refused and
  counted, so a dropped event shows up as a number instead of vanishing.
- **Unknown businesses:** a missing or unknown business id is refused.
- **Multi-city businesses:** every open says which seat it came from.

### Privacy

We don't record:
- keystrokes; a search counts only when submitted;
- passwords, form contents, IP addresses, precise location or full URLs;
- anything that infers sensitive traits.

Safeguards:
- Search text is normalized and dropped when it looks like a phone number or
  an email.
- A browser sending Global Privacy Control is counted only anonymously.
- Retention is a setting.

## Metrics, defined once

| Metric | Definition |
|---|---|
| Impression | A tile at least half on screen for 1 s, once per session per seat |
| Unique viewers | Distinct people (anon_id, or member once linked) with an impression |
| Open | A business page opened; opens = page loads |
| Open rate | Unique openers ÷ unique viewers, for the same period and surface |
| High-intent action | Call, directions, website, order, menu, or an Instagram click |
| Action rate | People with a high-intent action ÷ unique openers |
| Returning | Opened in this period and also on a different day before |
| Search CTR | Searches followed by a result click ÷ searches |
| Direct search | A submitted query that normalizes to the business's name |

Every figure carries its period (24H, 7D, 30D, 90D, All time), the stretch
it's compared with, and "tracked since".

## Audience opportunity (rules, not magic)

For each business in a period, four separate reads:

- **Current audience:** unique viewers and unique openers.
- **Engagement:** open rate and action rate, each against the median of its
  category in that city.
- **Momentum:** change against the previous stretch of the same length,
  shown only when both sides have at least 30 viewers.
- **Opportunity:** it rates **High** when all of these hold:
  - engagement is at least 1.5× the category median;
  - direct searches or momentum are rising;
  - exposure is below the category median.

  It rates **Too early** when there are fewer than 100 impressions or 20 opens.

Each label lists the exact rules that fired. For example: "open rate 2.1× the
category median; direct searches +34%; impressions 40% below the median".

Insights such as "Thai searches rose 42% in Fremont" are template sentences
filled only from rollup rows, and only above a minimum sample.

## Screens (the CRM, phone first)

- **Home**, answering "what needs me, what's growing, where is demand, who do
  I call":
  - a strip of four numbers: Audience, Business opens, Searches, High-intent
    actions, each with its period and comparison;
  - then Trending, Opportunities, Search demand, Unmet demand, Cities heating
    up, and CRM attention (today's To do).
- **Insights**, a new tab with three views:
  - **Search:** top, growing, zero-result and abandoned searches, and what
    people open after each;
  - **Cities:** drill down City → Category → Business;
  - **Opportunities:** the ranked list with its evidence.
- **Business page**, a command-centre header:
  - owner, city, category, step, website status, BEASTY listing;
  - four figures, a trend chart, then collapsible sections: Audience, Search
    demand, Engagement, Traffic sources, City-level geography, Timeline,
    Contacts, Notes, Tasks and Placement.
  - Prospecting lines, for example "searched 31 times this month", only when
    the data is there.
- **Person page (members):**
  - a timeline grouped by day, with filters for Searches, Businesses,
    Messages and Conversions;
  - "Observed interests" at the top, each opening to the events behind it.
- **Cohorts and funnels:** by sign-up week or month, plus two default funnels:
  - Home → City → Impression → Open → Action;
  - Search → Result → Open → Action.
- **One filter bar everywhere:** period, city, category, source, new or
  returning, known or anonymous. Filters stay set while drilling down, and
  every label has a "Why am I seeing this?" answer.

Design: I'll mock the new screens first on a design canvas (as I did for the
BEASTY book) and bring you the pick before building them.

## Phases

| # | Phase | Output | Test |
|---|---|---|---|
| 1 | Audit | `audit.md` (done) | none |
| 2 | Foundation | Schema: visitors, sessions, event columns, indexes, brand days, placement history. Also: the batch ingest endpoint with validation, the client tracker, the cookie on the first page response, internal and bot flags, retention, the metric module, identity link on sign-up and sign-in. | New `audit-analytics.mjs` covering your 16 validation journeys against actual database rows |
| 3 | Instrumentation | Every "must" row in the matrix: impressions, opens with origin, search, outbound clicks, shares with ids, gates, place navigation, Reserve with its seat, payments, guest orders | Same audit, extended; the site suite stays green |
| 4 | Rollups | The rollup tables and job | Raw-vs-rollup comparison on known journeys, plus a 1 M-event load run |
| 5 | CRM intelligence | Mockups first, then Home v2, business Audience, Insights (Search, Cities, Opportunities), person timelines and interests, and the filter bar | UI audit at 393 px and 1440 px, sideways scroll, empty states |
| 6 | Advanced | Cohorts on the new identity, configurable funnels, first- and last-touch attribution views, opportunity rules, template insights | Unit tests on every rule with fixed data |
| 7 | QA | Automated end-to-end journeys that check rows and rollups; mobile; analytics blocked; network failure | Full suite, then live verify |

Phases 2 and 3 matter most, because every day without them is data that's
gone. The screens in 5 and 6 only get useful once a few weeks of events exist.
I'd ship 2 and 3 first; each is one or two sessions, with the suite and a
live verify at each step.

## Decisions

Taken on 2026-09-24; see Status above. Each is a setting or one contained
piece of code, so any of them can change later without touching the rest.
