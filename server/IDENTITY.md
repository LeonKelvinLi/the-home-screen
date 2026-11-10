# Shared BEASTY account authority

`registerIdentity(app, deps)` in `identity.ts` adds a first-party authorization-code service and Google entry to the existing Pages members. It preserves the existing email/SMS code sign-in. Root integration owns the route wiring, Google project credentials, Goods consumer and deployment.

The function returns `{recordEmailProof(memberId, email)}`. Call that helper only after a successful **email** code verification for the member, including new and returning members. Do not call it after SMS verification or from client-submitted profile data. The helper records a proof only while that email matches the current member contact. No public endpoint can set an email proof.

## Dependencies and configuration

Required dependencies are `pool`, `memberFromRequest(req)`, `startSession(res, memberId)`, `newReferralCode()`, canonical `origin`, separate purpose-derived `secret` and `clientSecret` (at least32 characters each), and exact `clientRedirectUris`. Optional Google credentials are `googleClientId` and `googleClientSecret`. The origin must be HTTPS; HTTP is accepted only for loopback development/testing. Host headers never choose an identity origin or callback.

The first-party client ID is `bsty-goods`. Its secret is server-only and separate from the browser-state secret. Redirect addresses are fixed server configuration; wildcard/subdomain/prefix matching is not supported. The Google callback is exactly `origin + /api/identity/google/callback` and must be registered in the Google project's Web OAuth client.

The installed Goods Better Auth Generic OAuth consumer uses its standard social callback, exactly `/goods/api/auth/callback/beastypages` when hosted under `/goods`. It does not use the older plugin-specific `/oauth2/callback/` route. Google returns to Pages; Pages returns to this separately registered Goods callback.

Google is reported enabled only when both actual configuration values are present. A configured client is still subject to Google's consent, audience and verification settings; presence of credentials does not prove a live Google sign-in succeeded. No Google API beyond OpenID basic identity is requested. The module provisions no project, billing, API subscriptions or developer accounts.

For fixture tests only, `googleClient` may inject the `generateAuthUrl`, `getToken` and `verifyIdToken` methods. The production default is Google's supported `OAuth2Client`. There is no environment flag, HTTP route, credential shortcut or unsigned-token bypass for tests.

## Routes

- `GET /api/identity/status`: private current member summary, `googleEnabled`, `codeEnabled` and `googleLinked`; no-store.
- `GET /api/identity/authorize`: fixed first-party client, exact registered redirect, code response, state and S256 PKCE required. Signed-out users return through `/login`. `connection=google` goes through Google once, then continues without the hint. Only basic `openid profile email` scope exists.
- `POST /api/identity/token`: URL-encoded or JSON authorization-code grant, confidential client authentication (post or Basic), matching redirect and PKCE verifier. Codes are consumed atomically after every validation succeeds. Wrong PKCE/client/redirect does not consume a valid code. Access tokens have a five-minute lifetime and no refresh grant.
- `GET /api/identity/userinfo`: valid short-lived opaque Bearer token only. Returns stable Pages member ID as `sub`, current name/contact/place and a proof-based `email_verified` flag. Referrals, payment records, membership finances and other users are excluded.
- `GET /api/identity/google/start`: normal Google authorization request with browser-bound signed state, nonce and S256 PKCE. Explicit `mode=link` requires an existing Pages session.
- `GET /api/identity/google/callback`: consumes the browser-bound attempt, exchanges its code through the Google library and validates the ID token's signature, issuer, audience, expiry and nonce. Link callbacks also require the same currently authenticated Pages member.

Google access/refresh tokens and raw ID tokens are not retained. Raw first-party authorization codes and Bearer tokens are not stored; only SHA-256 hashes of high-entropy random values persist. Google PKCE verifiers are encrypted with a separate purpose-derived AES-GCM key; nonces and browser bindings are hashed. Attempts expire after10 minutes, first-party codes after90 seconds. An authorization attempt is one-use even after a provider failure; start a fresh attempt to retry.

## Identity and email ownership

The mapping key is `(provider='google', subject=sub)` in the existing `member_identities` table. Email never merges accounts. A new Google identity whose email collides with an existing unlinked Pages member must use the existing code sign-in and then explicitly connect Google. A Google identity already attached to another member cannot be reassigned by linking. A member can explicitly connect one Google identity through this flow; a second different Google identity is refused.

New Google accounts are free members, with no paid tier, referral attribution, phone number, billing profile or purchases invented. Repeated Google sign-ins resolve the same provider subject to the same Pages member. Public profile names/contact are not overwritten merely because a provider returned new text.

Google's verified email is accepted as authoritative for Gmail or a verified Google Workspace `hd` claim. Google notes that a third-party address may have changed owners since its original verification. A new Google account with a third-party address and no Workspace claim therefore has `members.email = NULL`, retains its stable Google identity and uses the Goods adapter's non-deliverable internal identity alias. It does not gain a legacy email-code credential on that claim alone. Google sign-in remains available. A future contact-verification workflow must prove and attach an address to this same member; this module does not silently create or merge another member to do that.

Explicit linking may fill a phone-only member's empty email from an authoritative Google claim if that email belongs to no other member; it never replaces an existing contact. `email_verified` is true only for a recorded proof matching the current contact. Email-code proofs and Google proofs are stored separately, and a Google proof must still reference that member's linked Google subject. Old optional emails attached to phone accounts are not automatically declared verified.

In Goods, the first SSO sign-in uses that proved email or a stable non-deliverable alias for the authentication row. Later SSO sign-ins synchronize the shared display name and a private verified-email snapshot; they preserve the existing Goods recovery email. This keeps a legacy Goods login intact and avoids locking out an already linked subject when the Pages contact collides with another Goods account. The shared identity and Goods email sign-in are labeled separately in Settings. The display name is capped at Goods' existing 80-character limit. Phone-only members may explicitly link their proved Pages subject because `beastypages` is the trusted first-party provider; implicit email-based linking remains disabled.

Goods removes its shared snapshot on provider unlink and account deletion. Its binding is checked while synchronizing, so an unlink cannot leave a private identity snapshot behind. Relinking requires both authenticated sessions again and updates the snapshot's stable member ID.

## Storage, error handling and testing

Only additive `beasty_identity_*` tables are created: authorization codes, opaque identity tokens, Google attempts, email proofs, rate limits and minimal action audit. Existing member/provider tables stay authoritative. Schema initialization is serialized with an advisory transaction lock. Rate limits persist in PostgreSQL and retain only keyed hashes of request-source buckets. Startup prunes stale limiter buckets; expired codes/tokens/attempts can be pruned with a separately reviewed maintenance job.

All identity responses are no-store and use no-referrer. Redirect errors contain a safe constant `identityError` and validated local `returnTo`; no address, provider token, secret or private identity appears in the error URL. Unexpected provider exceptions are never logged as objects because those exceptions may carry token request metadata.

Use isolated databases and fixture-injected Google methods for state, PKCE, nonce, expiry, collision, linking and replay tests. Stub provider proof is distinct from actual Google configuration and live signed-in browser proof.

Sources: [Google OpenID Connect server flow](https://developers.google.com/identity/openid-connect/openid-connect), [Google backend ID-token verification and email authority](https://developers.google.com/identity/sign-in/web/backend-auth).
