# Top 3 friends, the MySpace way

Glenn, 24 September 2026, through Leon: "top 3 friends where they can share",
"exactly like myspace concept". Designed with Leon on 25 September.

## What it is

Members send each other friend requests. Once accepted, they are friends, and
each member picks and orders a Top 3 (#1, #2, #3) from their friends, shown on
their profile the way MySpace showed its Top 8. Friend counts are shown, as on
MySpace; this reverses the "no counts that measure popularity" note in
`src/apps/ProfileApp.tsx`, on Glenn's word.

Signed-in members only, like Contacts. Nothing here is visible to visitors
who are not signed in.

## Decisions

| Question | Answer |
|---|---|
| What "top 3 friends" means | Shown on the profile (not share targets, no messaging) |
| Consent | Friend request, accept or decline; Top 3 only from accepted friends |
| Friend count | Shown |
| Notifications | In the app only: a red badge on Profile. No email |
| Pictures other members see | A built pet (saved to the account); a member using a photo shows initials until the emoji filter exists. Photos are never stored on the server |
| Blocking | Not built. Decline and Remove cover it; add later if needed |

## What members see

### Your own Profile (`src/apps/ProfileApp.tsx`)

- **Top 3 friends**, a new row under "Number one spot" and above "Top 9
  favourites": three circles, each with the friend's picture and first name
  and a #1, #2 or #3. Tapping one opens that friend's page. **Edit** picks
  from your friends and reorders them. With fewer than three friends the row
  shows what there is and an **Add friends** button that opens Contacts.
- **Friends (N)**: the full list, each with Remove friend.
- **Friend requests**: shown only while any are waiting, each with Accept and
  Decline.
- **Share my page**: shares the member's existing referral link. Someone who
  joins through it lands on the sharer's page, one tap from Add friend.

### Someone else's page (the member sheet in `src/apps/PhoneApp.tsx`)

Their picture, name and join month as today, plus their friend count, their
Top 3 and one button whose state follows the relationship:

| Relationship | Button |
|---|---|
| None | Add friend |
| You asked | Request sent (tap to cancel) |
| They asked | Accept / Decline |
| Friends | Friends ✓ (tap for Remove friend) |
| It is you | none |

Their liked and starred businesses stay below, unchanged.

### The badge

The Profile tile (`sys.profile`, second in dock set 1) shows the number of
waiting requests, through `badgeFor` in `src/ios/HomeScreen.tsx`, which today
returns 0 for every `sys.*` tile. It clears when the requests are answered.

## Rules

- Removing a friend removes them from both members' Top 3 in the same
  transaction. Nobody is told they were removed.
- A declined request is kept as declined; the same person cannot ask again
  for 30 days. A cancelled request is deleted.
- If both members ask each other, the second request accepts the first.
- At most 30 new requests a day per member.
- A deleted member's friendships and Top 3 rows are deleted with them.

## Data

Additive tables, created by `migrate()` in `server/db/schema.ts`:

- `member_friendships`: `requester_id`, `addressee_id` (both `REFERENCES
  members(id) ON DELETE CASCADE`), `status` (`pending`, `accepted`,
  `declined`), `created_at`, `responded_at`. A unique index on
  `(LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id))`
  allows one row per pair in either direction.
- `member_top_friends`: `member_id`, `position` (1 to 3), `friend_id`; primary
  key `(member_id, position)`, unique `(member_id, friend_id)`, both ids
  cascading. The server accepts only accepted friends.
- `member_avatars`: `member_id` (primary key, cascading), `species`, `coat`,
  `backdrop`, `accessory`, `updated_at`. Each value is checked against the
  lists in `src/apps/PetAvatar.tsx`. No photo column.

## Server

All routes need a signed-in member, answer 401 otherwise, and are rate limited
like the other `/api/members` routes.

- `POST /api/friends/requests` `{ to }`: send (or accept, if they already asked).
- `DELETE /api/friends/requests/:to`: cancel your own request.
- `POST /api/friends/requests/:from/accept` and `/decline`.
- `DELETE /api/friends/:id`: remove a friend.
- `GET /api/friends`: my friends, my waiting requests, my Top 3.
- `PUT /api/friends/top` `{ ids: [a, b, c] }`: set my Top 3 in order (0 to 3
  ids, all accepted friends, no repeats).
- `PUT /api/members/me/avatar` `{ kind: 'pet' | 'none', pet }`: save the built
  pet (called when the profile's pet changes while signed in).
- `GET /api/members/:id/profile` gains `avatar`, `friendCount`, `top3`
  (`{ id, name, avatar }[]`) and `relation` (`none`, `sent`, `received`,
  `friends`, `me`).
- `GET /api/members/me` gains `friendRequests` (the waiting count).

Events in `server/analytics.ts`: `friend_requested`, `friend_accepted`
(meaningful) and `friend_removed`.

## Client

- `src/lib/friends.ts`: the calls above and a small store for the waiting
  count, refreshed when the app opens and when Profile or Contacts closes.
- `src/lib/profile.ts`: when signed in, saving a built pet also saves it to the
  account. A photo stays on the device as today.
- `src/apps/ProfileApp.tsx`: the Top 3 row, Friends, Friend requests, Share my
  page. The note saying the profile is on this device only is reworded: the
  pet and friends are on the account, a photo is not.
- `src/apps/PhoneApp.tsx`: the member sheet's picture, count, Top 3 and button.
- `src/ios/HomeScreen.tsx`: the Profile badge.

## Testing

`tools/audit-friends.mjs`, on a throwaway database like the other audits:

1. API: send, cancel, accept, decline, remove; the 30-day block after a
   decline; crossed requests; the daily limit; Top 3 only from friends, at
   most 3, in order, repeats refused, cleared on removal; 401 when signed out;
   nobody can change another member's Top 3; a deleted member's rows go.
2. Two members on two phone-sized browsers: A sends, B sees the badge, accepts,
   the badge clears, A puts B at #1, and B's page on A's phone and A's page on
   B's phone show the right button and Top 3.

Then the full suite, and live-verify rows that check the shipped bundle without
writing anything to production.

## Not in this

- The emoji filter for uploaded pictures: its own design, next.
- Messages, feeds, comments, blocking, email notifications.
