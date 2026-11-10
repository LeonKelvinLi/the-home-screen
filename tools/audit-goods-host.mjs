#!/usr/bin/env node
/**
 * Exercise the real Pages host and packaged /goods app together. This is a
 * local synthetic audit, not evidence of live Google or email delivery.
 * Run after `npm run build`: node tools/audit-goods-host.mjs
 */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { freshTestDb } from './pgtest.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const adminUrl = new URL(process.env.TEST_DATABASE_URL || process.env.PGTEST_URL || 'postgres://beasty:beasty@localhost:55432/postgres')
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(adminUrl.hostname), 'Goods host audit refuses a nonlocal database')
const sharp = createRequire(join(root, 'services/goods/package.json'))('sharp')
const reserve = createServer()
await new Promise((resolve, reject) => { reserve.once('error', reject); reserve.listen(0, '127.0.0.1', resolve) })
const port = reserve.address().port
await new Promise(resolve => reserve.close(resolve))
const origin = `http://127.0.0.1:${port}`
const db = await freshTestDb('goods_host')
const temp = await mkdtemp(join(tmpdir(), 'beasty-goods-host-'))
const pool = new pg.Pool({ connectionString: db.url })
const passSecret = randomBytes(48).toString('base64url')
const checks = []
const check = (name, fn) => {
  assert.ok(fn, name)
  checks.push(name)
  console.log(`ok ${checks.length}: ${name}`)
}

// Clear inherited real provider configuration, including optional alternatives.
const env = { ...process.env }
for (const key of Object.keys(env)) {
  if (/^(?:RESEND_|TWILIO_|GOOGLE_|BEASTY_GOOGLE_|STRIPE_|DOCUSEAL_|S3_|AWS_|LEAD_|DESIGNS_LEAD_|BEASTY_IDENTITY_|BEASTY_SSO_|BETTER_AUTH_|GOODS_)/.test(key)) env[key] = ''
}
Object.assign(env, {
  NODE_ENV: 'development', PORT: String(port), DATABASE_URL: db.url,
  PASS_SECRET: passSecret, BEASTY_PUBLIC_ORIGIN: origin,
  GOODS_ENABLED: '1', GOODS_DEMO_CATALOG: '0', GOODS_UPLOAD_DIR: join(temp, 'photos'),
  CRM_ONLY: '0', CRM_OPEN: '0', CRM_AUTO_IMPORT: '0',
  CRM_URL: '', PUBLIC_URL: '', LEAD_WEBHOOK_URL: '', OTP_FROM_EMAIL: '',
  MAIL_MODE: 'spool', MAIL_FROM: '', SIMULATE_KITCHEN: '0', ALLOW_MOCK_PAYMENTS: '0',
})
let server
let logs = ''
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
async function stop() {
  if (!server || server.exitCode !== null || server.signalCode !== null) return
  const child = server
  const done = new Promise(resolve => child.once('exit', resolve))
  child.kill('SIGTERM')
  const force = setTimeout(() => child.kill('SIGKILL'), 5000)
  await done
  clearTimeout(force)
}
async function launch() {
  server = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
    cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout.on('data', data => { logs += data.toString() })
  server.stderr.on('data', data => { logs += data.toString() })
  for (let attempt = 0; attempt < 160; attempt++) {
    if (server.exitCode !== null) throw new Error('Actual Pages host exited before readiness')
    try {
      const response = await fetch(origin + '/api/health', { signal: AbortSignal.timeout(1000) })
      if (response.ok) return
    } catch {}
    await pause(250)
  }
  throw new Error('Actual Pages host did not become ready')
}

class Browser {
  cookies = []
  sent = new Map()
  async request(path, { method = 'GET', body, originHeader = origin } = {}) {
    const url = new URL(path, origin)
    assert.equal(url.origin, origin, 'This audit never follows an external provider')
    const selected = this.cookies.filter(c => (url.pathname === c.path || url.pathname.startsWith(c.path.endsWith('/') ? c.path : c.path + '/')) && !c.secure)
    const headers = new Headers()
    if (selected.length) headers.set('Cookie', selected.map(c => `${c.name}=${c.value}`).join('; '))
    this.sent.set(url.pathname, selected.map(c => c.name))
    if (!['GET', 'HEAD'].includes(method) && originHeader) headers.set('Origin', originHeader)
    let payload
    if (body instanceof FormData) payload = body
    else if (body !== undefined) { headers.set('Content-Type', 'application/json'); payload = JSON.stringify(body) }
    const response = await fetch(url, { method, headers, body: payload, redirect: 'manual', signal: AbortSignal.timeout(15000) })
    for (const raw of response.headers.getSetCookie()) {
      const parts = raw.split(';').map(part => part.trim()), at = parts[0].indexOf('=')
      const name = parts[0].slice(0, at), value = parts[0].slice(at + 1)
      const attributes = new Map(parts.slice(1).map(part => { const i = part.indexOf('='); return [part.slice(0, i < 0 ? undefined : i).toLowerCase(), i < 0 ? '' : part.slice(i + 1)] }))
      const path = attributes.get('path') || '/'
      this.cookies = this.cookies.filter(c => !(c.name === name && c.path === path))
      if (value && attributes.get('max-age') !== '0' && !(attributes.has('expires') && new Date(attributes.get('expires')).getTime() <= Date.now()))
        this.cookies.push({ name, value, path, secure: attributes.has('secure') })
    }
    return response
  }
  async json(path, options = {}) {
    const response = await this.request(path, options)
    const data = await response.json()
    return { status: response.status, data, headers: response.headers }
  }
  async follow(path) {
    const hops = []
    for (let i = 0; i < 12; i++) {
      const response = await this.request(path)
      const current = new URL(path, origin)
      hops.push({ path: current.pathname, status: response.status })
      const location = response.headers.get('location')
      if (!location || response.status < 300 || response.status >= 400) return { response, hops }
      path = new URL(location, current).toString()
    }
    throw new Error('Shared sign-in exceeded bounded redirect count')
  }
}

async function htmlAssets(path, prefix) {
  const response = await fetch(origin + path)
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /text\/html/)
  const html = await response.text()
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1])
  assert.ok(assets.length >= 2, `Compiled scripts and styles exist for ${path}`)
  for (const asset of assets) {
    assert.ok(asset.startsWith(prefix), `Compiled asset ${asset} uses expected prefix`)
    const loaded = await fetch(new URL(asset, origin))
    assert.equal(loaded.status, 200, `Compiled asset loads for ${path}`)
    assert.match(loaded.headers.get('content-type'), asset.endsWith('.js') ? /javascript/ : /text\/css/)
  }
  return html
}

try {
  await launch()
  check('real server/index.ts starts Pages and packaged Goods together', server.pid > 0)
  check('Pages health reads its actual migrated database', (await (await fetch(origin + '/api/health')).json()).ok === true)
  await htmlAssets('/login', '/assets/')
  check('Pages login serves its compiled scripts and styles', true)
  await htmlAssets('/goods', '/goods/assets/')
  check('Goods website serves compiled assets under /goods', true)
  const guest = new Browser(), member = new Browser()
  const goodsHealth = await guest.json('/goods/api/health')
  check('Goods health succeeds through the actual host mount', goodsHealth.status === 200 && goodsHealth.data.service === 'bsty-goods')
  const options = await guest.json('/goods/api/identity/options')
  check('shared login is configured and Google stays disabled without real credentials', options.status === 200 && options.data.beastypages === true && options.data.google === false && options.data.pagesUrl === origin)
  const name = 'Synthetic Goods Host Member', email = `goods-host-${randomBytes(5).toString('hex')}@example.invalid`
  const start = await member.json('/api/members/start', { method: 'POST', body: { name, email, city: 'Oakland', state: 'CA' } })
  check('existing Pages OTP start is functional without external delivery', start.status === 202 && start.data.delivered === false && start.data.code === undefined)
  let code
  for (let i = 0; i < 40 && !code; i++) {
    const line = logs.split('\n').filter(line => line.includes(`[login-code] ${email} `)).at(-1)
    code = line?.match(/ (\d{6}) /)?.[1]
    if (!code) await pause(50)
  }
  assert.ok(code, 'The development-only log contains the synthetic OTP')
  const verified = await member.json('/api/members/verify', { method: 'POST', body: { email, code } })
  const memberId = verified.data.id
  assert.equal(verified.status, 201, `Synthetic OTP verification failed: ${verified.status} ${verified.data.error || ''}`)
  check('real Pages OTP verification creates and signs in one member', verified.status === 201 && /^mb_/.test(memberId))
  const unknownEmail = `unknown-goods-host-${randomBytes(5).toString('hex')}@example.invalid`
  const pendingLogStart = logs.length
  const pendingSignup = await guest.json('/api/members/start', { method: 'POST', body: { name: 'Pending synthetic signup', email: unknownEmail } })
  assert.equal(pendingSignup.status, 202)
  let pendingSignupCode
  for (let i = 0; i < 40 && !pendingSignupCode; i++) {
    const line = logs.slice(pendingLogStart).split('\n').filter(line => line.includes(`[login-code] ${unknownEmail} `)).at(-1)
    pendingSignupCode = line?.match(/ (\d{6}) /)?.[1]
    if (!pendingSignupCode) await pause(50)
  }
  assert.ok(pendingSignupCode, 'The synthetic unknown member has a valid pending signup code')
  const unknownStart = await guest.json('/api/members/start', { method: 'POST', body: { name: 'BEASTY member', email: unknownEmail, signinOnly: true } })
  check('existing-only code request does not expose account existence or a code', unknownStart.status === 202 && unknownStart.data.sent === true && unknownStart.data.code === undefined)
  const unknownVerify = await guest.json('/api/members/verify', { method: 'POST', body: { email: unknownEmail, code: pendingSignupCode, signinOnly: true } })
  const unknownRows = await pool.query('SELECT id FROM public.members WHERE email=$1', [unknownEmail])
  check('unknown existing-only login cannot turn an earlier valid signup code into a new account', unknownVerify.status === 403 && unknownRows.rowCount === 0)
  await member.json('/api/members/signout', { method: 'POST', body: {} })
  const signInLogStart = logs.length
  const signInStart = await member.json('/api/members/start', { method: 'POST', body: { name: 'BEASTY member', email, signinOnly: true } })
  check('existing-only Pages login accepts an email without city or profile fields', signInStart.status === 202 && signInStart.data.delivered === false && signInStart.data.code === undefined)
  let signInCode
  for (let i = 0; i < 40 && !signInCode; i++) {
    const line = logs.slice(signInLogStart).split('\n').filter(line => line.includes(`[login-code] ${email} `)).at(-1)
    signInCode = line?.match(/ (\d{6}) /)?.[1]
    if (!signInCode) await pause(50)
  }
  assert.ok(signInCode, 'The development-only log contains the synthetic sign-in OTP')
  const signedIn = await member.json('/api/members/verify', { method: 'POST', body: { email, code: signInCode, signinOnly: true } })
  const unchanged = await pool.query('SELECT name,city,state FROM public.members WHERE id=$1', [memberId])
  check('existing-only OTP returns the same account without replacing its stored profile', signedIn.status === 200 && signedIn.data.id === memberId && unchanged.rows[0].name === name && unchanged.rows[0].city === 'Oakland' && unchanged.rows[0].state === 'CA')
  const status = await member.json('/api/identity/status')
  check('Pages identity authority sees the existing member cookie', status.status === 200 && status.data.member?.id === memberId)
  const startSso = await member.json('/goods/api/identity/sign-in', { method: 'POST', body: { method: 'beastypages', returnTo: '/inventory' } })
  check('Goods starts first-party OAuth through its real raw-stream auth handler', startSso.status === 200 && typeof startSso.data.url === 'string')
  const authorized = await member.follow(startSso.data.url)
  assert.equal(authorized.response.status, 200)
  check('actual authorize, token and Better Auth callback complete under /goods', authorized.hops.some(hop => hop.path === '/goods/api/auth/callback/beastypages') && authorized.hops.at(-1).path === '/goods/inventory')
  const me = await member.json('/goods/api/me'), goodsUserId = me.data.user?.id
  check('shared sign-in yields a persistent Goods profile', me.status === 200 && typeof goodsUserId === 'string' && me.data.user.name === name)
  const linked = await member.json('/goods/api/identity/linked')
  check('Goods links to the exact same stable Pages member ID', linked.status === 200 && linked.data.linked && linked.data.memberId === memberId && linked.data.identity.email === email)
  const inventory = await member.json('/goods/api/me/inventory')
  check('shared member receives all 78 inventory slots', inventory.status === 200 && inventory.data.slots?.length === 78)
  check('Goods authentication cookies remain scoped to /goods', member.cookies.filter(c => c.name.startsWith('bsty')).length > 0 && member.cookies.filter(c => c.name.startsWith('bsty')).every(c => c.path === '/goods'))
  await member.json('/api/identity/status')
  check('Goods cookies are absent from Pages root identity requests', !member.sent.get('/api/identity/status').some(name => name.startsWith('bsty')))
  const proof = await pool.query('SELECT 1 FROM public.beasty_identity_email_proofs WHERE member_id=$1 AND email_normalized=$2 AND proof=$3', [memberId, email, 'email_code'])
  check('real email OTP integration records explicit email ownership proof', proof.rowCount === 1)
  const photoBytes = await sharp({ create: { width: 160, height: 120, channels: 3, background: '#f8d431' } }).jpeg().toBuffer()
  const form = new FormData()
  form.set('file', new Blob([photoBytes], { type: 'image/jpeg' }), 'synthetic-yellow-fixture.jpg')
  const uploaded = await member.json('/goods/api/uploads', { method: 'POST', body: form })
  const photo = uploaded.data.photo
  check('actual host processes and persists a synthetic photo', uploaded.status === 201 && photo?.url?.startsWith('/goods/api/photos/'))
  const draftResponse = await member.json('/goods/api/listings', { method: 'POST', body: { code: 'A-1', status: 'draft', title: 'Synthetic host restart draft', photoIds: [photo.id] } })
  const draft = draftResponse.data.listing
  check('draft creation and slot assignment work under /goods', draftResponse.status === 201 && draft?.status === 'draft' && draft.code === 'A-1')
  check('private draft and photo remain hidden from signed-out visitors', (await guest.request(`/goods/api/listings/${draft.id}`)).status === 404 && (await guest.request(photo.url)).status === 404)
  check('the owner can load the processed private photo', (await member.request(photo.url)).status === 200)
  check('cross-origin profile writes are refused by the mounted app', (await member.json('/goods/api/me', { method: 'PATCH', body: { bio: 'Refused synthetic request' }, originHeader: 'https://untrusted.example' })).status === 403)
  const namespaces = await pool.query("SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema IN ('public','bsty_goods') AND table_name IN ('members','user','listings') ORDER BY table_schema,table_name")
  check('Goods tables live only in their isolated schema while Pages members remain public', JSON.stringify(namespaces.rows) === JSON.stringify([{ table_schema: 'bsty_goods', table_name: 'listings' }, { table_schema: 'bsty_goods', table_name: 'user' }, { table_schema: 'public', table_name: 'members' }]))
  const beforeRestart = await pool.query('SELECT name,email FROM public.members WHERE id=$1', [memberId])
  await stop()
  await launch()
  check('full Pages host restarts with the same persistent account secrets', (await member.json('/api/identity/status')).data.member?.id === memberId)
  check('Goods session and stable shared identity survive full host restart', (await member.json('/goods/api/me')).data.user?.id === goodsUserId && (await member.json('/goods/api/identity/linked')).data.memberId === memberId)
  const savedDraft = await member.json(`/goods/api/listings/${draft.id}`)
  check('private draft metadata and processed photo survive restart', savedDraft.data.listing?.title === draft.title && (await member.request(photo.url)).status === 200)
  const afterRestart = await pool.query('SELECT name,email FROM public.members WHERE id=$1', [memberId])
  check('Goods migration and restart preserve existing Pages member data', JSON.stringify(beforeRestart.rows) === JSON.stringify(afterRestart.rows))
  await mkdir(join(root, '.verify'), { recursive: true })
  await writeFile(join(root, '.verify/goods-host-result.json'), JSON.stringify({ passed: true, checkCount: checks.length, checks, testedAt: new Date().toISOString(), proof: 'Local synthetic audit of actual server/index.ts, no Google/email delivery claim', restartVerified: true }, null, 2) + '\n')
  console.log(`Passed ${checks.length} actual-host checks. Synthetic local database, child process and photo files will be removed.`)
} catch (error) {
  console.error('Goods actual-host audit failed:', error.message)
  const safeLog = logs.split('\n').filter(line => !line.includes('[login-code]') && !/\bvt_[a-z0-9]+/.test(line)).join('\n').replaceAll(passSecret, '[fixture-secret]')
  console.error(safeLog.slice(-3500))
  process.exitCode = 1
} finally {
  await stop()
  await pool.end()
  await db.drop()
  await rm(temp, { recursive: true, force: true })
}
