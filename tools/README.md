# Audits

Six checks, none of which a build or a typecheck will do for you. All of them
exist because the fault they look for has shipped from this repo at least once.

    node   tools/audit-design.mjs                              # contrast, tap targets, overlap, clipping
    node   tools/audit-run.mjs                                 # what the app claims at runtime
    node   tools/audit-landing-flip.mjs                        # the landing rotation, end to end
    python3 tools/audit-code.py                                # dead files, stray logs, orphan CSS
    npx tsx --tsconfig tsconfig.app.json tools/audit-data.ts    # roster claims that could be false
    node   tools/audit-hero-ink.mjs                            # text over a business's own film
    node   tools/audit-reel-sound.mjs                          # the watch window actually has sound
    node   tools/audit-reel-share.mjs                          # share reaches the tap, and leaves the sound alone
    node   tools/audit-gate.mjs                                # six doors shut signed out, directory still open
    node   tools/audit-referral.mjs                            # a shared QR link credits the sharer

`audit-design`, `audit-run` and `audit-landing-flip` build and serve the app
themselves, so run `npm run build` first if you have just changed source.

## Rebuilding the landing photographs

    /opt/homebrew/bin/python3 tools/make-landing-photo.py --all
    /opt/homebrew/bin/python3 tools/make-landing-photo.py CbeQ8X4uCkn 4

Needs `/opt/homebrew/bin/python3` specifically — `/usr/bin/python3` has no cv2.
See `public/landing/CREDITS.md` for which post is in which slot and why the
resolution is capped where it is.
