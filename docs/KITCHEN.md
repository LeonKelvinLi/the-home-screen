# The kitchen screen, its keys, and register cards

Built 13 September 2026. Until then no business could see an order: there was
no screen and no way to give a kitchen a credential, so every ticket in
production was either left at "queued" or moved by the demo timer.

## What a kitchen gets

A link. Opened on the counter's tablet, phone or laptop, it lands on
`beastypages.com/kitchen` already signed in:

- **The board**: that kitchen's tickets only, in New, Cooking and Ready, oldest
  first, each with the order code, how long ago it came in, pickup or
  delivery, the customer's name and number (tap to call), and the lines with
  their options and notes.
- **Start, Ready, Picked up** move a ticket along. The customer's order screen
  follows within a few seconds.
- **Can't make it** turns a ticket down before it is ready, with a reason
  (Sold out, Closing early, Too busy right now, or typed). The customer sees
  "The kitchen could not take this: Sold out".
- **A new order** shows a yellow banner, puts "New order #1234" in the tab
  title, and chimes if Sound is on. Sound has to be switched on with a tap
  once per visit; browsers do not let a page make noise before that.
- **Scan a member pass** opens the camera. It reads the QR on a member's card
  and says who they are and what their membership honours, or that they have
  no paid membership. A pass scans once; the scan is the redemption record.
- **The register-code count**: how many people signed up after scanning that
  business's register card.
- The screen keeps the device awake while it is open, where the browser allows.

Nothing is charged through any of this. Payments are not built.

## Issuing a key

The operator does this. Nobody else can.

```bash
node tools/issue-kitchen-token.mjs issue b_belly --label "Front counter iPad" --qr
```

It prints the link once, and with `--qr` draws it as a QR in the terminal so
the tablet can open it with its own camera and the link never goes through a
chat app. The link **is** the key: whoever opens it can run that kitchen's
board and check member passes as that business. Send it to the owner directly.

The business can be named by its page id (`b_belly`) or its vendor id
(`v_belly`). One key per device is the intent, so a lost tablet can be turned
off without signing out the others. A kitchen can hold ten live keys.

The tool reads `OPERATOR_TOKEN` from the environment, or from the live
service's settings through the Render API key in `~/.render.env`. It never
prints the operator token. `BEASTY_BASE=http://localhost:8787` points it at a
dev server instead of the live site.

## Seeing and turning off keys

```bash
node tools/issue-kitchen-token.mjs list b_belly
node tools/issue-kitchen-token.mjs revoke vk_0123456789abcdef
```

`list` shows each key's id, label, when it was issued and last used, and
whether it is live. It cannot show a key: only a hash is stored, so a lost
link cannot be looked up again. Issue a new one and revoke the old.

A revoked key stops working on the next request. An open screen signs itself
out within a few seconds and says the link was turned off.

## What changes for the customer

While a kitchen holds a live key:

- the demo timer leaves its tickets alone;
- its orders are no longer called "a demonstration" on the order screen;
- the confirmation after checkout says the kitchen has the order on its own
  screen, instead of "call the kitchen to confirm before you travel".

An order spanning a connected and an unconnected kitchen says which is which.

## Register cards

```bash
npx tsx --tsconfig tsconfig.app.json tools/make-register-cards.ts
npx tsx --tsconfig tsconfig.app.json tools/make-register-cards.ts --only b_belly,b_theyard
```

A 4 x 6 inch card per seated business, in `out/register-cards/` (not
committed): a PDF each for printing, a 1200 x 1800 PNG each for sending, and
`all-cards.pdf` with every card in the run. Each carries the BEASTY mark, the
business's tile and name, "Scan to open our BEASTY page and join free", and a
QR for `https://beastypages.com/?b=<id>&via=qr`.

Scanned with any phone camera, or with the Scan tab on BEASTY's landing page,
it opens that business's page. A sign-up that starts there is credited to the
business. The Scan tab only follows BEASTY links; any other code is refused
on screen.

```bash
node tools/issue-kitchen-token.mjs signups
```

lists every business's register-code sign-ups, busiest first. Only new
members count, and only for a business that exists: a member who already had
an account and signs in from a card is not credited again.

## What is not built

- Payment, and so refunds and receipts.
- A business managing its own keys or devices (vendor onboarding).
- Scheduled or future orders. Hours are free text on every page, so nothing
  can yet stop an order arriving after closing; the kitchen turns it down with
  Closing early.
- Printing tickets to a kitchen printer.

## Checked by

`tools/audit-kitchen.mjs`: keys, board, timer, Can't make it, revoking,
production refusing the old tokens, and a member pass read by the camera
through a fake video feed. `tools/audit-orders-account.mjs`: cancelling,
orders on the account, the member count, and a register card's QR read back
from its PNG, followed through the landing camera to a credited sign-up.
