#!/usr/bin/env node
/**
 * Give a kitchen its screen, and take it away again.
 *
 *   node tools/issue-kitchen-token.mjs issue  b_theyard --label "Front counter iPad" [--qr]
 *   node tools/issue-kitchen-token.mjs list   b_theyard
 *   node tools/issue-kitchen-token.mjs revoke vk_0123456789abcdef
 *   node tools/issue-kitchen-token.mjs signups
 *
 * `issue` prints the kitchen link ONCE. It is the key: whoever opens it runs
 * that kitchen's board and can scan member passes as that business. Send it to
 * the owner directly, never in a group chat, and turn it off with `revoke` if
 * the device is lost or replaced. The server keeps only a hash, so a lost link
 * cannot be looked up again; issue a new one. `--qr` also draws the link as a
 * QR in this terminal, so the tablet can open it with its camera and nothing is
 * typed or sent at all.
 *
 * Talks to https://beastypages.com unless BEASTY_BASE says otherwise
 * (BEASTY_BASE=http://localhost:8787 for a dev server).
 *
 * THE OPERATOR TOKEN is read from OPERATOR_TOKEN if set, otherwise from the
 * live service's environment through the Render API (key in ~/.render.env).
 * It is held in memory for the requests and never printed or written anywhere.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const BASE = (process.env.BEASTY_BASE || 'https://beastypages.com').replace(/\/+$/, '')
const SERVICE = process.env.RENDER_SERVICE_ID || 'srv-daaq49favr4c73b5s3i0'
const KEY_FILE = process.env.RENDER_KEY_FILE || join(homedir(), '.render.env')

const [cmd, arg, ...rest] = process.argv.slice(2)
const flag = (name) => {
  const i = rest.indexOf(name)
  return i === -1 ? undefined : rest[i + 1]
}
const has = (name) => rest.includes(name)

function usage(code = 1) {
  console.log(`usage:
  node tools/issue-kitchen-token.mjs issue  <b_brand|v_vendor> [--label "Front counter iPad"] [--qr]
  node tools/issue-kitchen-token.mjs list   <b_brand|v_vendor>
  node tools/issue-kitchen-token.mjs revoke <vk_key_id>
  node tools/issue-kitchen-token.mjs signups`)
  process.exit(code)
}

async function operatorToken() {
  if (process.env.OPERATOR_TOKEN) return process.env.OPERATOR_TOKEN
  let apiKey = ''
  try {
    const line = readFileSync(KEY_FILE, 'utf8').split('\n').find((l) => l.startsWith('RENDER_API_KEY='))
    apiKey = (line ?? '').slice('RENDER_API_KEY='.length).replace(/["'\s]/g, '')
  } catch {
    /* handled below */
  }
  if (!apiKey) {
    console.error(`No OPERATOR_TOKEN in the environment and no RENDER_API_KEY in ${KEY_FILE}.`)
    process.exit(1)
  }
  const r = await fetch(`https://api.render.com/v1/services/${SERVICE}/env-vars/OPERATOR_TOKEN`, {
    headers: { authorization: `Bearer ${apiKey}`, accept: 'application/json' },
  })
  if (!r.ok) {
    console.error(`Render answered ${r.status} for the operator token. Is the key for the right workspace?`)
    process.exit(1)
  }
  const body = await r.json()
  const value = body?.value ?? body?.envVar?.value
  if (typeof value !== 'string' || value.length < 16) {
    console.error('The live service has no usable OPERATOR_TOKEN.')
    process.exit(1)
  }
  return value
}

async function call(method, path, body) {
  const token = await operatorToken()
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await r.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    /* not JSON */
  }
  if (!r.ok) {
    console.error(`${method} ${path} -> ${r.status}: ${json?.error ?? text.slice(0, 200)}`)
    process.exit(1)
  }
  return json
}

const when = (t) => (t ? new Date(t).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'never')

if (!cmd || cmd === '-h' || cmd === '--help') usage(0)

if (cmd === 'issue') {
  if (!arg) usage()
  const label = flag('--label')
  const k = await call('POST', `/api/vendors/${encodeURIComponent(arg)}/tokens`, label ? { label } : {})
  console.log(`Kitchen key ${k.id} for ${k.name}${k.label ? ` (${k.label})` : ''}.`)
  console.log('')
  console.log('Open this link on the kitchen\'s device. It is shown once; it is the key.')
  console.log('')
  console.log(`  ${k.kitchenUrl}`)
  console.log('')
  if (has('--qr')) {
    const { toString } = await import('qrcode')
    console.log(await toString(k.kitchenUrl, { type: 'terminal', small: true, errorCorrectionLevel: 'M' }))
  }
  console.log(`Turn it off later with: node tools/issue-kitchen-token.mjs revoke ${k.id}`)
} else if (cmd === 'list') {
  if (!arg) usage()
  const keys = await call('GET', `/api/vendors/${encodeURIComponent(arg)}/tokens`)
  if (keys.length === 0) console.log('No keys issued for that kitchen.')
  for (const k of keys) {
    const state = k.revokedAt ? `off since ${when(k.revokedAt)}` : 'live'
    console.log(`${k.id}  ${state.padEnd(28)} issued ${when(k.createdAt)}, last used ${when(k.lastUsedAt)}${k.label ? `  ${k.label}` : ''}`)
  }
} else if (cmd === 'revoke') {
  if (!arg || !arg.startsWith('vk_')) usage()
  await call('DELETE', `/api/vendor-tokens/${encodeURIComponent(arg)}`)
  console.log(`${arg} is off. Any screen using it signs out on its next refresh.`)
} else if (cmd === 'signups') {
  const rows = await call('GET', '/api/register-signups')
  if (rows.length === 0) console.log('Nobody has joined from a register code yet.')
  for (const r of rows) console.log(`${String(r.signups).padStart(5)}  ${r.name} (${r.brandId})`)
} else {
  usage()
}
