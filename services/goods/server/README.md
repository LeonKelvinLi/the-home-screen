# Goods API

The API is independent of BEASTY Pages. `createApp()` reads configuration when called, applies migrations, and returns `{app,pool,auth,close}`. `index.ts` listens on `PORT` (8791) and `HOST` (127.0.0.1). Containers must set `HOST=0.0.0.0`. `close()` flushes pending account-email attempts and closes resources. Nothing provisions infrastructure.

## Configuration

- `DATABASE_URL`: independent PostgreSQL database, required. TLS certificate verification follows the connection URL/standard pg settings; no disabled-verification fallback.
- `AUTH_SECRET`: at least 32 random characters, required; keep stable and private between restarts.
- `APP_URL`: canonical origin, default http://localhost:8791; HTTPS required in production. `TRUSTED_ORIGINS`: comma-separated additional exact HTTP(S) origins, HTTPS in production. All mutations require an allowed Origin, including CLI requests. Cookies are HttpOnly/SameSite=Lax and Secure on HTTPS. Ordinary browser requests use credentials and the same origin.
- `HOST`, `PORT`, `DIST_DIR`, `PGPOOL_MAX`; `TRUST_PROXY` is an explicitly chosen reverse-proxy hop count. Do not trust arbitrary forwarded headers.
- `MAIL_MODE=spool`: development/test only, JSON account emails in `MAIL_SPOOL_DIR` (default var/mail), directory0700/files0600. This is local test delivery, not real email delivery. Never serve or commit this directory.
- `MAIL_MODE=resend`: `RESEND_API_KEY` and `MAIL_FROM` required. Production requires this mode and verified email before sign-in. Email requests run asynchronously to avoid account enumeration through provider latency. Provider failures are logged without identifiers/tokens; users can request another email. Provider acceptance is not delivery evidence. This task does not send real account mail.
- `UPLOAD_DIR` defaults var/uploads. Development writes processed WebP files locally with restrictive permissions. Production requires either private `S3_BUCKET` or `PERSISTENT_UPLOADS=true` and a mounted persistent `UPLOAD_DIR`.
- S3: `S3_BUCKET`, `S3_REGION` (auto), optional `S3_ENDPOINT`, `S3_FORCE_PATH_STYLE=true`, standard AWS credential chain, optional `S3_ENCRYPTION=AES256`. Bucket stays private; photo delivery goes through access-controlled API. Back up database and images together.
- `ADMIN_EMAILS`: explicit comma-separated operator email allowlist, read when each profile is first created. Production accounts must verify email. Never infer roles from client input. Changing the allowlist does not silently escalate existing accounts; operator assignment changes need an explicit audited maintenance procedure.
- `API_RATE_LIMIT` defaults600/minute/IP and `AUTH_RATE_LIMIT`80/minute/IP. Counts persist across instances in PostgreSQL; Better Auth also retains its own login guard. Test suites may raise limits for isolated data only.

## State and authorization

Every protected endpoint validates the session against Better Auth's database; cookie-cache sessions are disabled for immediate revocation. Roles, restrictions, ownership, both-direction blocking, message participants, and photo access are enforced server-side. Passwords are hashed by Better Auth. Reset revokes existing sessions. Private contacts are excluded from public profiles and snapshots.

Profile initialization creates the profile and exactly78 inventory slots in one SQL statement. A database foreign key and partial unique index enforce valid owner/code and one occupied listing per position (draft/active/reserved). Codes are reusable only after release. Immutable listing IDs and offer snapshots preserve history. Listing creation/edit commands, trade proposals/actions and messages accept stable request IDs; payload mismatches fail409.

Trade writes lock participant rows in ID order, then listing rows in ID order, then the offer. `FOR NO KEY UPDATE` serializes status changes while allowing foreign-key references to immutable IDs; this avoids unnecessary FK lock cycles during notifications and favorites. Acceptance rechecks state, expiry, ownership, versions, blocking and availability; reservations for both items, competing-offer invalidations, events and notifications commit together. Pending offers reserve nothing. Expiry uses the same lock hierarchy and processes bounded batches. Notifications are persisted in the transaction, independent of optional external delivery.

Accepted means both items are reserved for coordination. Two independent confirmations are required for completion; these are participant declarations, not verified physical delivery. Two cancellation requests are required for cancellation. Dispute retains reservations until an operator records a resolution. Completion/cancellation release slots/reservations atomically. No money, shipping, escrow or delivery guarantees exist here.

Moderation may hide a reserved item using a separate visibility flag; its reserved status and occupied slot remain intact. Restriction revokes sessions and prevents new activity, but does not release accepted exchanges. Deletion refuses while accepted/disputed trades exist. Otherwise it disables/anonymizes the account, revokes credentials, removes private account email, archives active/draft inventory and preserves participant exchange/audit records. This retention policy is an implementation default requiring operator policy review before a public launch.

Unpublished drafts, including archived drafts, stay private. Publication timestamp distinguishes unavailable previously public items from drafts. Uploaded orphan photos are owner-only. Historic offer participants can still see referenced snapshot photos after edits. Operators can review reported content through role-protected report context; public APIs do not expose reports or reporter identities.

## Operations

Migrations run under a PostgreSQL advisory lock; Goods migration versions are recorded transactionally in `goods_migrations`. Better Auth's supported migration planner refuses unsafe schema changes. Review package upgrades and migration plans before production changes. Take a backup before migration, and restore database/photos to an isolated environment to verify it. Migration5 gives trade events a durable insertion sequence and real insertion timestamps, repairing historical timestamp ties so completion/cancellation follows its confirming action. Fresh-key retries of the same participant confirmation add no duplicate event.

Uploads persist two metadata-stripped WebP files: the original is constrained to1600px and the card thumbnail to480px on its longest edge, without enlarging smaller photos. `Photo.thumbnailUrl` requests `/api/photos/:id?size=thumb`; it follows exactly the same authorization checks as the original. Migration4 adds a nullable thumbnail key; older rows return their original bytes through the thumbnail URL. No resize runs during reads. Both files use independent UUID storage keys and cleanup is attempted for both after a failed upload transaction.

HTTP409 for a race or conflicting command means refresh authoritative state and retry with the same command ID only if the payload is unchanged. Failed transactions roll back both reservations. HTTP429 supplies Retry-After. Do not log raw request bodies, cookies, reset URLs or private messages.

Orphan processed files can remain if storage succeeds but cleanup after a database failure is unavailable. Use a read-only reconciliation of photos.storage_key and photos.thumbnail_storage_key against the private bucket/mount before any operator-approved cleanup; never delete referenced snapshots or avatar photos. Auth mail spool and test databases must be excluded from backups shared with reviewers.

Source references: [Better Auth Express integration](https://better-auth.com/docs/integrations/express), [PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql), [email/password/reset](https://better-auth.com/docs/authentication/email-password). Provider/version behavior is pinned by the repository lockfile and exercised by integration tests.
