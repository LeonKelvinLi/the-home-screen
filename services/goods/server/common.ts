import { publicPath } from "./runtime.js";
import { createHash, randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import type { Pool, PoolClient } from "pg";
import { z } from "zod";

export type DB = Pool | PoolClient;
export type Row = Record<string, any>;
export const CATEGORIES = [
  "Clothing",
  "Sneakers",
  "Accessories",
  "Collectibles",
  "Electronics",
  "Home",
  "Art",
  "Other",
] as const;
export const CONDITIONS = ["New", "Like new", "Good", "Fair", "Poor"] as const;
export const uuid = () => randomUUID();
export const id = z.string().uuid();
export const clientKey = z.string().trim().min(8).max(100);
export const hash = (input: unknown) =>
  createHash("sha256").update(JSON.stringify(input)).digest("hex");
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "REQUEST_FAILED",
  ) {
    super(message);
  }
}
export function fail(status: number, message: string, code?: string): never {
  throw new ApiError(status, message, code);
}
export function wrap(
  fn: (req: Request, res: Response, next: NextFunction) => unknown,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
export async function transaction<T>(
  pool: Pool,
  fn: (db: PoolClient) => Promise<T>,
): Promise<T> {
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    const result = await fn(db);
    await db.query("COMMIT");
    return result;
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  } finally {
    db.release();
  }
}
export const codes = Array.from({ length: 26 }, (_, i) =>
  [1, 2, 3].map((n) => `${String.fromCharCode(65 + i)}-${n}`),
).flat();
export function normalizeCode(input: string) {
  const canonical = input
    .toUpperCase()
    .replace(/\s/g, "")
    .replace(/^([A-Z])([1-3])$/, "$1-$2");
  if (!/^[A-Z]-[1-3]$/.test(canonical))
    fail(400, "Choose an inventory code from A-1 through Z-3.", "INVALID_SLOT");
  return canonical;
}
export function pagination(req: Request) {
  const limit = z.coerce
    .number()
    .int()
    .min(1)
    .max(78)
    .default(24)
    .parse(req.query.limit);
  let offset = 0;
  if (req.query.cursor) {
    try {
      const decoded = Buffer.from(
        String(req.query.cursor),
        "base64url",
      ).toString();
      if (!/^\d{1,7}$/.test(decoded)) throw new Error();
      offset = Number(decoded);
    } catch {
      fail(400, "The page cursor is invalid.", "INVALID_CURSOR");
    }
  }
  return { limit, offset };
}
export function page<T>(items: T[], limit: number, offset: number) {
  const more = items.length > limit;
  return {
    items: items.slice(0, limit),
    nextCursor: more
      ? Buffer.from(String(offset + limit)).toString("base64url")
      : null,
  };
}
export async function notify(
  db: DB,
  userId: string,
  title: string,
  body: string,
  href: string,
) {
  await db.query(
    "INSERT INTO notifications(id,user_id,title,body,href) VALUES($1,$2,$3,$4,$5)",
    [uuid(), userId, title, body, href],
  );
}
export async function event(
  db: DB,
  tradeId: string,
  actorId: string | null,
  action: string,
  reason?: string,
) {
  await db.query(
    "INSERT INTO trade_events(id,trade_id,actor_id,action,reason) VALUES($1,$2,$3,$4,$5)",
    [uuid(), tradeId, actorId, action, reason ?? null],
  );
}
export async function audit(
  db: DB,
  actorId: string,
  action: string,
  targetId: string,
  reason: string,
) {
  await db.query(
    "INSERT INTO audit_events(id,actor_id,action,target_id,reason) VALUES($1,$2,$3,$4,$5)",
    [uuid(), actorId, action, targetId, reason],
  );
}
export async function ensureProfile(
  db: DB,
  user: { id: string; name: string; email: string },
  adminEmails: Set<string>,
) {
  const existing = (
    await db.query("SELECT * FROM profiles WHERE id=$1", [user.id])
  ).rows[0];
  if (existing) return existing;
  const suffix = hash(user.id).slice(0, 16);
  await db.query(
    `WITH inserted AS (INSERT INTO profiles(id,name,username,role) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO NOTHING RETURNING id) INSERT INTO inventory_slots(owner_id,code) SELECT id,unnest($5::text[]) FROM inserted`,
    [
      user.id,
      user.name.slice(0, 80) || "Member",
      `member_${suffix}`,
      adminEmails.has(user.email.toLowerCase()) ? "admin" : "member",
      codes,
    ],
  );
  return (await db.query("SELECT * FROM profiles WHERE id=$1", [user.id]))
    .rows[0]!;
}
export async function getProfile(db: DB, userId: string, privateRole = false) {
  const r = (
    await db.query(
      `SELECT p.*,u."createdAt" AS joined_at,(SELECT count(*)::int FROM trade_offers t WHERE t.state='completed' AND (t.sender_id=p.id OR t.recipient_id=p.id)) AS completed_trades FROM profiles p JOIN "user" u ON u.id=p.id WHERE p.id=$1`,
      [userId],
    )
  ).rows[0];
  if (!r) fail(404, "Seller not found.", "NOT_FOUND");
  return {
    id: r.id,
    name: r.status === "deleted" ? "Deleted member" : r.name,
    username: r.username,
    bio: r.status === "deleted" ? "" : r.bio,
    location: r.status === "deleted" ? "" : r.location,
    avatarUrl:
      r.avatar_photo_id && r.status !== "deleted"
        ? publicPath(`/api/photos/${r.avatar_photo_id}`)
        : null,
    createdAt: r.joined_at.toISOString(),
    completedTrades: r.completed_trades,
    isDemo: r.is_demo === true,
    ...(privateRole ? { role: r.role, status: r.status } : {}),
  };
}
export async function blocked(db: DB, a: string, b: string) {
  return !!(
    await db.query(
      `SELECT 1 FROM blocks WHERE (user_id=$1 AND target_id=$2) OR (user_id=$2 AND target_id=$1) LIMIT 1`,
      [a, b],
    )
  ).rowCount;
}
export async function activePeople(db: DB, ids: string[], lock = false) {
  const rows = (
    await db.query(
      `SELECT id,status,is_demo FROM profiles WHERE id=ANY($1) ORDER BY id${lock ? " FOR NO KEY UPDATE" : ""}`,
      [ids],
    )
  ).rows;
  if (rows.some((r) => r.is_demo))
    fail(
      409,
      "Demo sample sellers cannot receive messages or take part in trades.",
      "DEMO_ACCOUNT",
    );
  if (
    rows.length !== new Set(ids).size ||
    rows.some((r) => r.status !== "active")
  )
    fail(409, "A participant is unavailable.", "ACCOUNT_UNAVAILABLE");
}
export async function listing(db: DB, listingId: string, viewerId?: string) {
  const r = (await db.query("SELECT * FROM listings WHERE id=$1", [listingId]))
    .rows[0];
  if (!r) fail(404, "Listing not found.", "NOT_FOUND");
  const photos = (
    await db.query(
      "SELECT p.id,p.width,p.height FROM listing_photos lp JOIN photos p ON p.id=lp.photo_id WHERE lp.listing_id=$1 ORDER BY lp.position",
      [listingId],
    )
  ).rows;
  const favorite = viewerId
    ? !!(
        await db.query(
          "SELECT 1 FROM favorites WHERE user_id=$1 AND listing_id=$2",
          [viewerId, listingId],
        )
      ).rowCount
    : false;
  return {
    id: r.id,
    owner: await getProfile(db, r.owner_id),
    code: r.code,
    title: r.title,
    description: r.description,
    category: r.category,
    condition: r.condition,
    priceCents: r.price_cents,
    tradeEnabled: r.trade_enabled,
    tradePreferences: r.trade_preferences,
    status: r.status,
    isHidden: r.is_hidden,
    isDemo: r.is_demo === true,
    version: r.version,
    photos: photos.map((p) => ({
      id: p.id,
      url: publicPath(`/api/photos/${p.id}`),
      thumbnailUrl: publicPath(`/api/photos/${p.id}?size=thumb`),
      width: p.width,
      height: p.height,
    })),
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
    isFavorite: favorite,
  };
}
export async function invalidateOffers(
  db: DB,
  listingIds: string[],
  reason: string,
  exceptId?: string,
) {
  // Every writer locks all affected listings first. This is shared by edits,
  // acceptance and moderation so stale offers cannot survive a committed edit.
  const rows = (
    await db.query(
      `WITH affected AS (SELECT id FROM trade_offers WHERE state='pending' AND (offered_id=ANY($1::uuid[]) OR requested_id=ANY($1::uuid[])) AND ($2::uuid IS NULL OR id<>$2) ORDER BY id FOR NO KEY UPDATE) UPDATE trade_offers t SET state='invalidated',updated_at=now() FROM affected a WHERE t.id=a.id RETURNING t.id,t.sender_id,t.recipient_id`,
      [listingIds, exceptId ?? null],
    )
  ).rows;
  for (const r of rows) {
    await event(db, r.id, null, "invalidated", reason);
    await notify(
      db,
      r.sender_id,
      "Trade no longer available",
      reason,
      `/trades/${r.id}`,
    );
    await notify(
      db,
      r.recipient_id,
      "Trade no longer available",
      reason,
      `/trades/${r.id}`,
    );
  }
}
export async function lockListings(db: DB, ids: string[]) {
  return (
    await db.query(
      "SELECT * FROM listings WHERE id=ANY($1::uuid[]) ORDER BY id FOR NO KEY UPDATE",
      [ids],
    )
  ).rows;
}
export async function canReadListing(db: DB, r: Row, userId?: string) {
  if (r.is_demo && r.demo_disabled) return false;
  if (userId === r.owner_id) return true;
  const owner = (
    await db.query("SELECT status FROM profiles WHERE id=$1", [r.owner_id])
  ).rows[0];
  if (
    owner?.status === "active" &&
    r.published_at &&
    !r.is_hidden &&
    ["active", "reserved", "traded", "archived"].includes(r.status)
  )
    return true;
  if (
    userId &&
    (
      await db.query(
        "SELECT 1 FROM trade_offers WHERE (sender_id=$1 OR recipient_id=$1) AND (offered_id=$2 OR requested_id=$2) LIMIT 1",
        [userId, r.id],
      )
    ).rowCount
  )
    return true;
  return false;
}
