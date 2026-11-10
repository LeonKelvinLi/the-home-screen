import type { Express, Response } from "express";
import type { Pool } from "pg";
import { z } from "zod";
import {
  activePeople,
  audit,
  blocked,
  canReadListing,
  clientKey,
  type DB,
  fail,
  getProfile,
  id,
  invalidateOffers,
  listing,
  lockListings,
  notify,
  page,
  pagination,
  transaction,
  uuid,
  wrap,
} from "./common.js";
import { createConversation, finishTrade, serializeTrade } from "./trades.js";

async function participant(
  db: DB,
  conversationId: string,
  userId: string,
  lock = false,
) {
  const r = (
    await db.query(
      `SELECT * FROM conversations WHERE id=$1${lock ? " FOR UPDATE" : ""}`,
      [conversationId],
    )
  ).rows[0];
  if (!r || ![r.participant_a, r.participant_b].includes(userId))
    fail(404, "Conversation not found.", "NOT_FOUND");
  return r;
}
async function serializeConversation(
  db: DB,
  conversationId: string,
  userId: string,
) {
  const r = await participant(db, conversationId, userId);
  const otherId =
    r.participant_a === userId ? r.participant_b : r.participant_a;
  const last = (
    await db.query(
      "SELECT body,created_at FROM messages WHERE conversation_id=$1 ORDER BY created_at DESC,id DESC LIMIT 1",
      [conversationId],
    )
  ).rows[0];
  const unread = Number(
    (
      await db.query(
        `SELECT count(*) FROM messages m WHERE m.conversation_id=$1 AND m.sender_id<>$2 AND m.created_at>COALESCE((SELECT read_at FROM conversation_reads WHERE conversation_id=$1 AND user_id=$2),'-infinity'::timestamptz)`,
        [conversationId, userId],
      )
    ).rows[0].count,
  );
  let context = null;
  if (r.listing_id) context = await listing(db, r.listing_id, userId);
  else if (r.trade_id) {
    const t = (
      await db.query(
        "SELECT requested_snapshot FROM trade_offers WHERE id=$1",
        [r.trade_id],
      )
    ).rows[0];
    context = t?.requested_snapshot ?? null;
  }
  return {
    id: r.id,
    other: await getProfile(db, otherId),
    listing: context,
    tradeId: r.trade_id,
    lastMessage: last
      ? { body: last.body, createdAt: last.created_at.toISOString() }
      : null,
    unreadCount: unread,
  };
}
const message = (r: Record<string, any>) => ({
  id: r.id,
  senderId: r.sender_id,
  body: r.body,
  createdAt: r.created_at.toISOString(),
  clientRequestId: r.client_request_id,
});

export function registerCommunications(
  app: Express,
  pool: Pool,
  requireUser: (res: Response) => string,
) {
  app.get(
    "/api/conversations",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        { limit, offset } = pagination(req);
      const rows = (
        await pool.query(
          "SELECT id FROM conversations WHERE participant_a=$1 OR participant_b=$1 ORDER BY updated_at DESC,id DESC LIMIT $2 OFFSET $3",
          [userId, limit + 1, offset],
        )
      ).rows;
      const unreadCount = Number(
        (
          await pool.query(
            `SELECT count(*) FROM messages m JOIN conversations c ON c.id=m.conversation_id WHERE (c.participant_a=$1 OR c.participant_b=$1) AND m.sender_id<>$1 AND m.created_at>COALESCE((SELECT read_at FROM conversation_reads WHERE conversation_id=c.id AND user_id=$1),'-infinity'::timestamptz)`,
            [userId],
          )
        ).rows[0].count,
      );
      res.json({
        ...page(
          await Promise.all(
            rows.map((r) => serializeConversation(pool, r.id, userId)),
          ),
          limit,
          offset,
        ),
        unreadCount,
      });
    }),
  );
  app.get(
    "/api/conversations/:id",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        conversationId = id.parse(req.params.id);
      res.json({
        conversation: await serializeConversation(pool, conversationId, userId),
      });
    }),
  );
  app.post(
    "/api/conversations",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        body = z
          .object({ sellerId: z.string().min(1).max(100), listingId: id })
          .strict()
          .parse(req.body);
      if (body.sellerId === userId)
        fail(
          400,
          "You cannot start a conversation with yourself.",
          "SELF_CONVERSATION",
        );
      const conversationId = await transaction(pool, async (db) => {
        await activePeople(db, [userId, body.sellerId], true);
        const r = (await lockListings(db, [body.listingId]))[0];
        if (r?.is_demo)
          fail(
            409,
            "Demo sample items are for browsing only. Messages are disabled.",
            "DEMO_LISTING",
          );
        if (
          !r ||
          r.owner_id !== body.sellerId ||
          r.is_hidden ||
          !["active", "reserved"].includes(r.status)
        )
          fail(404, "Listing unavailable.", "NOT_FOUND");
        if (await blocked(db, userId, body.sellerId))
          fail(403, "These accounts cannot interact.", "BLOCKED");
        return (
          await createConversation(
            db,
            userId,
            body.sellerId,
            body.listingId,
            null,
          )
        ).id;
      });
      res.status(201).json({
        conversation: await serializeConversation(pool, conversationId, userId),
      });
    }),
  );
  app.get(
    "/api/conversations/:id/messages",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        conversationId = id.parse(req.params.id),
        { limit, offset } = pagination(req);
      await participant(pool, conversationId, userId);
      const rows = (
        await pool.query(
          "SELECT * FROM messages WHERE conversation_id=$1 ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3",
          [conversationId, limit + 1, offset],
        )
      ).rows;
      const result = page(rows.map(message), limit, offset);
      res.json({ ...result, items: result.items.reverse() });
    }),
  );
  app.post(
    "/api/conversations/:id/messages",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        conversationId = id.parse(req.params.id),
        body = z
          .object({
            body: z.string().trim().min(1).max(2000),
            clientRequestId: clientKey,
          })
          .strict()
          .parse(req.body);
      const result = await transaction(pool, async (db) => {
        const initial = await participant(db, conversationId, userId);
        const other =
          initial.participant_a === userId
            ? initial.participant_b
            : initial.participant_a;
        await activePeople(db, [userId, other], true);
        await participant(db, conversationId, userId, true);
        if (await blocked(db, userId, other))
          fail(403, "These accounts cannot exchange messages.", "BLOCKED");
        const existing = (
          await db.query(
            "SELECT * FROM messages WHERE sender_id=$1 AND client_request_id=$2",
            [userId, body.clientRequestId],
          )
        ).rows[0];
        if (existing) {
          if (
            existing.conversation_id !== conversationId ||
            existing.body !== body.body
          )
            fail(
              409,
              "This message request ID was already used for different content.",
              "IDEMPOTENCY_CONFLICT",
            );
          return existing;
        }
        const m = (
          await db.query(
            "INSERT INTO messages(id,conversation_id,sender_id,body,client_request_id,created_at) VALUES($1,$2,$3,$4,$5,clock_timestamp()) RETURNING *",
            [uuid(), conversationId, userId, body.body, body.clientRequestId],
          )
        ).rows[0];
        await db.query(
          "UPDATE conversations SET updated_at=clock_timestamp() WHERE id=$1",
          [conversationId],
        );
        await notify(
          db,
          other,
          "New message",
          `${(await getProfile(db, userId)).name} sent you a message.`,
          `/inbox/${conversationId}`,
        );
        return m;
      });
      res.status(201).json({ message: message(result) });
    }),
  );
  app.post(
    "/api/conversations/:id/read",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        conversationId = id.parse(req.params.id);
      await transaction(pool, async (db) => {
        await participant(db, conversationId, userId, true);
        await db.query(
          "INSERT INTO conversation_reads(conversation_id,user_id,read_at) VALUES($1,$2,clock_timestamp()) ON CONFLICT(conversation_id,user_id) DO UPDATE SET read_at=clock_timestamp()",
          [conversationId, userId],
        );
      });
      res.json({ success: true });
    }),
  );
  app.get(
    "/api/notifications",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        { limit, offset } = pagination(req);
      const rows = (
        await pool.query(
          "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3",
          [userId, limit + 1, offset],
        )
      ).rows;
      const items = rows.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        href: r.href,
        createdAt: r.created_at.toISOString(),
        readAt: r.read_at?.toISOString() ?? null,
      }));
      const unreadCount = Number(
        (
          await pool.query(
            "SELECT count(*) FROM notifications WHERE user_id=$1 AND read_at IS NULL",
            [userId],
          )
        ).rows[0].count,
      );
      res.json({ ...page(items, limit, offset), unreadCount });
    }),
  );
  app.post(
    "/api/notifications/read",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        body = z
          .union([
            z.object({ all: z.literal(true) }).strict(),
            z.object({ ids: z.array(id).max(100) }).strict(),
          ])
          .parse(req.body);
      if ("all" in body)
        await pool.query(
          "UPDATE notifications SET read_at=COALESCE(read_at,now()) WHERE user_id=$1",
          [userId],
        );
      else
        await pool.query(
          "UPDATE notifications SET read_at=COALESCE(read_at,now()) WHERE user_id=$1 AND id=ANY($2::uuid[])",
          [userId, body.ids],
        );
      res.json({ success: true });
    }),
  );
  app.get(
    "/api/blocks",
    wrap(async (_req, res) => {
      const userId = requireUser(res);
      const rows = (
        await pool.query(
          "SELECT target_id FROM blocks WHERE user_id=$1 ORDER BY created_at DESC",
          [userId],
        )
      ).rows;
      res.json({
        items: await Promise.all(
          rows.map((r) => getProfile(pool, r.target_id)),
        ),
      });
    }),
  );
  app.post(
    "/api/blocks",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        body = z
          .object({ userId: z.string().min(1).max(100), blocked: z.boolean() })
          .strict()
          .parse(req.body);
      if (body.userId === userId) fail(400, "You cannot block yourself.");
      await transaction(pool, async (db) => {
        const people = (
          await db.query(
            "SELECT id,status FROM profiles WHERE id=ANY($1::text[]) ORDER BY id FOR NO KEY UPDATE",
            [[userId, body.userId]],
          )
        ).rows;
        if (people.length !== 2) fail(404, "Member not found.", "NOT_FOUND");
        if (people.find((r) => r.id === userId)?.status !== "active")
          fail(
            403,
            "Your account cannot perform this action.",
            "ACCOUNT_UNAVAILABLE",
          );
        if (body.blocked)
          await db.query(
            "INSERT INTO blocks(user_id,target_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
            [userId, body.userId],
          );
        else
          await db.query(
            "DELETE FROM blocks WHERE user_id=$1 AND target_id=$2",
            [userId, body.userId],
          );
      });
      res.json({ success: true });
    }),
  );
  app.post(
    "/api/reports",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        body = z
          .object({
            targetType: z.enum(["listing", "user", "message", "trade"]),
            targetId: z.string().min(1).max(100),
            reason: z.string().trim().min(3).max(2000),
          })
          .strict()
          .parse(req.body);
      const reportId = uuid();
      await transaction(pool, async (db) => {
        if (body.targetType === "user") {
          if (
            !(
              await db.query("SELECT 1 FROM profiles WHERE id=$1", [
                body.targetId,
              ])
            ).rowCount
          )
            fail(404, "Member not found.", "NOT_FOUND");
        } else {
          id.parse(body.targetId);
          if (body.targetType === "listing") {
            const r = (
              await db.query("SELECT * FROM listings WHERE id=$1", [
                body.targetId,
              ])
            ).rows[0];
            if (!r || !(await canReadListing(db, r, userId)))
              fail(404, "Listing not found.", "NOT_FOUND");
          } else if (body.targetType === "message") {
            const m = (
              await db.query(
                "SELECT conversation_id FROM messages WHERE id=$1",
                [body.targetId],
              )
            ).rows[0];
            if (!m) fail(404, "Message not found.", "NOT_FOUND");
            await participant(db, m.conversation_id, userId);
          } else {
            const t = (
              await db.query(
                "SELECT sender_id,recipient_id FROM trade_offers WHERE id=$1",
                [body.targetId],
              )
            ).rows[0];
            if (!t || ![t.sender_id, t.recipient_id].includes(userId))
              fail(404, "Trade not found.", "NOT_FOUND");
          }
        }
        await db.query(
          "INSERT INTO reports(id,reporter_id,target_type,target_id,reason) VALUES($1,$2,$3,$4,$5)",
          [reportId, userId, body.targetType, body.targetId, body.reason],
        );
      });
      res.status(201).json({ id: reportId });
    }),
  );
  const requireAdmin = (res: Response) => {
    const userId = requireUser(res);
    if (res.locals.profile?.role !== "admin")
      fail(403, "Operator access required.", "FORBIDDEN");
    return userId;
  };
  app.get(
    "/api/admin/overview",
    wrap(async (_req, res) => {
      requireAdmin(res);
      const userRows = (
        await pool.query(
          "SELECT id FROM profiles ORDER BY created_at DESC LIMIT 100",
        )
      ).rows;
      const reportRows = (
        await pool.query(
          "SELECT * FROM reports ORDER BY status,created_at DESC LIMIT 100",
        )
      ).rows;
      const listingRows = (
        await pool.query(
          "SELECT id FROM listings ORDER BY updated_at DESC LIMIT 100",
        )
      ).rows;
      const tradeRows = (
        await pool.query(
          "SELECT id FROM trade_offers ORDER BY updated_at DESC LIMIT 100",
        )
      ).rows;
      const reports = await Promise.all(
        reportRows.map(async (r) => {
          let context: { text: string; href?: string } | null = null;
          if (r.target_type === "message") {
            const m = (
              await pool.query(
                "SELECT body,sender_id,conversation_id FROM messages WHERE id=$1::uuid",
                [r.target_id],
              )
            ).rows[0];
            if (m) context = { text: `Message from ${m.sender_id}: ${m.body}` };
          } else if (r.target_type === "listing") {
            const l = (
              await pool.query(
                "SELECT title,description,owner_id FROM listings WHERE id=$1::uuid",
                [r.target_id],
              )
            ).rows[0];
            if (l)
              context = {
                text: `${l.title}\n${l.description}\nOwner: ${l.owner_id}`,
                href: `/items/${r.target_id}`,
              };
          } else if (r.target_type === "user") {
            const p = (
              await pool.query(
                "SELECT name,username,bio,status FROM profiles WHERE id=$1",
                [r.target_id],
              )
            ).rows[0];
            if (p)
              context = {
                text: `${p.name} (@${p.username}) · ${p.status}\n${p.bio}`,
                href: `/sellers/${r.target_id}`,
              };
          } else {
            const t = (
              await pool.query(
                "SELECT state,offered_snapshot,requested_snapshot FROM trade_offers WHERE id=$1::uuid",
                [r.target_id],
              )
            ).rows[0];
            if (t)
              context = {
                text: `${t.offered_snapshot.title} ↔ ${t.requested_snapshot.title} · ${t.state}`,
              };
          }
          return {
            id: r.id,
            reporterId: r.reporter_id,
            targetType: r.target_type,
            targetId: r.target_id,
            reason: r.reason,
            status: r.status,
            resolution: r.resolution,
            context,
            createdAt: r.created_at.toISOString(),
          };
        }),
      );
      res.json({
        users: await Promise.all(
          userRows.map((r) => getProfile(pool, r.id, true)),
        ),
        reports,
        listings: await Promise.all(
          listingRows.map((r) => listing(pool, r.id)),
        ),
        trades: await Promise.all(
          tradeRows.map((r) => serializeTrade(pool, r.id)),
        ),
      });
    }),
  );
  app.post(
    "/api/admin/actions",
    wrap(async (req, res) => {
      const actorId = requireAdmin(res),
        body = z
          .object({
            action: z.enum([
              "hide_listing",
              "restrict_user",
              "restore_user",
              "resolve_report",
              "resolve_trade",
            ]),
            targetId: z.string().min(1).max(100),
            reason: z.string().trim().min(3).max(1000),
            resolution: z.enum(["canceled", "completed"]).optional(),
          })
          .strict()
          .parse(req.body);
      await transaction(pool, async (db) => {
        if (body.action === "restrict_user" || body.action === "restore_user") {
          if (body.targetId === actorId)
            fail(400, "You cannot restrict your own operator account.");
          const target = (
            await db.query(
              "SELECT * FROM profiles WHERE id=$1 FOR NO KEY UPDATE",
              [body.targetId],
            )
          ).rows[0];
          if (!target || target.status === "deleted")
            fail(404, "Member unavailable.", "NOT_FOUND");
          const own = (
            await db.query(
              "SELECT id FROM listings WHERE owner_id=$1 ORDER BY id FOR NO KEY UPDATE",
              [body.targetId],
            )
          ).rows.map((r) => r.id);
          await db.query(
            "UPDATE profiles SET status=$2,updated_at=now() WHERE id=$1",
            [
              body.targetId,
              body.action === "restrict_user" ? "restricted" : "active",
            ],
          );
          if (body.action === "restrict_user") {
            await invalidateOffers(
              db,
              own,
              "A participant is unavailable. Support can review any accepted exchange.",
            );
            await db.query('DELETE FROM session WHERE "userId"=$1', [
              body.targetId,
            ]);
          }
          await notify(
            db,
            body.targetId,
            body.action === "restrict_user"
              ? "Account restricted"
              : "Account restored",
            body.reason,
            "/profile",
          );
        } else if (body.action === "hide_listing") {
          id.parse(body.targetId);
          const initial = (
            await db.query("SELECT owner_id FROM listings WHERE id=$1", [
              body.targetId,
            ])
          ).rows[0];
          if (!initial) fail(404, "Listing unavailable.", "NOT_FOUND");
          await db.query(
            "SELECT id FROM profiles WHERE id=$1 FOR NO KEY UPDATE",
            [initial.owner_id],
          );
          const target = (await lockListings(db, [body.targetId]))[0];
          await db.query(
            `UPDATE listings SET is_hidden=true,status=CASE WHEN status IN ('active','draft','archived') THEN 'hidden' ELSE status END,version=version+1,updated_at=now() WHERE id=$1`,
            [body.targetId],
          );
          await invalidateOffers(
            db,
            [body.targetId],
            "An item was removed by moderation.",
          );
          await notify(
            db,
            target.owner_id,
            "Listing hidden",
            body.reason,
            `/items/${body.targetId}`,
          );
        } else if (body.action === "resolve_report") {
          id.parse(body.targetId);
          const result = await db.query(
            `UPDATE reports SET status='resolved',resolution=$2,resolved_at=now() WHERE id=$1 RETURNING reporter_id`,
            [body.targetId, body.reason],
          );
          if (!result.rowCount) fail(404, "Report not found.", "NOT_FOUND");
          await notify(
            db,
            result.rows[0].reporter_id,
            "Report reviewed",
            "An operator reviewed your report.",
            "/notifications",
          );
        } else {
          const tradeId = id.parse(body.targetId);
          if (!body.resolution) fail(400, "Choose a trade resolution.");
          const initial = (
            await db.query("SELECT * FROM trade_offers WHERE id=$1", [tradeId])
          ).rows[0];
          if (!initial) fail(404, "Trade not found.", "NOT_FOUND");
          await db.query(
            "SELECT id FROM profiles WHERE id=ANY($1::text[]) ORDER BY id FOR NO KEY UPDATE",
            [[initial.sender_id, initial.recipient_id]],
          );
          await lockListings(db, [initial.offered_id, initial.requested_id]);
          const target = (
            await db.query(
              "SELECT * FROM trade_offers WHERE id=$1 FOR NO KEY UPDATE",
              [tradeId],
            )
          ).rows[0];
          if (!["accepted", "disputed"].includes(target.state))
            fail(409, "This trade is already resolved.", "TRADE_UNAVAILABLE");
          await finishTrade(db, target, body.resolution);
          await db.query(
            "INSERT INTO trade_events(id,trade_id,actor_id,action,reason) VALUES($1,$2,$3,$4,$5)",
            [
              uuid(),
              tradeId,
              actorId,
              `operator_${body.resolution}`,
              body.reason,
            ],
          );
          for (const person of [target.sender_id, target.recipient_id])
            await notify(
              db,
              person,
              "Trade resolved by support",
              body.reason,
              `/trades/${tradeId}`,
            );
        }
        await audit(db, actorId, body.action, body.targetId, body.reason);
      });
      res.json({ success: true });
    }),
  );
}
