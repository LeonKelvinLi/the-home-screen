#!/usr/bin/env node
/*
  Put the membership billing into a Stripe account, idempotently.

  The moment Glenn activates BEASTY, the live account needs the same five
  objects the test account already has — products, prices, a payment link each,
  and a webhook. Test-mode objects do not carry over; they have to be made
  again. Doing that by hand is ten minutes of clicking in which a price can be
  typed as 3900 in one place and 39.00 in another.

  So: one command, and the numbers come from TIERS in src/data/membership.ts,
  which is Glenn's own list and the only place prices are written down. Nothing
  here hardcodes $39.

  IDEMPOTENT, by metadata rather than by name. Re-running finds what it made
  last time — every object is stamped app=beastypages and tier_id — and leaves
  it alone. A name match would be the wrong test: renaming a product in the
  dashboard would make this quietly build a second one and start charging on a
  price nothing points at.

      export STRIPE_SECRET_KEY=sk_...        # test or live
      node tools/stripe-setup.mjs            # shows what it would do
      node tools/stripe-setup.mjs --write    # makes it

  It writes the four environment values to a file rather than printing them,
  because one of them is the webhook signing secret.
*/
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const KEY = process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_TEST_KEY
const WRITE = process.argv.includes('--write')
const SITE = process.env.BEASTY_SITE ?? 'https://beastypages.com'
if (!KEY) {
  console.error('Set STRIPE_SECRET_KEY first (test or live). Nothing was done.')
  process.exit(2)
}
const LIVE = KEY.startsWith('sk_live_')
const OUT = LIVE ? '.stripe-live.env' : '.stripe-test.env'

const api = async (path, params, method = 'POST') => {
  const body = params ? new URLSearchParams(params).toString() : undefined
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? method : 'GET',
    headers: {
      authorization: `Basic ${Buffer.from(`${KEY}:`).toString('base64')}`,
      ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {}),
    },
    body,
  })
  const j = await r.json()
  if (j.error) throw new Error(`${path}: ${j.error.message}`)
  return j
}

/*
  THE PRICES ARE READ, NOT TYPED. src/data/membership.ts is TypeScript, so it is
  read through tsx rather than parsed with a regex — a regex over source is how
  a price silently stops tracking the file it claims to come from.
*/
const tiers = JSON.parse(
  execFileSync('npx', ['tsx', '-e', `
    import { TIERS } from './src/data/membership'
    process.stdout.write(JSON.stringify(TIERS.map(t => ({
      id: t.id, name: t.name, monthly: t.monthly, honours: t.honours,
    }))))
  `], { encoding: 'utf8' }),
)

const acct = await api('account', null)
const charges = acct.charges_enabled
console.log(`account   : ${acct.id} — ${acct.settings?.dashboard?.display_name ?? '(unnamed)'}`)
console.log(`mode      : ${LIVE ? 'LIVE' : 'test'} | charges_enabled ${charges} | details_submitted ${acct.details_submitted}`)
if (LIVE && !charges) {
  console.error('\nREFUSED: this live account cannot take charges yet, so live objects would be')
  console.error('unusable and would have to be cleaned up. Activate it first — see docs/STRIPE.md.')
  process.exit(1)
}
if (!WRITE) console.log('\n(dry run — pass --write to actually create anything)\n')

const stamped = (o, tier) => o.metadata?.app === 'beastypages' && o.metadata?.tier_id === tier

const env = {}
for (const t of tiers) {
  const cents = Math.round(t.monthly * 100)
  const desc = `Honours ${t.honours} at any BEASTY affiliate, with no limit each month.`

  const products = await api('products?limit=100&active=true', null)
  let product = products.data.find((p) => stamped(p, t.id))
  if (!product) {
    console.log(`${t.name.padEnd(12)} product   : ${WRITE ? 'creating' : 'would create'}`)
    if (WRITE) product = await api('products', { name: t.name, description: desc, 'metadata[tier_id]': t.id, 'metadata[app]': 'beastypages' })
  } else console.log(`${t.name.padEnd(12)} product   : ${product.id} (exists)`)
  if (!product) continue

  const prices = await api(`prices?product=${product.id}&limit=100&active=true`, null)
  let price = prices.data.find((p) => p.unit_amount === cents && p.recurring?.interval === 'month')
  if (!price) {
    console.log(`${''.padEnd(12)} price     : ${WRITE ? 'creating' : 'would create'} $${t.monthly}/month`)
    if (WRITE) price = await api('prices', { product: product.id, unit_amount: String(cents), currency: 'usd', 'recurring[interval]': 'month', 'metadata[tier_id]': t.id, 'metadata[app]': 'beastypages' })
  } else console.log(`${''.padEnd(12)} price     : ${price.id} — $${(price.unit_amount / 100).toFixed(2)}/${price.recurring.interval} (exists)`)
  if (!price) continue

  const links = await api('payment_links?limit=100&active=true', null)
  let link = links.data.find((l) => stamped(l, t.id))
  if (!link) {
    console.log(`${''.padEnd(12)} link      : ${WRITE ? 'creating' : 'would create'}`)
    if (WRITE) link = await api('payment_links', {
      'line_items[0][price]': price.id, 'line_items[0][quantity]': '1',
      'after_completion[type]': 'redirect', 'after_completion[redirect][url]': `${SITE}/?joined=1`,
      allow_promotion_codes: 'true', 'metadata[tier_id]': t.id, 'metadata[app]': 'beastypages',
    })
  } else console.log(`${''.padEnd(12)} link      : ${link.url} (exists)`)
  if (link) env[t.id === 'pass' ? 'STRIPE_PAYMENT_LINK_PASS' : 'STRIPE_PAYMENT_LINK_DIAMOND'] = link.url
}

/* Exactly the three the server acts on — see the webhook in server/index.ts.
   Subscribing to more is noise it answers 200 to and does nothing about. */
const EVENTS = ['checkout.session.completed', 'customer.subscription.deleted', 'invoice.payment_failed']
const url = `${SITE}/api/stripe/webhook`
const hooks = await api('webhook_endpoints?limit=100', null)
let hook = hooks.data.find((h) => h.url === url && h.status === 'enabled')
if (!hook) {
  console.log(`webhook   : ${WRITE ? 'creating' : 'would create'} → ${url}`)
  if (WRITE) {
    hook = await api('webhook_endpoints', Object.fromEntries([
      ['url', url], ['description', 'BEASTY membership — activates and lapses members'],
      ...EVENTS.map((e, i) => [`enabled_events[${i}]`, e]),
    ]))
    env.STRIPE_WEBHOOK_SECRET = hook.secret
  }
} else {
  console.log(`webhook   : ${hook.id} → ${hook.url} (exists)`)
  const missing = EVENTS.filter((e) => !hook.enabled_events.includes(e))
  if (missing.length) console.log(`            NOT subscribed to: ${missing.join(', ')} — members will never ${missing.includes(EVENTS[0]) ? 'activate' : 'lapse'}`)
  console.log('            its signing secret is only shown once, at creation — take it from')
  console.log('            the dashboard if you no longer have it.')
}

if (WRITE && Object.keys(env).length) {
  env.STRIPE_SECRET_KEY = KEY
  writeFileSync(OUT, Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n', { mode: 0o600 })
  console.log(`\nWrote ${Object.keys(env).length} value(s) to ${OUT} (chmod 600). It holds secrets:`)
  console.log('set them on Render, then TRIGGER A DEPLOY — an env change alone does not')
  console.log('restart the service, so the running process keeps the old values. Then delete it.')
} else if (!WRITE) {
  console.log('\nNothing was created. Re-run with --write.')
}
