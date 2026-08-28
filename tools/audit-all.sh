#!/bin/bash
# Every audit, in one run, with the exit code of each recorded.
#
# NOT PIPED TO tail. A pipeline reports the exit code of its LAST stage, so
# `node audit.mjs | tail -3 && git push` pushes a red build — the failure is on
# screen and the shell never saw it. Each audit's status is captured directly.
#
#   bash tools/audit-all.sh            # everything, 6 at a time
#   bash tools/audit-all.sh fast       # skip the slow page walks
#   J=1 bash tools/audit-all.sh        # one at a time, for a clean read
#   J=10 bash tools/audit-all.sh       # more, on an idle machine
#
# THEY RUN IN PARALLEL, and they are safe to: every audit picks its own free
# port and its own database file (/tmp/audit-<name>.db), so two never share a
# server or a row. The bound matters anyway — each one is a node server plus a
# chromium, and this machine has other agents on it. Six is the default: it
# takes the suite from about seven minutes to about a hundred seconds and still
# leaves the box usable.
#
# PARALLELISM BROKE ONE AUDIT BEFORE IT SPED ANY UP. audit-about waited fixed
# milliseconds after a tap; with six browsers competing, a 500ms animation took
# longer than 500ms and the audit reported that tapping a chapter opened
# nothing. Every wait in it is a condition now. If a new audit sleeps on a
# number after an action, it will fail here first and it will not be the app.
set -u
cd "$(dirname "$0")/.."
LOG=${LOG:-/tmp/audit-all.log}
DIR=/tmp/audit-all.d
J=${J:-6}
rm -rf "$DIR"; mkdir -p "$DIR"; : > "$LOG"

echo "Building first — three audits serve dist/ and would test the last build."
npm run build >> "$LOG" 2>&1 || { echo "BUILD FAILED — see $LOG"; exit 1; }

# The data audit is a BUNDLE with the source compiled in; stale, it audits a
# snapshot and passes forever. Rebuilt every run.
npx esbuild tools/audit-data.ts --bundle --platform=node --format=esm \
  --jsx=automatic --outfile=.verify/audit-data.mjs --log-level=error >> "$LOG" 2>&1

_one() {
  local name=$1; shift
  "$@" > "/tmp/audit-all.d/$name.log" 2>&1
  echo $? > "/tmp/audit-all.d/$name.rc"
}
export -f _one

# The audits talk to Postgres now, each to its own throwaway database. Locally
# that is a container; set TEST_DATABASE_URL to point somewhere else. Checked
# here rather than in ten separate audits, so the failure says what is wrong
# once instead of ten confusing connection errors at random.
: "${TEST_DATABASE_URL:=postgres://beasty:beasty@localhost:55432/postgres}"
export TEST_DATABASE_URL
if ! node -e "
const pg=require('pg');const c=new pg.Client({connectionString:process.env.TEST_DATABASE_URL});
c.connect().then(()=>c.end()).then(()=>process.exit(0)).catch(()=>process.exit(1))
" 2>/dev/null; then
  echo "No Postgres at TEST_DATABASE_URL. Start one with:"
  echo "  docker run -d --name beasty-pg -e POSTGRES_PASSWORD=beasty -e POSTGRES_USER=beasty \\"
  echo "    -e POSTGRES_DB=beasty -p 55432:5432 postgres:16-alpine"
  exit 1
fi

JOBS=(
  "data node .verify/audit-data.mjs"
  "code /opt/homebrew/bin/python3 tools/audit-code.py"
  "icons /opt/homebrew/bin/python3 tools/audit-icons.py"
  "gate node tools/audit-gate.mjs"
  "otp node tools/audit-otp.mjs"
  "login node tools/audit-login.mjs"
  "payments node tools/audit-payments.mjs"
  "stripe node tools/audit-stripe.mjs"
  "signals node tools/audit-signals.mjs"
  "referral node tools/audit-referral.mjs"
  "member-ui node tools/audit-member-ui.mjs"
  "about node tools/audit-about.mjs"
  "journey node tools/audit-journey.mjs"
)
if [ "${1:-}" != "fast" ]; then
  JOBS+=(
    "design node tools/audit-design.mjs"
    "run node tools/audit-run.mjs"
    "landing-flip node tools/audit-landing-flip.mjs"
    "hero-ink node tools/audit-hero-ink.mjs"
    "contrast node tools/audit-contrast.mjs"
    "reel-sound node tools/audit-reel-sound.mjs"
    "reel-share node tools/audit-reel-share.mjs"
  )
fi

echo "Running ${#JOBS[@]} audits, $J at a time."
printf '%s\n' "${JOBS[@]}" | xargs -P "$J" -L1 bash -c '_one "$0" "$@"'

# Each audit spawns its own server and tsx leaves the child behind; without
# this they pile up and later runs time out waiting for a page to load.
pkill -f 'FB-work/node_modules/.bin/tsx server/index.ts' 2>/dev/null
pkill -f 'npm exec tsx server/index.ts' 2>/dev/null

pass=0; fail=0; failed=()
for j in "${JOBS[@]}"; do
  name=${j%% *}
  rc=$(cat "$DIR/$name.rc" 2>/dev/null || echo 1)
  printf '===== %s =====\n' "$name" >> "$LOG"
  cat "$DIR/$name.log" >> "$LOG" 2>/dev/null
  printf 'exit=%s\n' "$rc" >> "$LOG"
  if [ "$rc" = "0" ]; then printf '  PASS  %s\n' "$name"; pass=$((pass+1))
  else printf '  FAIL  %s\n' "$name"; fail=$((fail+1)); failed+=("$name"); fi
done

echo
echo "$pass passed, $fail failed.  Full output: $LOG"
if [ "$fail" -gt 0 ]; then
  printf 'FAILED: %s\n' "${failed[*]}"
  for f in "${failed[@]}"; do
    echo "--- $f ---"
    tail -14 "$DIR/$f.log" 2>/dev/null
  done
  exit 1
fi
echo "ALL GREEN"
