#!/bin/bash
# Set environment variables on the live service, from a local file.
#
# The values never appear in this repo, in the shell history, or on screen:
# they are read from a file you write and delete, and only the KEY NAMES are
# printed back. Setting a variable through the API does NOT redeploy on its
# own, so this triggers the deploy itself at the end.
#
# The Render API key comes from ~/.render.env (override with RENDER_KEY_FILE).
# It has to be a key for the workspace that holds the-home-screen: the
# allcpr-stickers key this used to read cannot see this service at all.
#
#   1. write the file
#        cat > /tmp/beasty.env <<'VARS'
#        RESEND_API_KEY=re_xxxxxxxxxxxx
#        OTP_FROM_EMAIL=BEASTY <codes@yourdomain.com>
#        VARS
#   2. check what it would do
#        bash tools/set-render-env.sh /tmp/beasty.env
#   3. do it
#        bash tools/set-render-env.sh /tmp/beasty.env --apply
#   4. delete the file
#        rm -f /tmp/beasty.env
set -u
FILE=${1:?usage: set-render-env.sh <env-file> [--apply]}
APPLY=${2:-}
# the-home-screen was recreated on 2026-08-31 and got a new id; the old one
# (srv-d9nusqdaeets73cnca50) answers "not found" to everything.
SERVICE=${RENDER_SERVICE_ID:-srv-daaq49favr4c73b5s3i0}
KEYFILE=${RENDER_KEY_FILE:-$HOME/.render.env}

KEY=$(grep -m1 '^RENDER_API_KEY=' "$KEYFILE" | cut -d= -f2- | tr -d '"'\''' | tr -d ' \r')
[ -z "$KEY" ] && { echo "No RENDER_API_KEY in $KEYFILE"; exit 1; }
[ -f "$FILE" ] || { echo "No such file: $FILE"; exit 1; }

while IFS= read -r line; do
  case "$line" in ''|\#*) continue ;; esac
  name=${line%%=*}
  value=${line#*=}
  [ -z "$name" ] && continue
  if [ "$APPLY" != "--apply" ]; then
    printf 'would set  %-28s (%s chars)\n' "$name" "${#value}"
    continue
  fi
  code=$(VALUE="$value" /opt/homebrew/bin/python3 -c "
import json,os,sys
sys.stdout.write(json.dumps({'value': os.environ['VALUE']}))" | \
    /usr/bin/curl -s -o /dev/null -w '%{http_code}' -X PUT \
      -H "Authorization: Bearer $KEY" -H 'content-type: application/json' \
      --data-binary @- \
      "https://api.render.com/v1/services/$SERVICE/env-vars/$name")
  printf 'set        %-28s HTTP %s\n' "$name" "$code"
done < "$FILE"

if [ "$APPLY" != "--apply" ]; then
  echo
  echo "Nothing was changed. Re-run with --apply to set them."
  exit 0
fi

# THE DEPLOY IS NOT AUTOMATIC. Changing an environment variable in Render's
# dashboard restarts the service; doing it through the API does NOT. The
# variables were set, the running process never saw them, and the server went
# on reporting delivered:false for seventeen minutes while everything looked
# correct from the outside. So this asks for the deploy itself.
echo
echo "Triggering a deploy so the running process picks them up..."
/usr/bin/curl -s --max-time 30 -X POST   -H "Authorization: Bearer $KEY" -H 'content-type: application/json'   -d '{"clearCache":"do_not_clear"}'   "https://api.render.com/v1/services/$SERVICE/deploys" |   /opt/homebrew/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print('  deploy', d.get('id'), d.get('status'))"
echo
echo "Watch it with:  node tools/live-check.mjs 'Join BEASTY'"
