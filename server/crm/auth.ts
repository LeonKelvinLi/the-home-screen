/*
  WHO IS ASKING, AND WHAT THEY MAY DO. Enforced here, on every request; the
  screen hiding a button is a courtesy, not the control.

  Three ways in, checked in order:
  1. The operator token in an Authorization header (scripts, curl).
  2. A CRM session made from that token on the /crm screen: an httpOnly
     cookie, stored hashed, 30 days. The token itself never lives in the page.
  3. A BEASTY member session whose member is linked to a crm_people row with a
     role. That is how Glenn, Leon, Janelle and any partner sign in without a
     second password: their existing account, plus a role only an admin grants.

  THE OPERATOR IS GLENN. Leon's ask of 2026-09-22: where no person is named,
  the CRM names Glenn. So the operator key acts as Glenn's own seat: what it
  logs reads "Glenn", and what it owns or closes is his by default.

  OPEN MODE, for previews: with CRM_OPEN=1 the screen needs no key at all and
  everyone is Glenn. The server honours it only when it is NOT production
  (deps.open is computed that way in server/index.ts, and says so at boot), so
  a live deploy can never ship without its lock.
*/
import { createHash, randomBytes } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { db } from '../db/schema'
import { GLENN_ID } from './core'
import type { PersonRow } from './core'

export type CrmRole = 'admin' | 'team' | 'partner'

export interface CrmActor {
  /** What goes into changed_by / actor columns: 'person:<id>'. */
  actor: string
  role: CrmRole
  personId: string | null
  name: string
  /** How they got in: the operator key, their member account, or open mode. */
  via: 'operator' | 'member' | 'open'
}

const glenn = (via: CrmActor['via']): CrmActor => ({ actor: `person:${GLENN_ID}`, role: 'admin', personId: GLENN_ID, name: 'Glenn', via })

export interface CrmDeps {
  isOperator(req: Request): boolean
  isOperatorToken(token: string): boolean
  memberFromRequest(req: Request): Promise<{ id: string; name: string } | null>
  readCookie(req: Request, name: string): string | null
  /** Server secret for signing the referral cookie (domain-separated). */
  secret: string
  prod: boolean
  /** CRM_OPEN=1 outside production: no key, everyone is Glenn. */
  open?: boolean
  /**
   * The public site's origin when the CRM runs at an address of its own
   * (CRM_ONLY): referral links and their QR codes must open the site, where
   * the visit is credited. Empty when the CRM is on the site itself.
   */
  publicUrl?: string
}

export const CRM_COOKIE = 'beasty_crm'
const SESSION_DAYS = 30
const hash = (t: string) => createHash('sha256').update(t).digest('hex')

declare module 'express-serve-static-core' {
  interface Request {
    crm?: CrmActor
  }
}

export async function crmActor(req: Request, deps: CrmDeps): Promise<CrmActor | null> {
  if (deps.isOperator(req)) return glenn('operator')
  const token = deps.readCookie(req, CRM_COOKIE)
  if (token && token.length >= 32) {
    const row = await db
      .prepare('SELECT actor FROM crm_sessions WHERE token_hash = ? AND expires_at > ?')
      .get<{ actor: string }>(hash(token), Date.now())
    if (row) return glenn('operator')
  }
  const member = await deps.memberFromRequest(req)
  if (member) {
    const p = await db
      .prepare("SELECT * FROM crm_people WHERE member_id = ? AND active AND role <> 'none'")
      .get<PersonRow>(member.id)
    if (p) return { actor: `person:${p.id}`, role: p.role as CrmRole, personId: p.id, name: p.name, via: 'member' }
  }
  if (deps.open && !deps.prod) return glenn('open')
  return null
}

const RANK: Record<CrmRole, number> = { partner: 1, team: 2, admin: 3 }

/**
 * Gate a route to a minimum role. Partners only ever get the routes that ask
 * for 'partner' explicitly; everything operational asks for at least 'team'.
 */
export function requireCrm(deps: CrmDeps, min: CrmRole) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const who = await crmActor(req, deps)
      if (!who) return res.status(401).json({ error: 'Sign in to the CRM first.' })
      if (RANK[who.role] < RANK[min]) {
        return res.status(403).json({ error: 'Your CRM role cannot do this.' })
      }
      req.crm = who
      res.set('Cache-Control', 'no-store')
      next()
    } catch (err) {
      next(err)
    }
  }
}

/** Exchange the operator token for a CRM session cookie. */
export async function startCrmSession(res: Response, deps: CrmDeps): Promise<void> {
  const token = randomBytes(32).toString('base64url')
  const t = Date.now()
  await db
    .prepare('INSERT INTO crm_sessions (token_hash, actor, created_at, expires_at) VALUES (?,?,?,?)')
    .run(hash(token), 'operator', t, t + SESSION_DAYS * 864e5)
  const bits = [`${CRM_COOKIE}=${token}`, 'HttpOnly', 'SameSite=Strict', `Max-Age=${SESSION_DAYS * 86400}`, 'Path=/']
  if (deps.prod) bits.push('Secure')
  res.append('Set-Cookie', bits.join('; '))
}

export async function endCrmSession(req: Request, res: Response, deps: CrmDeps): Promise<void> {
  const token = deps.readCookie(req, CRM_COOKIE)
  if (token) await db.prepare('DELETE FROM crm_sessions WHERE token_hash = ?').run(hash(token))
  res.append('Set-Cookie', `${CRM_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`)
}
