#!/bin/bash
# Set environment variables on the live service, from a local file.
#
# The values never appear in this repo, in the shell history, or on screen:
# they are read from a file you write and delete, and only the KEY NAMES are
# printed back. Setting a variable makes Render redeploy.
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
SERVICE=${RENDER_SERVICE_ID:-srv-d9nusqdaeets73cnca50}
KEYFILE=${RENDER_KEY_FILE:-/Users/leon/Desktop/dev/allcpr-stickers/.env}

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
else
  echo
  echo "Render redeploys on an env change. Watch it with:"
  echo "  node tools/live-check.mjs 'Join BEASTY'"
fi
