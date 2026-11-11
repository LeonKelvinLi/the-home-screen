import type { Express, Response } from "express";
import type { Pool } from "pg";
import { z } from "zod";
import {
  audit,
  clientKey,
  fail,
  hash,
  id,
  notify,
  page,
  pagination,
  transaction,
  uuid,
  wrap,
} from "./common.js";

const form = z.object({
  clientKey,
  contactEmail: z.email().trim().max(254),
  collectionSize: z.number().int().min(1).max(100_000),
  goal: z.enum(["consign", "fundraiser"]),
  organization: z.string().trim().max(160),
  details: z.string().trim().min(10).max(2000),
});

const fields =
  'id, goal, organization, contact_email AS "contactEmail", collection_size AS "collectionSize", details, state, created_at AS "createdAt"';

export function registerResale(
  app: Express,
  pool: Pool,
  requireUser: (res: Response) => string,
) {
  const operator = (res: Response) => {
    const actor = requireUser(res);
    if (res.locals.profile?.role !== "admin")
      fail(403, "Operator access required.", "FORBIDDEN");
    return actor;
  };

  app.get(
    "/api/resale/requests",
    wrap(async (_req, res) => {
      const owner = requireUser(res);
      const { rows } = await pool.query(
        `SELECT ${fields} FROM managed_resale_requests WHERE owner_id=$1 ORDER BY created_at DESC, id DESC LIMIT 20`,
        [owner],
      );
      res.json({ items: rows });
    }),
  );

  app.post(
    "/api/resale/requests",
    wrap(async (req, res) => {
      const owner = requireUser(res);
      const { clientKey: key, ...input } = form.parse(req.body);
      const digest = hash(input);
      const result = await transaction(pool, async (db) => {
        // Serialize this user's retries and account deletion.
        const profile = (
          await db.query("SELECT status FROM profiles WHERE id=$1 FOR UPDATE", [
            owner,
          ])
        ).rows[0];
        if (profile?.status !== "active")
          fail(403, "Your account is restricted.", "ACCOUNT_RESTRICTED");
        const existing = (
          await db.query(
            `SELECT ${fields}, request_hash FROM managed_resale_requests WHERE owner_id=$1 AND client_key=$2`,
            [owner, key],
          )
        ).rows[0];
        if (existing) {
          const { request_hash, ...request } = existing;
          if (request_hash !== digest)
            fail(
              409,
              "This submission was already received with different details.",
              "RETRY_CONFLICT",
            );
          return { request, created: false };
        }
        if (
          (
            await db.query(
              "SELECT 1 FROM managed_resale_requests WHERE owner_id=$1 AND state='submitted'",
              [owner],
            )
          ).rowCount
        ) {
          fail(
            409,
            "You already have a request waiting for review.",
            "RESALE_PENDING",
          );
        }
        const request = (
          await db.query(
            `INSERT INTO managed_resale_requests(id,owner_id,client_key,request_hash,contact_email,collection_size,goal,organization,details)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${fields}`,
            [
              uuid(),
              owner,
              key,
              digest,
              input.contactEmail,
              input.collectionSize,
              input.goal,
              input.organization,
              input.details,
            ],
          )
        ).rows[0];
        return { request, created: true };
      });
      res.status(result.created ? 201 : 200).json({ request: result.request });
    }),
  );

  app.post(
    "/api/resale/requests/:id/withdraw",
    wrap(async (req, res) => {
      const owner = requireUser(res);
      const result = await pool.query(
        "UPDATE managed_resale_requests SET state='withdrawn' WHERE id=$1 AND owner_id=$2 AND state IN ('submitted','withdrawn')",
        [id.parse(req.params.id), owner],
      );
      if (!result.rowCount)
        fail(404, "Pending request not found.", "NOT_FOUND");
      res.json({ ok: true });
    }),
  );

  app.get(
    "/api/admin/resale/requests",
    wrap(async (req, res) => {
      operator(res);
      const state = z
        .enum(["submitted", "reviewed", "withdrawn"])
        .default("submitted")
        .parse(req.query.state);
      const { limit, offset } = pagination(req);
      const { rows } = await pool.query(
        `SELECT ${fields} FROM managed_resale_requests WHERE state=$1 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
        [state, limit + 1, offset],
      );
      res.json(page(rows, limit, offset));
    }),
  );

  app.post(
    "/api/admin/resale/requests/:id/review",
    wrap(async (req, res) => {
      const actor = operator(res);
      const requestId = id.parse(req.params.id);
      await transaction(pool, async (db) => {
        const source = (
          await db.query(
            "SELECT owner_id FROM managed_resale_requests WHERE id=$1",
            [requestId],
          )
        ).rows[0];
        if (!source) fail(404, "Request not found.", "NOT_FOUND");
        // Match account deletion's profile-first locking order.
        await db.query("SELECT 1 FROM profiles WHERE id=$1 FOR UPDATE", [
          source.owner_id,
        ]);
        const request = (
          await db.query(
            "SELECT owner_id,state FROM managed_resale_requests WHERE id=$1 FOR UPDATE",
            [requestId],
          )
        ).rows[0];
        if (!request || request.state === "withdrawn")
          fail(404, "Request not found.", "NOT_FOUND");
        if (request.state === "reviewed") return;
        await db.query(
          "UPDATE managed_resale_requests SET state='reviewed',reviewed_at=now() WHERE id=$1",
          [requestId],
        );
        await audit(
          db,
          actor,
          "review_managed_resale",
          requestId,
          "Managed resale inquiry reviewed",
        );
        await notify(
          db,
          request.owner_id,
          "Managed resale request reviewed",
          "The BSTY Goods team reviewed your inquiry.",
          "/managed-resale",
        );
      });
      res.json({ ok: true });
    }),
  );
}
