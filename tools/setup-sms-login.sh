#!/bin/bash
# Turn SMS sign-in on. Run it once you have a Twilio account.
#
#   TWILIO_ACCOUNT_SID=AC... TWILIO_AUTH_TOKEN=... bash tools/setup-sms-login.sh
#
# WHAT IT DOES, and why in this order:
#
# It creates a Twilio VERIFY service and points production at it. Verify is the
# path that works today — Twilio's own documentation says "Verify does not
# require A2P registration or sender provisioning" — whereas raw SMS from a
# ten-digit number is dropped by US carriers until an A2P 10DLC campaign is
# approved, and campaign vetting now takes one to three weeks.
#
# Raw SMS is cheaper per message and keeps the one-time code ours, which is what
# tools/audit-otp.mjs proves on every run. So the plan is: Verify now, register
# the campaign in parallel, and when it clears, set TWILIO_FROM_NUMBER, clear
# TWILIO_VERIFY_SERVICE_SID and set A2P_10DLC_REGISTERED=1. The app switches
# with no migration — the code column has been filled all along.
#
# WHAT YOU HAVE TO DO BY HAND FIRST:
#   1. Create a Twilio account and get the Account SID and Auth Token.
#   2. Start the A2P 10DLC registration in parallel — BEASTY LLC has an EIN, so
#      it is the Standard Brand path, not Sole Proprietor. Brand needs the legal
#      name, EIN, address and website EXACTLY as the IRS has them; campaign needs
#      the use case, sample messages and the opt-in wording.
set -uo pipefail

SERVICE=srv-d9nusqdaeets73cnca50
: "${TWILIO_ACCOUNT_SID:?set TWILIO_ACCOUNT_SID}"
: "${TWILIO_AUTH_TOKEN:?set TWILIO_AUTH_TOKEN}"
RENDER_KEY=$(grep -m1 '^RENDER_API_KEY=' ~/Desktop/dev/allcpr-stickers/.env | cut -d= -f2- | tr -d '"'"'"'')

echo "Looking for an existing Verify service..."
sid=$(curl -s -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
  "https://verify.twilio.com/v2/Services?PageSize=20" \
  | python3 -c "
import json,sys
try: d=json.load(sys.stdin)
except Exception: print(''); raise SystemExit
for s in d.get('services',[]):
    if s.get('friendly_name')=='BEASTY sign-in': print(s['sid']); break
else: print('')")

if [ -z "$sid" ]; then
  echo "Creating one..."
  sid=$(curl -s -X POST -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
    --data-urlencode "FriendlyName=BEASTY sign-in" \
    --data-urlencode "CodeLength=6" \
    "https://verify.twilio.com/v2/Services" \
    | python3 -c "import json,sys;print(json.load(sys.stdin).get('sid',''))")
fi
[ -z "$sid" ] && { echo "Could not create a Verify service. Check the credentials."; exit 1; }
echo "  Verify service: ${sid:0:6}… (${#sid} chars)"

echo "Pointing production at it..."
python3 - "$RENDER_KEY" "$SERVICE" "$TWILIO_ACCOUNT_SID" "$TWILIO_AUTH_TOKEN" "$sid" <<'PY'
import json, sys, urllib.request
key, service, acct, token, vsid = sys.argv[1:6]
for k, v in [('TWILIO_ACCOUNT_SID', acct), ('TWILIO_AUTH_TOKEN', token), ('TWILIO_VERIFY_SERVICE_SID', vsid)]:
    req = urllib.request.Request(
        f"https://api.render.com/v1/services/{service}/env-vars/{k}",
        data=json.dumps({"value": v}).encode(), method="PUT",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        print(f"  {k} set -> {r.status}")
PY

echo "Deploying, because an API env change does not restart the service..."
code=$(curl -s -o /tmp/render-sms-deploy.json -w '%{http_code}' \
  -X POST -H "Authorization: Bearer $RENDER_KEY" -H "Content-Type: application/json" \
  -d '{"clearCache":"do_not_clear"}' \
  "https://api.render.com/v1/services/$SERVICE/deploys")
if [ "$code" = "201" ] || [ "$code" = "200" ]; then
  echo "  deploy queued (http $code)"
else
  echo "  DEPLOY REQUEST FAILED, http $code — set it off by hand in the Render dashboard"
fi

echo
echo "Done. Sign-in codes go by SMS from the next deploy."
echo "Check it with: curl -s -X POST https://beastypages.com/api/members/start \\"
echo "  -H 'content-type: application/json' -d '{\"name\":\"Test\",\"phone\":\"YOUR NUMBER\"}'"
echo "delivered:true means Twilio accepted it."
