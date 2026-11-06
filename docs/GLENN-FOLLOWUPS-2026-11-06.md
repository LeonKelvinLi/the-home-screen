# Glenn’s November 6 product questions

Source: IMG_9527.PNG, sent at 8:52 a.m. Pacific. At 9:09 a.m., Glenn liked Leon’s reply promising the newsfeed/ads and affiliate profile as future work. These are product follow-ups separate from the completed directory/media sync in Batches 100–101.

## Affiliate news and calendar submissions

Current behavior: News is drawn from curated source data in `src/data/news.ts` and `src/apps/NewsApp.tsx`. News entries with `eventDate` also appear on the calendar. The calendar reads operator-managed database events from `GET /api/events`. Creating or removing those entries requires the operator token, through `POST /api/events` and `DELETE /api/events/:id` in `server/index.ts`.

Answer: affiliates currently need the operator to publish their event. There is no completed affiliate-facing submission form. A self-service flow needs authenticated business ownership, a dated event form, review/publishing controls and a single event record feeding both surfaces.

## Affiliation profile and editing business details

The site has member profiles, affiliate onboarding and the operator CRM. Those do not establish a completed affiliate dashboard for editing public business facts, submitting news and managing events. This requested workspace remains open product work. The implementation should tie edits to the affiliate’s verified business and provide a clear review/publish result.

## Pricing and recruitment advertisements

Glenn asks about three ads: membership pricing, affiliate pricing and BARK recruitment memberships. His note explicitly says these are not a priority and can follow website readiness. They are deferred at his instruction; no ad was created or published by this sync.

## Other separate project notes

The November 5 BSTY GOODS brief describes a Mercari-style marketplace with 78 inventory codes (A-1 through Z-3) and two-item trade selection boxes. Leon quoted this as a separate MVP and offered a call. The proposed move of the Reborn auction to BEASTY Supply Co remains a discussion point rather than an approved migration.
