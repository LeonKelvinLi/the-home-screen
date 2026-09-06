#!/bin/bash
# Turn the sign-in email on, once the DNS records are in at GoDaddy.
#
# WHY THIS EXISTS. Production sends login codes from onboarding@resend.dev,
# Resend's shared testing sender, which delivers ONLY to the address that owns
# the Resend account. Every other customer is told to check an email that
# cannot arrive; the key is valid, the API answers 200, and nothing logs.
#
# beastypages.com is already registered on the Resend account. What is missing
# is the three DNS records Resend printed, which have to be added at
# https://dcc.godaddy.com/control/beastypages.com/dns — this script does not
# touch DNS, it does everything after it.
#
#   bash tools/finish-login-email.sh
#
# It asks Resend to verify, waits for it, then points OTP_FROM_EMAIL at the new
# domain and triggers a deploy — because a Render API env change does NOT
# restart the service on its own.
set -uo pipefail

RESEND_KEY=$(grep -m1 '^RESEND_API_KEY=' ~/.resend.env 2>/dev/null | cut -d= -f2-)
if [ -z "${RESEND_KEY:-}" ]; then
  # Fall back to the one Render already holds, which is the same key.
  RENDER_KEY=$(grep -m1 '^RENDER_API_KEY=' ~/.render.env | cut -d= -f2- | tr -d '"'"'"'')
  RESEND_KEY=$(curl -s -H "Authorization: Bearer $RENDER_KEY" \
    "https://api.render.com/v1/services/srv-daaq49favr4c73b5s3i0/env-vars?limit=50" \
    | python3 -c "import json,sys;print({r['envVar']['key']:r['envVar']['value'] for r in json.load(sys.stdin)}.get('RESEND_API_KEY',''))")
fi
RENDER_KEY=${RENDER_KEY:-$(grep -m1 '^RENDER_API_KEY=' ~/.render.env | cut -d= -f2- | tr -d '"'"'"'')}
DOMAIN_ID=15b5e1ae-67d9-4997-9ef9-b2b37a3df891
SERVICE=srv-daaq49favr4c73b5s3i0   # recreated 2026-08-31; the old srv-d9nus… id is dead
FROM='BEASTY <hello@beastypages.com>'

echo "Asking Resend to verify beastypages.com..."
curl -s -X POST -H "Authorization: Bearer $RESEND_KEY" \
  "https://api.resend.com/domains/$DOMAIN_ID/verify" > /dev/null

# PATIENCE, BECAUSE THE FAILURE IS A CACHE AND NOT A MISTAKE.
#
# Resend checks the record the moment a domain is added — before it exists —
# and caches the miss. On 2026-08-29 the DKIM TXT was byte-identical to what
# Resend asked for, single, correct at ns69.domaincontrol.com and visible from
# both Google and Cloudflare, and Resend still said pending for twenty minutes.
# MX and SPF verified immediately; only the one it had already looked for and
# not found stayed stuck. So this waits an hour rather than ten minutes.
for i in $(seq 1 60); do
  status=$(curl -s -H "Authorization: Bearer $RESEND_KEY" \
    "https://api.resend.com/domains/$DOMAIN_ID" \
    | python3 -c "import json,sys;print(json.load(sys.stdin).get('status'))")
  echo "  [$i] $status"
  [ "$status" = "verified" ] && break
  sleep 60
done

if [ "$status" != "verified" ]; then
  echo
  echo "Not verified yet. DNS can take a few minutes to propagate; run this again."
  echo "Check the records are in at https://dcc.godaddy.com/control/beastypages.com/dns"
  exit 1
fi

echo "Verified. Pointing OTP_FROM_EMAIL at it..."
python3 - "$RENDER_KEY" "$SERVICE" "$FROM" <<'PY'
import json, sys, urllib.request
key, service, value = sys.argv[1], sys.argv[2], sys.argv[3]
req = urllib.request.Request(
    f"https://api.render.com/v1/services/{service}/env-vars/OTP_FROM_EMAIL",
    data=json.dumps({"value": value}).encode(), method="PUT",
    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
with urllib.request.urlopen(req) as r:
    print("  OTP_FROM_EMAIL set ->", r.status)
PY

echo "Deploying, because an API env change does not restart the service..."
# The reply is read defensively: on 2026-08-29 this printed a JSON traceback
# over a deploy that had in fact been queued, which reads as a failure and is
# not. The status code is the thing that says whether it worked.
code=$(curl -s -o /tmp/render-deploy.json -w '%{http_code}' \
  -X POST -H "Authorization: Bearer $RENDER_KEY" -H "Content-Type: application/json" \
  -d '{"clearCache":"do_not_clear"}' \
  "https://api.render.com/v1/services/$SERVICE/deploys")
if [ "$code" = "201" ] || [ "$code" = "200" ]; then
  python3 -c "import json;d=json.load(open('/tmp/render-deploy.json'));print('  deploy',d.get('id'),d.get('status'))" 2>/dev/null \
    || echo "  deploy queued (http $code)"
else
  echo "  DEPLOY REQUEST FAILED, http $code — set it off by hand in the Render dashboard"
  head -c 200 /tmp/render-deploy.json; echo
fi

echo
echo "Done. Sign-in codes will reach any address from the next deploy."
