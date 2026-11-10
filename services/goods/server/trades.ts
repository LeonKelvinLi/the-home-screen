import type { Express, Response } from "express";
import type { Pool } from "pg";
import { z } from "zod";
import {
  activePeople,
  blocked,
  clientKey,
  type DB,
  event,
  fail,
  getProfile,
  hash,
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

export async function serializeTrade(db: DB, tradeId: string) {
  const r = (
    await db.query("SELECT * FROM trade_offers WHERE id=$1", [tradeId])
  ).rows[0];
  if (!r) fail(404, "Trade not found.", "NOT_FOUND");
  const conversation = (
    await db.query("SELECT id FROM conversations WHERE trade_id=$1", [tradeId])
  ).rows[0];
  const events = (
    await db.query(
      "SELECT * FROM trade_events WHERE trade_id=$1 ORDER BY event_order",
      [tradeId],
    )
  ).rows.map((e) => ({
    id: e.id,
    actorId: e.actor_id,
    action: e.action,
    reason: e.reason,
    createdAt: e.created_at.toISOString(),
  }));
  return {
    id: r.id,
    sender: await getProfile(db, r.sender_id),
    recipient: await getProfile(db, r.recipient_id),
    offered: r.offered_snapshot,
    requested: r.requested_snapshot,
    state: r.state,
    createdAt: r.created_at.toISOString(),
    expiresAt: r.expires_at.toISOString(),
    confirmedBy: r.confirmed_by,
    cancelRequestedBy: r.cancel_requested_by,
    conversationId: conversation?.id ?? null,
    events,
  };
}

export async function createConversation(
  db: DB,
  a: string,
  b: string,
  listingId: string | null,
  tradeId: string | null,
) {
  const pairs = (
    await db.query(
      "SELECT LEAST($1::text,$2::text) AS a,GREATEST($1::text,$2::text) AS b",
      [a, b],
    )
  ).rows[0];
  const existing = (
    await db.query(
      `SELECT * FROM conversations WHERE participant_a=$1 AND participant_b=$2 AND ${tradeId ? "trade_id" : "listing_id"}=$3`,
      [pairs.a, pairs.b, tradeId ?? listingId],
    )
  ).rows[0];
  if (existing) return existing;
  return (
    await db.query(
      "INSERT INTO conversations(id,participant_a,participant_b,listing_id,trade_id) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [uuid(), pairs.a, pairs.b, listingId, tradeId],
    )
  ).rows[0];
}

export async function expireOffers(pool: Pool) {
  const due = (
    await pool.query(
      `SELECT id,sender_id,recipient_id,offered_id,requested_id FROM trade_offers WHERE state='pending' AND expires_at<=now() ORDER BY expires_at,id LIMIT 200`,
    )
  ).rows;
  for (const candidate of due) {
    await transaction(pool, async (db) => {
      await db.query(
        "SELECT id FROM profiles WHERE id=ANY($1::text[]) ORDER BY id FOR NO KEY UPDATE",
        [[candidate.sender_id, candidate.recipient_id]],
      );
      await lockListings(db, [candidate.offered_id, candidate.requested_id]);
      const r = (
        await db.query(
          `UPDATE trade_offers SET state='expired',updated_at=now() WHERE id=$1 AND state='pending' AND expires_at<=now() RETURNING id,sender_id,recipient_id`,
          [candidate.id],
        )
      ).rows[0];
      if (!r) return;
      await event(
        db,
        r.id,
        null,
        "expired",
        "No response before the seven-day expiry.",
      );
      for (const person of [r.sender_id, r.recipient_id])
        await notify(
          db,
          person,
          "Trade offer expired",
          "This offer expired before acceptance.",
          `/trades/${r.id}`,
        );
    });
  }
}

export async function finishTrade(
  db: DB,
  t: Record<string, any>,
  state: "completed" | "canceled",
) {
  await db.query(
    `UPDATE listings SET status=CASE WHEN $2='active' AND is_hidden THEN 'hidden' ELSE $2 END,version=version+1,updated_at=now() WHERE id=ANY($1::uuid[])`,
    [
      [t.offered_id, t.requested_id],
      state === "completed" ? "traded" : "active",
    ],
  );
  await db.query("DELETE FROM reservations WHERE trade_id=$1", [t.id]);
  await db.query(
    "UPDATE trade_offers SET state=$2,updated_at=now() WHERE id=$1",
    [t.id, state],
  );
}

export function registerTrades(
  app: Express,
  pool: Pool,
  requireUser: (res: Response) => string,
) {
  app.post(
    "/api/trades",
    wrap(async (req, res) => {
      const userId = requireUser(res);
      const body = z
        .object({
          offeredListingId: id,
          requestedListingId: id,
          clientRequestId: clientKey,
          message: z.string().trim().max(2000).optional(),
        })
        .strict()
        .parse(req.body);
      if (body.offeredListingId === body.requestedListingId)
        fail(400, "Choose two different items.", "SELF_TRADE");
      const requestHash = hash([
        body.offeredListingId,
        body.requestedListingId,
        body.message ?? "",
      ]);
      const tradeId = await transaction(pool, async (db) => {
        const target = (
          await db.query("SELECT owner_id FROM listings WHERE id=$1", [
            body.requestedListingId,
          ])
        ).rows[0];
        if (!target)
          fail(404, "The requested item is unavailable.", "NOT_FOUND");
        if (target.owner_id === userId)
          fail(400, "You cannot trade with yourself.", "SELF_TRADE");
        await activePeople(db, [userId, target.owner_id], true);
        const existing = (
          await db.query(
            "SELECT * FROM trade_offers WHERE sender_id=$1 AND client_request_id=$2",
            [userId, body.clientRequestId],
          )
        ).rows[0];
        if (existing) {
          if (existing.request_hash !== requestHash)
            fail(
              409,
              "This request ID was already used for a different offer.",
              "IDEMPOTENCY_CONFLICT",
            );
          return existing.id;
        }
        const rows = await lockListings(db, [
          body.offeredListingId,
          body.requestedListingId,
        ]);
        const offered = rows.find((r) => r.id === body.offeredListingId),
          requested = rows.find((r) => r.id === body.requestedListingId);
        if (!offered || !requested)
          fail(404, "An item is unavailable.", "NOT_FOUND");
        if (offered.owner_id !== userId)
          fail(
            403,
            "You can only offer an item from your own inventory.",
            "FORBIDDEN",
          );
        if (requested.owner_id === userId)
          fail(400, "You cannot trade with yourself.", "SELF_TRADE");
        if (
          offered.status !== "active" ||
          requested.status !== "active" ||
          offered.is_hidden ||
          requested.is_hidden ||
          !offered.trade_enabled ||
          !requested.trade_enabled
        )
          fail(
            409,
            "Both items must be available for trading.",
            "ITEM_UNAVAILABLE",
          );
        if (await blocked(db, userId, requested.owner_id))
          fail(403, "These accounts cannot interact.", "BLOCKED");
        const offeredSnapshot = await listing(db, offered.id, userId),
          requestedSnapshot = await listing(db, requested.id, userId);
        const tradeId = uuid();
        await db.query(
          `INSERT INTO trade_offers(id,sender_id,recipient_id,offered_id,requested_id,offered_version,requested_version,offered_snapshot,requested_snapshot,client_request_id,request_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            tradeId,
            userId,
            requested.owner_id,
            offered.id,
            requested.id,
            offered.version,
            requested.version,
            JSON.stringify(offeredSnapshot),
            JSON.stringify(requestedSnapshot),
            body.clientRequestId,
            requestHash,
          ],
        );
        const conversation = await createConversation(
          db,
          userId,
          requested.owner_id,
          null,
          tradeId,
        );
        if (body.message)
          await db.query(
            "INSERT INTO messages(id,conversation_id,sender_id,body,client_request_id) VALUES($1,$2,$3,$4,$5)",
            [uuid(), conversation.id, userId, body.message, `${tradeId}:intro`],
          );
        await event(db, tradeId, userId, "proposed");
        await notify(
          db,
          requested.owner_id,
          "New trade offer",
          `${offeredSnapshot.owner.name} offered ${offeredSnapshot.title} for your ${requestedSnapshot.title}.`,
          `/trades/${tradeId}`,
        );
        return tradeId;
      });
      res.status(201).json({ trade: await serializeTrade(pool, tradeId) });
    }),
  );
  app.get(
    "/api/trades",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        { limit, offset } = pagination(req);
      await expireOffers(pool);
      const tab = z
        .enum(["received", "sent", "accepted", "history"])
        .default("received")
        .parse(req.query.tab);
      const clause =
        tab === "received"
          ? `recipient_id=$1 AND state='pending'`
          : tab === "sent"
            ? `sender_id=$1 AND state='pending'`
            : tab === "accepted"
              ? `(sender_id=$1 OR recipient_id=$1) AND state IN ('accepted','disputed')`
              : `(sender_id=$1 OR recipient_id=$1) AND state NOT IN ('pending','accepted','disputed')`;
      const rows = (
        await pool.query(
          `SELECT id FROM trade_offers WHERE ${clause} ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3`,
          [userId, limit + 1, offset],
        )
      ).rows;
      res.json(
        page(
          await Promise.all(rows.map((r) => serializeTrade(pool, r.id))),
          limit,
          offset,
        ),
      );
    }),
  );
  app.get(
    "/api/trades/:id",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        tradeId = id.parse(req.params.id);
      await expireOffers(pool);
      const t = (
        await pool.query(
          "SELECT sender_id,recipient_id FROM trade_offers WHERE id=$1",
          [tradeId],
        )
      ).rows[0];
      if (!t || ![t.sender_id, t.recipient_id].includes(userId))
        fail(404, "Trade not found.", "NOT_FOUND");
      res.json({ trade: await serializeTrade(pool, tradeId) });
    }),
  );
  app.post(
    "/api/trades/:id/actions",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        tradeId = id.parse(req.params.id);
      const body = z
        .object({
          action: z.enum([
            "accept",
            "decline",
            "withdraw",
            "confirm",
            "cancel",
            "dispute",
          ]),
          clientRequestId: clientKey,
          reason: z.string().trim().max(500).optional(),
        })
        .strict()
        .parse(req.body);
      if (body.action === "dispute" && (!body.reason || body.reason.length < 3))
        fail(
          400,
          "Describe the problem so support can review it.",
          "REASON_REQUIRED",
        );
      await expireOffers(pool);
      await transaction(pool, async (db) => {
        const initial = (
          await db.query("SELECT * FROM trade_offers WHERE id=$1", [tradeId])
        ).rows[0];
        if (
          !initial ||
          ![initial.sender_id, initial.recipient_id].includes(userId)
        )
          fail(404, "Trade not found.", "NOT_FOUND");
        await activePeople(db, [initial.sender_id, initial.recipient_id], true);
        // Lock order is participants, immutable listing IDs, then trade. All
        // listing writes and moderation follow compatible participant/list locks.
        const items = await lockListings(db, [
          initial.offered_id,
          initial.requested_id,
        ]);
        const t = (
          await db.query(
            "SELECT * FROM trade_offers WHERE id=$1 FOR NO KEY UPDATE",
            [tradeId],
          )
        ).rows[0];
        const commandHash = hash([tradeId, body.action, body.reason ?? ""]);
        const previous = (
          await db.query(
            "SELECT * FROM trade_commands WHERE actor_id=$1 AND client_request_id=$2",
            [userId, body.clientRequestId],
          )
        ).rows[0];
        if (previous) {
          if (previous.request_hash !== commandHash)
            fail(
              409,
              "This request ID was used for a different action.",
              "IDEMPOTENCY_CONFLICT",
            );
          return;
        }
        const recipient = t.recipient_id === userId;
        const other = recipient ? t.sender_id : t.recipient_id;
        // A retry with a fresh key must not record another participant
        // confirmation or move the terminal event away from the end of history.
        const repeatedConfirmation =
          body.action === "confirm" &&
          ["accepted", "completed"].includes(t.state) &&
          t.confirmed_by.includes(userId);
        const repeatedCancellation =
          body.action === "cancel" &&
          ["accepted", "canceled"].includes(t.state) &&
          t.cancel_requested_by.includes(userId);
        if (repeatedConfirmation || repeatedCancellation) {
          await db.query(
            "INSERT INTO trade_commands(actor_id,client_request_id,trade_id,request_hash) VALUES($1,$2,$3,$4)",
            [userId, body.clientRequestId, tradeId, commandHash],
          );
          return;
        }
        // Invalid actions roll back this event with the rest of the transaction.
        // Recording it first makes completed/canceled the final outcome event.
        await event(db, tradeId, userId, body.action, body.reason);
        if (body.action === "accept" || body.action === "decline") {
          if (!recipient)
            fail(
              403,
              "Only the recipient can respond to this offer.",
              "FORBIDDEN",
            );
          if (t.state !== "pending" || t.expires_at.getTime() <= Date.now())
            fail(409, "This offer is no longer pending.", "TRADE_UNAVAILABLE");
          if (body.action === "accept") {
            if (await blocked(db, t.sender_id, t.recipient_id))
              fail(403, "These accounts cannot interact.", "BLOCKED");
            const offered = items.find((i) => i.id === t.offered_id),
              requested = items.find((i) => i.id === t.requested_id);
            if (
              !offered ||
              !requested ||
              offered.owner_id !== t.sender_id ||
              requested.owner_id !== t.recipient_id ||
              offered.status !== "active" ||
              requested.status !== "active" ||
              offered.is_hidden ||
              requested.is_hidden ||
              !offered.trade_enabled ||
              !requested.trade_enabled ||
              offered.version !== t.offered_version ||
              requested.version !== t.requested_version
            )
              fail(
                409,
                "An item changed or is no longer available. Refresh the trade.",
                "ITEM_UNAVAILABLE",
              );
            await db.query(
              "INSERT INTO reservations(listing_id,trade_id) VALUES($1,$3),($2,$3)",
              [t.offered_id, t.requested_id, tradeId],
            );
            await db.query(
              `UPDATE listings SET status='reserved',updated_at=now() WHERE id=ANY($1::uuid[])`,
              [[t.offered_id, t.requested_id]],
            );
            await db.query(
              `UPDATE trade_offers SET state='accepted',updated_at=now() WHERE id=$1`,
              [tradeId],
            );
            await invalidateOffers(
              db,
              [t.offered_id, t.requested_id],
              "An item was reserved for another accepted trade.",
              tradeId,
            );
            await notify(
              db,
              other,
              "Trade accepted",
              "Both items are reserved. Coordinate your exchange; acceptance is not completion.",
              `/trades/${tradeId}`,
            );
          } else {
            await db.query(
              `UPDATE trade_offers SET state='declined',updated_at=now() WHERE id=$1`,
              [tradeId],
            );
            await notify(
              db,
              other,
              "Trade declined",
              "The recipient declined your offer.",
              `/trades/${tradeId}`,
            );
          }
        } else if (body.action === "withdraw") {
          if (recipient)
            fail(403, "Only the sender can withdraw this offer.", "FORBIDDEN");
          if (t.state !== "pending")
            fail(
              409,
              "Only a pending offer can be withdrawn.",
              "TRADE_UNAVAILABLE",
            );
          await db.query(
            `UPDATE trade_offers SET state='withdrawn',updated_at=now() WHERE id=$1`,
            [tradeId],
          );
          await notify(
            db,
            other,
            "Trade withdrawn",
            "The sender withdrew this offer.",
            `/trades/${tradeId}`,
          );
        } else if (body.action === "confirm") {
          if (t.state === "completed" && t.confirmed_by.includes(userId)) {
            /* safe retry with a fresh key */
          } else {
            if (t.state !== "accepted")
              fail(
                409,
                "Only an accepted trade can be confirmed.",
                "TRADE_UNAVAILABLE",
              );
            const confirmed = [...new Set([...t.confirmed_by, userId])];
            await db.query(
              "UPDATE trade_offers SET confirmed_by=$2,updated_at=now() WHERE id=$1",
              [tradeId, confirmed],
            );
            if (confirmed.length === 2) {
              await finishTrade(db, t, "completed");
              await event(
                db,
                tradeId,
                userId,
                "completed",
                "Both participants confirmed their exchange.",
              );
              for (const person of [t.sender_id, t.recipient_id])
                await notify(
                  db,
                  person,
                  "Trade completed",
                  "Both participants confirmed. Your items moved to history and inventory slots are available.",
                  `/trades/${tradeId}`,
                );
            } else
              await notify(
                db,
                other,
                "Exchange confirmation requested",
                "The other participant confirmed completion. Confirm only after your exchange is complete.",
                `/trades/${tradeId}`,
              );
          }
        } else if (body.action === "cancel") {
          if (
            t.state === "canceled" &&
            t.cancel_requested_by.includes(userId)
          ) {
            /* safe retry */
          } else {
            if (t.state !== "accepted")
              fail(
                409,
                "Only an accepted trade can request mutual cancellation.",
                "TRADE_UNAVAILABLE",
              );
            const requested = [...new Set([...t.cancel_requested_by, userId])];
            await db.query(
              "UPDATE trade_offers SET cancel_requested_by=$2,updated_at=now() WHERE id=$1",
              [tradeId, requested],
            );
            if (requested.length === 2) {
              await finishTrade(db, t, "canceled");
              await event(
                db,
                tradeId,
                userId,
                "canceled",
                "Both participants agreed to cancel.",
              );
              for (const person of [t.sender_id, t.recipient_id])
                await notify(
                  db,
                  person,
                  "Trade canceled",
                  "Both participants agreed to cancel. Both items are available again.",
                  `/trades/${tradeId}`,
                );
            } else
              await notify(
                db,
                other,
                "Cancellation requested",
                "Both participants must agree before items are made available again.",
                `/trades/${tradeId}`,
              );
          }
        } else if (body.action === "dispute") {
          if (t.state !== "accepted")
            fail(
              409,
              "Only an accepted trade can be disputed.",
              "TRADE_UNAVAILABLE",
            );
          await db.query(
            `UPDATE trade_offers SET state='disputed',updated_at=now() WHERE id=$1`,
            [tradeId],
          );
          await db.query(
            "INSERT INTO reports(id,reporter_id,target_type,target_id,reason) VALUES($1,$2,$3,$4,$5)",
            [uuid(), userId, "trade", tradeId, body.reason],
          );
          for (const person of [t.sender_id, t.recipient_id])
            await notify(
              db,
              person,
              "Trade under review",
              "An exchange problem was reported. Both items remain reserved until support records a resolution.",
              `/trades/${tradeId}`,
            );
        }
        await db.query(
          "INSERT INTO trade_commands(actor_id,client_request_id,trade_id,request_hash) VALUES($1,$2,$3,$4)",
          [userId, body.clientRequestId, tradeId, commandHash],
        );
      });
      res.json({ trade: await serializeTrade(pool, tradeId) });
    }),
  );
}
