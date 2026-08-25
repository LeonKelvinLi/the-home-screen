#!/bin/bash
# Every audit, in one run, with the exit code of each recorded.
#
# NOT PIPED TO tail. A pipeline reports the exit code of its LAST stage, so
# `node audit.mjs | tail -3 && git push` pushes a red build — the failure is on
# screen and the shell never saw it. Each audit's status is captured directly.
#
#   bash tools/audit-all.sh            # everything
#   bash tools/audit-all.sh fast       # skip the slow page walks
set -u
cd "$(dirname "$0")/.."
LOG=${LOG:-/tmp/audit-all.log}
: > "$LOG"
pass=0; fail=0; failed=()

run() {
  local name=$1; shift
  printf '===== %s =====\n' "$name" >> "$LOG"
  if "$@" >> "$LOG" 2>&1; then
    printf '  PASS  %s\n' "$name"; pass=$((pass+1))
  else
    printf '  FAIL  %s\n' "$name"; fail=$((fail+1)); failed+=("$name")
  fi
  printf 'exit=%s\n' "$?" >> "$LOG"
}

echo "Building first — three audits serve dist/ and would test the last build."
npm run build >> "$LOG" 2>&1 || { echo "BUILD FAILED — see $LOG"; exit 1; }

# The data audit is a BUNDLE with the source compiled in; stale, it audits a
# snapshot and passes forever. Rebuilt every run.
npx esbuild tools/audit-data.ts --bundle --platform=node --format=esm \
  --jsx=automatic --outfile=.verify/audit-data.mjs --log-level=error >> "$LOG" 2>&1

run "data          " node .verify/audit-data.mjs
run "code          " /opt/homebrew/bin/python3 tools/audit-code.py
run "gate          " node tools/audit-gate.mjs
run "otp           " node tools/audit-otp.mjs
run "login         " node tools/audit-login.mjs
run "payments      " node tools/audit-payments.mjs
run "referral      " node tools/audit-referral.mjs
run "member-ui     " node tools/audit-member-ui.mjs
run "about         " node tools/audit-about.mjs
run "journey       " node tools/audit-journey.mjs

if [ "${1:-}" != "fast" ]; then
  run "design        " node tools/audit-design.mjs
  run "run           " node tools/audit-run.mjs
  run "landing-flip  " node tools/audit-landing-flip.mjs
  run "hero-ink      " node tools/audit-hero-ink.mjs
  run "contrast      " node tools/audit-contrast.mjs
  run "reel-sound    " node tools/audit-reel-sound.mjs
  run "reel-share    " node tools/audit-reel-share.mjs
fi

# Each audit spawns its own server and tsx leaves the child behind; without
# this they pile up and later runs time out waiting for a page to load.
pkill -f 'FB-work/node_modules/.bin/tsx server/index.ts' 2>/dev/null
pkill -f 'npm exec tsx server/index.ts' 2>/dev/null

echo
echo "$pass passed, $fail failed.  Full output: $LOG"
if [ "$fail" -gt 0 ]; then
  printf 'FAILED: %s\n' "${failed[*]}"
  for f in "${failed[@]}"; do
    echo "--- ${f// /} ---"
    awk "/^===== ${f// /} /,/^exit=/" "$LOG" | tail -12
  done
  exit 1
fi
echo "ALL GREEN"
