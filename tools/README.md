# Audits

Six checks, none of which a build or a typecheck will do for you. All of them
exist because the fault they look for has shipped from this repo at least once.

    node   tools/audit-design.mjs                              # contrast, tap targets, overlap, clipping
    node   tools/audit-run.mjs                                 # what the app claims at runtime
    node   tools/audit-landing-flip.mjs                        # the landing rotation, end to end
    python3 tools/audit-code.py                                # dead files, stray logs, orphan CSS
    npx tsx --tsconfig tsconfig.app.json tools/audit-data.ts    # roster claims that could be false
                                                               #   NOT .verify/audit-data.mjs, which is a bundle with
                                                               #   the data compiled in and goes stale silently
    node   tools/audit-hero-ink.mjs                            # text over a business's own film
    node   tools/audit-reel-sound.mjs                          # the watch window actually has sound
    node   tools/audit-reel-share.mjs                          # share reaches the tap, and leaves the sound alone
    node   tools/audit-gate.mjs                                # six doors shut signed out, directory still open
    node   tools/audit-referral.mjs                            # a shared QR link credits the sharer
    node   tools/audit-member-ui.mjs                           # the QR is on the profile, a tier can be taken
    node   tools/audit-otp.mjs                                 # login codes: private, single-use, no oracle
    node   tools/audit-payments.mjs                            # pending -> active -> lapsed, forgeries refused
    node   tools/audit-about.mjs                               # About: chapters closed until tapped, picture loads
    node   tools/audit-login.mjs                               # sign-in: reissue a code, no env names on screen
    node   tools/audit-journey.mjs                             # the whole journey in one session, 22 steps
    node   tools/live-smoke.mjs                                # production, read-only, creates nothing

`audit-design`, `audit-run` and `audit-landing-flip` build and serve the app
themselves, so run `npm run build` first if you have just changed source.

## Everything, in one run

    bash tools/audit-all.sh          # all seventeen
    bash tools/audit-all.sh fast     # skip the slow page walks

Builds first (three audits serve `dist/` and would otherwise test the previous
build), rebuilds the data-audit bundle, records each audit's own exit code
rather than a pipeline's, and prints the tail of anything that failed. It also
reaps the `tsx` servers each audit leaves behind — left to pile up they starve
later runs and page loads start timing out.

`tools/audit-journey.mjs` is the one that tests the joins rather than a seam:
one browser session, stranger to lapsed member, 22 steps in order.

## Checking what is actually live

    node tools/live-check.mjs "Send another code" "Sign in or join"

Follows the entry bundle to every chunk it imports and greps all of them, then
exits non-zero if any string is absent. Use it instead of grepping
`assets/index-*.js` by hand: the app is code-split, so the landing screen is in
the entry and everything behind the home screen — sign-in, Account, membership —
is in `Shell-*.js`. Grepping only the entry reports a landed deploy as missing.

## Rebuilding the landing photographs

    /opt/homebrew/bin/python3 tools/make-landing-photo.py --all
    /opt/homebrew/bin/python3 tools/make-landing-photo.py CbeQ8X4uCkn 4

Needs `/opt/homebrew/bin/python3` specifically — `/usr/bin/python3` has no cv2.
See `public/landing/CREDITS.md` for which post is in which slot and why the
resolution is capped where it is.
