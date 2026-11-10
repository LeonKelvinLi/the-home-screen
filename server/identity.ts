import express from 'express'
import type { Express, Request, Response } from 'express'
import type { Pool, PoolClient } from 'pg'
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'
import { OAuth2Client, CodeChallengeMethod } from 'google-auth-library'
import { IDENTITY_SCHEMA } from './identity-schema'

export interface IdentityMember {
  id: string
  name: string
  email: string | null
  phone?: string | null
  city?: string | null
  state?: string | null
}

export interface IdentityDeps {
  pool: Pool
  memberFromRequest: (req: Request) => Promise<IdentityMember | null>
  startSession: (res: Response, memberId: string) => Promise<unknown>
  newReferralCode: () => Promise<string>
  origin: string
  secret: string
  clientSecret: string
  clientRedirectUris: string[]
  googleClientId?: string
  googleClientSecret?: string
  /** Fixture injection only; production uses Google's supported client below. */
  googleClient?: Pick<OAuth2Client, 'generateAuthUrl' | 'getToken' | 'verifyIdToken'>
}

const CLIENT_ID = 'bsty-goods'
const PREFIX = '/api/identity'
const CODE_LIFETIME_MS = 90_000
const TOKEN_LIFETIME_MS = 300_000
const GOOGLE_LIFETIME_MS = 600_000
const BROWSER_COOKIE = 'beasty_identity_browser'
const digest = (value: string) => createHash('sha256').update(value).digest('hex')
const random = () => randomBytes(32).toString('base64url')
const constantEqual = (a: string, b: string) =>
  timingSafeEqual(Buffer.from(digest(a), 'hex'), Buffer.from(digest(b), 'hex'))
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const value = (input: unknown, max = 1024) =>
  typeof input === 'string' && input.length <= max ? input : ''
const emailOf = (input: unknown): string | null => {
  const email = value(input, 254).trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}
const loopback = (url: URL) => ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)

class IdentityError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}
function reject(status: number, code: string, message: string): never {
  throw new IdentityError(status, code, message)
}
const route =
  (handler: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) => {
    void handler(req, res).catch((error: unknown) => {
      if (res.headersSent) return
      if (error instanceof IdentityError) {
        return res
          .status(error.status)
          .json({ error: error.code, error_description: error.message })
      }
      // Provider exceptions can contain token requests. Never log the object.
      console.error('BEASTY identity request failed; no credentials were logged.')
      res.status(503).json({
        error: 'temporarily_unavailable',
        error_description: 'Sign-in is temporarily unavailable. Please try again.',
      })
    })
  }

async function inTransaction<T>(pool: Pool, fn: (db: PoolClient) => Promise<T>): Promise<T> {
  const db = await pool.connect()
  try {
    await db.query('BEGIN')
    const result = await fn(db)
    await db.query('COMMIT')
    return result
  } catch (error) {
    await db.query('ROLLBACK')
    throw error
  } finally {
    db.release()
  }
}

function cookie(req: Request, name: string) {
  const raw = req.headers.cookie || ''
  for (const part of raw.split(';')) {
    const split = part.indexOf('=')
    if (split < 0 || part.slice(0, split).trim() !== name) continue
    try {
      return decodeURIComponent(part.slice(split + 1).trim())
    } catch {
      return ''
    }
  }
  return ''
}

/** Only a validated local continuation can survive either provider redirect. */
function localPath(input: unknown, origin: string, fallback = '/account') {
  const path = value(input, 4096)
  if (!path.startsWith('/') || path.startsWith('//') || /[\\\u0000-\u0020\u007f]/.test(path))
    return fallback
  try {
    const url = new URL(path, origin)
    const decoded = decodeURIComponent(url.pathname)
    if (
      url.origin !== origin ||
      decoded.startsWith('//') ||
      /[\\\u0000-\u0020\u007f]/.test(decoded)
    )
      return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}

/** Register the Pages authority after the existing membership DB/helpers exist. */
export async function registerIdentity(app: Express, deps: IdentityDeps) {
  const { pool } = deps
  const parsedOrigin = new URL(deps.origin)
  if (
    parsedOrigin.username ||
    parsedOrigin.password ||
    parsedOrigin.pathname !== '/' ||
    parsedOrigin.search ||
    parsedOrigin.hash ||
    (parsedOrigin.protocol !== 'https:' &&
      !(parsedOrigin.protocol === 'http:' && loopback(parsedOrigin)))
  ) {
    throw new Error('Identity origin must be a canonical HTTPS origin, or loopback HTTP for tests.')
  }
  const origin = parsedOrigin.origin
  if (deps.secret.length < 32 || deps.clientSecret.length < 32)
    throw new Error('Identity and first-party client secrets must contain at least 32 characters.')
  const redirectUris = new Set(deps.clientRedirectUris)
  if (!redirectUris.size)
    throw new Error('The Goods client needs an explicit registered redirect URI.')
  for (const uri of redirectUris) {
    const parsed = new URL(uri)
    if (
      parsed.username ||
      parsed.password ||
      parsed.hash ||
      (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && loopback(parsed)))
    )
      throw new Error(
        'Goods redirect URIs must use HTTPS or loopback HTTP, without credentials or fragments.',
      )
  }
  await inTransaction(pool, async (db) => {
    await db.query('SELECT pg_advisory_xact_lock(873145906)')
    await db.query(IDENTITY_SCHEMA)
    await db.query('DELETE FROM beasty_identity_rate_limits WHERE reset_at < $1', [
      Date.now() - 86400000,
    ])
  })
  const sign = (state: string) =>
    createHmac('sha256', deps.secret).update(`google-state:${state}`).digest('base64url')
  const encryptionKey = createHmac('sha256', deps.secret).update('google-pkce-encryption').digest()
  const seal = (plaintext: string) => {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv)
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url')
  }
  const unseal = (sealed: string) => {
    const bytes = Buffer.from(sealed, 'base64url')
    if (bytes.length < 29) throw new Error('Invalid encrypted verifier.')
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey, bytes.subarray(0, 12))
    decipher.setAuthTag(bytes.subarray(12, 28))
    return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')
  }
  const googleEnabled = Boolean(deps.googleClientId?.trim() && deps.googleClientSecret?.trim())
  const googleCallback = origin + PREFIX + '/google/callback'
  const google =
    deps.googleClient ||
    new OAuth2Client({
      clientId: deps.googleClientId,
      clientSecret: deps.googleClientSecret,
      redirectUri: googleCallback,
    })
  const errorPath = (code: string, returnTo: unknown) => {
    const query = new URLSearchParams({
      identityError: code,
      returnTo: localPath(returnTo, origin),
    })
    return '/login?' + query.toString()
  }
  const rate = async (req: Request, scope: string, limit: number) => {
    const now = Date.now(),
      reset = now + 60000
    const key = createHmac('sha256', deps.secret)
      .update(`${scope}:${req.ip || 'unknown'}`)
      .digest('hex')
    const count = (
      await pool.query(
        `INSERT INTO beasty_identity_rate_limits(key,count,reset_at) VALUES($1,1,$2)
      ON CONFLICT(key) DO UPDATE SET count=CASE WHEN beasty_identity_rate_limits.reset_at<$3 THEN 1 ELSE beasty_identity_rate_limits.count+1 END,
      reset_at=CASE WHEN beasty_identity_rate_limits.reset_at<$3 THEN $2 ELSE beasty_identity_rate_limits.reset_at END RETURNING count`,
        [key, reset, now],
      )
    ).rows[0].count
    if (count > limit)
      reject(429, 'slow_down', 'Too many sign-in attempts. Please wait a minute and try again.')
  }
  app.use(PREFIX, (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Referrer-Policy', 'no-referrer')
    next()
  })

  const saveProof = async (
    db: Pool | PoolClient,
    memberId: string,
    email: string,
    proof: 'google' | 'email_code',
    subject: string | null,
  ) => {
    await db.query(
      `INSERT INTO beasty_identity_email_proofs(member_id,email_normalized,proof,provider_subject,verified_at)
      SELECT id,$2,$3,$4,$5 FROM members WHERE id=$1 AND lower(trim(email))=$2
      ON CONFLICT(member_id,email_normalized,proof) DO UPDATE SET provider_subject=excluded.provider_subject,verified_at=excluded.verified_at`,
      [memberId, email, proof, subject, Date.now()],
    )
  }
  const recordEmailProof = async (memberId: string, email: string) => {
    const normalized = emailOf(email)
    if (normalized) await saveProof(pool, memberId, normalized, 'email_code', null)
  }

  app.get(
    PREFIX + '/status',
    route(async (req, res) => {
      await rate(req, 'status', 240)
      const member = await deps.memberFromRequest(req)
      const linked = member
        ? Boolean(
            (
              await pool.query(
                "SELECT 1 FROM member_identities WHERE member_id=$1 AND provider='google' LIMIT 1",
                [member.id],
              )
            ).rowCount,
          )
        : false
      res.json({
        googleEnabled,
        codeEnabled: true,
        member: member
          ? {
              id: member.id,
              name: member.name,
              email: member.email,
              phone: member.phone || null,
              city: member.city || null,
              state: member.state || null,
            }
          : null,
        googleLinked: linked,
      })
    }),
  )

  app.get(
    PREFIX + '/authorize',
    route(async (req, res) => {
      await rate(req, 'authorize', 160)
      const clientId = value(req.query.client_id, 100),
        redirectUri = value(req.query.redirect_uri, 2048)
      if (clientId !== CLIENT_ID || !redirectUris.has(redirectUri))
        reject(400, 'invalid_request', 'The client or redirect address is not registered.')
      if (req.query.response_type !== 'code')
        reject(
          400,
          'unsupported_response_type',
          'Only the authorization code response is supported.',
        )
      const state = value(req.query.state, 1024),
        challenge = value(req.query.code_challenge, 128)
      if (
        !state ||
        /[\u0000-\u001f\u007f]/.test(state) ||
        !/^[A-Za-z0-9_-]{43}$/.test(challenge) ||
        req.query.code_challenge_method !== 'S256'
      )
        reject(400, 'invalid_request', 'State and an S256 PKCE challenge are required.')
      const scope = value(req.query.scope, 200)
      if (scope && scope.split(/\s+/).some((s) => !['openid', 'profile', 'email'].includes(s)))
        reject(400, 'invalid_scope', 'Only basic account identity is available.')
      const query = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      })
      if (scope) query.set('scope', scope)
      const continuation = PREFIX + '/authorize?' + query.toString()
      if (req.query.connection !== undefined && req.query.connection !== 'google')
        reject(400, 'invalid_request', 'Unknown sign-in connection.')
      if (req.query.connection === 'google') {
        if (!googleEnabled) return res.redirect(303, errorPath('google_unavailable', continuation))
        return res.redirect(
          303,
          PREFIX +
            '/google/start?' +
            new URLSearchParams({ mode: 'signin', returnTo: continuation }).toString(),
        )
      }
      const member = await deps.memberFromRequest(req)
      if (!member)
        return res.redirect(
          303,
          '/login?' + new URLSearchParams({ returnTo: continuation }).toString(),
        )
      const code = random(),
        now = Date.now()
      await pool.query(
        'INSERT INTO beasty_identity_codes(code_hash,member_id,client_id,redirect_uri,code_challenge,created_at,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7)',
        [digest(code), member.id, clientId, redirectUri, challenge, now, now + CODE_LIFETIME_MS],
      )
      const target = new URL(redirectUri)
      target.searchParams.set('code', code)
      target.searchParams.set('state', state)
      target.searchParams.set('iss', origin)
      res.redirect(303, target.toString())
    }),
  )

  app.post(
    PREFIX + '/token',
    express.urlencoded({ extended: false, limit: '16kb', parameterLimit: 12 }),
    express.json({ limit: '16kb', strict: true }),
    route(async (req, res) => {
      await rate(req, 'token', 200)
      const body = object(req.body)
      let clientId = value(body.client_id, 100),
        clientSecret = value(body.client_secret, 512)
      const authorization = req.get('authorization') || ''
      if (authorization) {
        const match = /^Basic ([A-Za-z0-9+/=]{1,2048})$/i.exec(authorization)
        if (!match) reject(401, 'invalid_client', 'Client authentication failed.')
        const decoded = Buffer.from(match[1], 'base64').toString('utf8'),
          colon = decoded.indexOf(':')
        if (colon < 0) reject(401, 'invalid_client', 'Client authentication failed.')
        let basicId = '',
          basicSecret = ''
        try {
          basicId = decodeURIComponent(decoded.slice(0, colon))
          basicSecret = decodeURIComponent(decoded.slice(colon + 1))
        } catch {
          reject(401, 'invalid_client', 'Client authentication failed.')
        }
        if ((clientId && clientId !== basicId) || clientSecret)
          reject(401, 'invalid_client', 'Use one client authentication method.')
        clientId = basicId
        clientSecret = basicSecret
      }
      if (clientId !== CLIENT_ID || !constantEqual(clientSecret, deps.clientSecret)) {
        res.setHeader('WWW-Authenticate', 'Basic realm="BEASTY identity"')
        reject(401, 'invalid_client', 'Client authentication failed.')
      }
      if (body.grant_type !== 'authorization_code')
        reject(400, 'unsupported_grant_type', 'Only authorization code grants are supported.')
      const code = value(body.code, 128),
        verifier = value(body.code_verifier, 128),
        redirectUri = value(body.redirect_uri, 2048)
      if (
        !/^[A-Za-z0-9_-]{43,128}$/.test(code) ||
        !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) ||
        !redirectUris.has(redirectUri)
      )
        reject(400, 'invalid_grant', 'The authorization grant is invalid or expired.')
      const accessToken = random(),
        now = Date.now()
      await inTransaction(pool, async (db) => {
        const grant = (
          await db.query('SELECT * FROM beasty_identity_codes WHERE code_hash=$1 FOR UPDATE', [
            digest(code),
          ])
        ).rows[0]
        const calculated = createHash('sha256').update(verifier).digest('base64url')
        if (
          !grant ||
          grant.consumed_at ||
          Number(grant.expires_at) <= now ||
          grant.client_id !== clientId ||
          grant.redirect_uri !== redirectUri ||
          !constantEqual(grant.code_challenge, calculated)
        )
          reject(400, 'invalid_grant', 'The authorization grant is invalid or expired.')
        await db.query('UPDATE beasty_identity_codes SET consumed_at=$2 WHERE code_hash=$1', [
          digest(code),
          now,
        ])
        await db.query(
          'INSERT INTO beasty_identity_tokens(token_hash,member_id,client_id,created_at,expires_at) VALUES($1,$2,$3,$4,$5)',
          [digest(accessToken), grant.member_id, clientId, now, now + TOKEN_LIFETIME_MS],
        )
      })
      res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: TOKEN_LIFETIME_MS / 1000,
        scope: 'openid profile email',
      })
    }),
  )

  app.get(
    PREFIX + '/userinfo',
    route(async (req, res) => {
      await rate(req, 'userinfo', 300)
      const match = /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(req.get('authorization') || '')
      if (!match) {
        res.setHeader('WWW-Authenticate', 'Bearer realm="BEASTY identity"')
        reject(401, 'invalid_token', 'A valid account identity token is required.')
      }
      const member = (
        await pool.query(
          `SELECT m.* FROM beasty_identity_tokens t JOIN members m ON m.id=t.member_id
      WHERE t.token_hash=$1 AND t.client_id=$2 AND t.revoked_at IS NULL AND t.expires_at>$3`,
          [digest(match[1]), CLIENT_ID, Date.now()],
        )
      ).rows[0]
      if (!member) reject(401, 'invalid_token', 'The identity token is invalid or expired.')
      const email = emailOf(member.email)
      const verified = email
        ? Boolean(
            (
              await pool.query(
                `SELECT 1 FROM beasty_identity_email_proofs p
      WHERE p.member_id=$1 AND p.email_normalized=$2 AND (p.proof='email_code' OR EXISTS(
        SELECT 1 FROM member_identities i WHERE i.member_id=p.member_id AND i.provider='google' AND i.subject=p.provider_subject
      )) LIMIT 1`,
                [member.id, email],
              )
            ).rowCount,
          )
        : false
      res.json({
        sub: member.id,
        name: member.name,
        email,
        email_verified: verified,
        ...(member.phone ? { phone_number: member.phone } : {}),
        ...(member.city ? { city: member.city } : {}),
        ...(member.state ? { state: member.state } : {}),
      })
    }),
  )

  app.get(
    PREFIX + '/google/start',
    route(async (req, res) => {
      await rate(req, 'google_start', 120)
      const returnTo = localPath(req.query.returnTo, origin)
      if (!googleEnabled) return res.redirect(303, errorPath('google_unavailable', returnTo))
      const mode = req.query.mode === undefined ? 'signin' : value(req.query.mode, 20)
      if (!['signin', 'link'].includes(mode))
        return res.redirect(303, errorPath('google_failed', returnTo))
      const member = mode === 'link' ? await deps.memberFromRequest(req) : null
      if (mode === 'link' && !member)
        return res.redirect(303, errorPath('google_link_signin_required', returnTo))
      const priorBrowser = cookie(req, BROWSER_COOKIE)
      const browser = /^[A-Za-z0-9_-]{43}$/.test(priorBrowser) ? priorBrowser : random()
      res.cookie(BROWSER_COOKIE, browser, {
        httpOnly: true,
        secure: parsedOrigin.protocol === 'https:',
        sameSite: 'lax',
        path: PREFIX,
        maxAge: GOOGLE_LIFETIME_MS,
      })
      const stateValue = random(),
        state = stateValue + '.' + sign(stateValue),
        nonce = random(),
        verifier = randomBytes(48).toString('base64url'),
        now = Date.now()
      await pool.query(
        'INSERT INTO beasty_identity_google_attempts(state_hash,browser_hash,nonce_hash,verifier_ciphertext,mode,member_id,return_path,created_at,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [
          digest(state),
          digest(browser),
          digest(nonce),
          seal(verifier),
          mode,
          member?.id || null,
          returnTo,
          now,
          now + GOOGLE_LIFETIME_MS,
        ],
      )
      const url = google.generateAuthUrl({
        access_type: 'online',
        scope: ['openid', 'email', 'profile'],
        response_type: 'code',
        state,
        nonce,
        prompt: 'select_account',
        code_challenge: createHash('sha256').update(verifier).digest('base64url'),
        code_challenge_method: CodeChallengeMethod.S256,
      })
      res.redirect(303, url)
    }),
  )

  app.get(
    PREFIX + '/google/callback',
    route(async (req, res) => {
      await rate(req, 'google_callback', 120)
      const state = value(req.query.state, 256),
        browser = cookie(req, BROWSER_COOKIE)
      const parts = state.split('.')
      if (
        parts.length !== 2 ||
        !/^[A-Za-z0-9_-]{43}$/.test(parts[0]) ||
        !constantEqual(parts[1], sign(parts[0])) ||
        !/^[A-Za-z0-9_-]{43}$/.test(browser)
      )
        return res.redirect(303, errorPath('google_state_invalid', '/account'))
      const now = Date.now()
      const attempt = await inTransaction(pool, async (db) => {
        const row = (
          await db.query(
            'SELECT * FROM beasty_identity_google_attempts WHERE state_hash=$1 FOR UPDATE',
            [digest(state)],
          )
        ).rows[0]
        if (
          !row ||
          row.consumed_at ||
          Number(row.expires_at) <= now ||
          !constantEqual(row.browser_hash, digest(browser))
        )
          return null
        await db.query(
          'UPDATE beasty_identity_google_attempts SET consumed_at=$2 WHERE state_hash=$1',
          [digest(state), now],
        )
        return row
      })
      if (!attempt) return res.redirect(303, errorPath('google_state_invalid', '/account'))
      const returnTo = localPath(attempt.return_path, origin)
      if (req.query.error !== undefined)
        return res.redirect(303, errorPath('google_cancelled', returnTo))
      if (!googleEnabled) return res.redirect(303, errorPath('google_unavailable', returnTo))
      const current = attempt.mode === 'link' ? await deps.memberFromRequest(req) : null
      if (attempt.mode === 'link' && (!current || current.id !== attempt.member_id))
        return res.redirect(303, errorPath('google_link_signin_required', returnTo))
      try {
        const code = value(req.query.code, 4096)
        if (!code) return res.redirect(303, errorPath('google_token_invalid', returnTo))
        const tokenResponse = await google.getToken({
          code,
          codeVerifier: unseal(attempt.verifier_ciphertext),
          redirect_uri: googleCallback,
        })
        const idToken = tokenResponse.tokens.id_token
        if (!idToken) return res.redirect(303, errorPath('google_token_invalid', returnTo))
        const ticket = await google.verifyIdToken({ idToken, audience: deps.googleClientId! })
        const claims = ticket.getPayload()
        const issued = Number(claims?.iat),
          expires = Number(claims?.exp),
          second = Date.now() / 1000
        if (
          !claims ||
          typeof claims.sub !== 'string' ||
          !claims.sub ||
          claims.sub.length > 255 ||
          !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss) ||
          claims.aud !== deps.googleClientId ||
          (claims.azp && claims.azp !== deps.googleClientId) ||
          !Number.isFinite(issued) ||
          !Number.isFinite(expires) ||
          issued > second + 60 ||
          expires <= second ||
          !constantEqual(digest(value(claims.nonce, 256)), attempt.nonce_hash)
        )
          return res.redirect(303, errorPath('google_token_invalid', returnTo))
        const email = emailOf(claims.email)
        if (!email) return res.redirect(303, errorPath('google_email_required', returnTo))
        if (claims.email_verified !== true)
          return res.redirect(303, errorPath('google_email_not_verified', returnTo))
        // Google is authoritative for Gmail and verified Workspace identities.
        // A third-party address may have changed owners since Google verified it;
        // it must not become a legacy email-code credential on that claim alone.
        const authoritativeEmail =
          email.endsWith('@gmail.com') || Boolean(value(claims.hd, 253).trim())
        // Allocate outside the transaction: the legacy helper checks its own pool
        // and must not need another connection while all callbacks hold clients.
        const referralCode = await deps.newReferralCode()
        const memberId = await inTransaction(pool, async (db) => {
          await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
            'google:' + claims.sub,
          ])
          const identity = (
            await db.query(
              "SELECT * FROM member_identities WHERE provider='google' AND subject=$1 FOR UPDATE",
              [claims.sub],
            )
          ).rows[0]
          let memberId: string
          if (identity) {
            if (attempt.mode === 'link' && identity.member_id !== attempt.member_id)
              reject(
                409,
                'google_link_conflict',
                'That Google account is already connected to another BEASTY account.',
              )
            memberId = identity.member_id
            await db.query(
              "UPDATE member_identities SET email=$2 WHERE provider='google' AND subject=$1",
              [claims.sub, email],
            )
          } else {
            const matches = (
              await db.query('SELECT id FROM members WHERE lower(trim(email))=$1 ORDER BY id', [
                email,
              ])
            ).rows
            if (attempt.mode === 'link') {
              const target = (
                await db.query('SELECT id FROM members WHERE id=$1 FOR UPDATE', [attempt.member_id])
              ).rows[0]
              if (!target)
                reject(
                  401,
                  'google_link_signin_required',
                  'Sign in to your existing account before connecting Google.',
                )
              if (matches.some((m) => m.id !== target.id))
                reject(
                  409,
                  'google_link_conflict',
                  'Sign in to the account with this email before connecting Google.',
                )
              const linked = await db.query(
                "SELECT 1 FROM member_identities WHERE member_id=$1 AND provider='google' LIMIT 1",
                [target.id],
              )
              if (linked.rowCount)
                reject(
                  409,
                  'google_already_linked',
                  'A Google account is already connected to this member.',
                )
              memberId = target.id
            } else {
              if (matches.length)
                reject(
                  409,
                  'google_link_required',
                  'Sign in with your existing BEASTY code, then explicitly connect Google.',
                )
              memberId = 'mb_' + randomBytes(8).toString('hex')
              await db.query(
                "INSERT INTO members(id,name,email,instagram,phone,referral_code,tier,tier_status,created_at) VALUES($1,$2,$3,NULL,NULL,$4,'free','none',$5)",
                [
                  memberId,
                  value(claims.name, 500).trim().slice(0, 120) || 'Member',
                  authoritativeEmail ? email : null,
                  referralCode,
                  Date.now(),
                ],
              )
            }
            await db.query(
              "INSERT INTO member_identities(id,member_id,provider,subject,email,created_at) VALUES($1,$2,'google',$3,$4,$5)",
              ['mi_' + randomBytes(12).toString('hex'), memberId, claims.sub, email, Date.now()],
            )
          }
          if (authoritativeEmail) {
            // Explicitly linking a verified Google identity can fill a phone-only
            // member's missing contact. It never replaces a contact or takes an
            // email already belonging to another Pages member.
            await db.query(
              'UPDATE members SET email=$2 WHERE id=$1 AND email IS NULL AND NOT EXISTS(SELECT 1 FROM members WHERE lower(trim(email))=$2)',
              [memberId, email],
            )
            await saveProof(db, memberId, email, 'google', claims.sub)
          }
          await db.query(
            'INSERT INTO beasty_identity_audit(member_id,action,created_at) VALUES($1,$2,$3)',
            [memberId, attempt.mode === 'link' ? 'google_linked' : 'google_signed_in', Date.now()],
          )
          return memberId
        })
        await deps.startSession(res, memberId)
        return res.redirect(303, returnTo)
      } catch (error) {
        const databaseError = error as { code?: string; constraint?: string }
        const code =
          error instanceof IdentityError && error.code.startsWith('google_')
            ? error.code
            : databaseError.code === '23505' && databaseError.constraint === 'members_email_key'
              ? 'google_link_required'
              : 'google_failed'
        return res.redirect(303, errorPath(code, returnTo))
      }
    }),
  )

  return { recordEmailProof }
}
