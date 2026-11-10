import { publicPath } from "./runtime.js";
import type { Express, Request, Response } from "express";
import type { Pool } from "pg";
import multer from "multer";
import sharp from "sharp";
import { z } from "zod";
import {
  CATEGORIES,
  CONDITIONS,
  activePeople,
  audit,
  canReadListing,
  clientKey,
  codes,
  fail,
  getProfile,
  hash,
  id,
  invalidateOffers,
  listing,
  lockListings,
  normalizeCode,
  page,
  pagination,
  transaction,
  uuid,
  wrap,
} from "./common.js";
import type { createStorage } from "./storage.js";

export function registerMarketplace(
  app: Express,
  pool: Pool,
  storage: ReturnType<typeof createStorage>,
  requireUser: (res: Response) => string,
) {
  app.get("/api/categories", (_req, res) => res.json({ items: CATEGORIES }));
  app.get(
    "/api/me",
    wrap(async (_req, res) => {
      if (!res.locals.user) return res.json({ user: null });
      const profile = await getProfile(pool, res.locals.user.id, true);
      if (profile.status === "deleted") return res.json({ user: null });
      res.json({ user: { ...profile, email: res.locals.user.email } });
    }),
  );
  app.patch(
    "/api/me",
    wrap(async (req, res) => {
      const userId = requireUser(res);
      const body = z
        .object({
          name: z.string().trim().min(1).max(80).optional(),
          username: z
            .string()
            .trim()
            .regex(/^[a-z0-9_]{3,32}$/)
            .optional(),
          bio: z.string().trim().max(500).optional(),
          location: z.string().trim().max(80).optional(),
          avatarPhotoId: id.nullable().optional(),
        })
        .strict()
        .parse(req.body);
      await transaction(pool, async (db) => {
        await activePeople(db, [userId], true);
        const current = (
          await db.query("SELECT * FROM profiles WHERE id=$1", [userId])
        ).rows[0];
        if (
          body.name !== undefined &&
          body.name !== current.name &&
          (
            await db.query(
              'SELECT 1 FROM account WHERE "userId"=$1 AND "providerId"=$2',
              [userId, "beastypages"],
            )
          ).rowCount
        ) {
          fail(
            409,
            "Manage your shared name in BEASTY Pages, then sign in again to sync it here.",
            "SHARED_IDENTITY_MANAGED",
          );
        }
        if (
          body.avatarPhotoId &&
          !(
            await db.query("SELECT 1 FROM photos WHERE id=$1 AND owner_id=$2", [
              body.avatarPhotoId,
              userId,
            ])
          ).rowCount
        )
          fail(400, "Choose a photograph you uploaded.", "PHOTO_OWNERSHIP");
        await db.query(
          "UPDATE profiles SET name=$2,username=$3,bio=$4,location=$5,avatar_photo_id=$6,updated_at=now() WHERE id=$1",
          [
            userId,
            body.name ?? current.name,
            body.username ?? current.username,
            body.bio ?? current.bio,
            body.location ?? current.location,
            body.avatarPhotoId === undefined
              ? current.avatar_photo_id
              : body.avatarPhotoId,
          ],
        );
        if (body.name)
          await db.query(
            'UPDATE "user" SET name=$2,"updatedAt"=now() WHERE id=$1',
            [userId, body.name],
          );
      });
      res.json({
        user: {
          ...(await getProfile(pool, userId, true)),
          email: res.locals.user.email,
        },
      });
    }),
  );
  app.delete(
    "/api/me",
    wrap(async (req, res) => {
      const userId = requireUser(res);
      z.object({ confirmation: z.literal("DELETE") })
        .strict()
        .parse(req.body);
      await transaction(pool, async (db) => {
        await activePeople(db, [userId], true);
        const owned = (
          await db.query(
            "SELECT id FROM listings WHERE owner_id=$1 ORDER BY id FOR NO KEY UPDATE",
            [userId],
          )
        ).rows.map((r) => r.id);
        if (
          (
            await db.query(
              `SELECT 1 FROM trade_offers WHERE (sender_id=$1 OR recipient_id=$1) AND state IN ('accepted','disputed') LIMIT 1`,
              [userId],
            )
          ).rowCount
        )
          fail(
            409,
            "Resolve your accepted or disputed trades before deleting your account.",
            "UNRESOLVED_TRADE",
          );
        await invalidateOffers(
          db,
          owned,
          "The item owner closed their account.",
        );
        const pending = (
          await db.query(
            `UPDATE trade_offers SET state='withdrawn',updated_at=now() WHERE (sender_id=$1 OR recipient_id=$1) AND state='pending' RETURNING id,sender_id,recipient_id`,
            [userId],
          )
        ).rows;
        // All owned items above were invalidated first. Offers cannot be created
        // concurrently because every trade writer locks both participant rows.
        for (const t of pending)
          await db.query(
            "INSERT INTO trade_events(id,trade_id,actor_id,action,reason) VALUES($1,$2,$3,$4,$5)",
            [uuid(), t.id, userId, "withdrawn", "Account closed"],
          );
        await db.query(
          `UPDATE listings SET status='archived',version=version+1,updated_at=now() WHERE owner_id=$1 AND status IN ('draft','active')`,
          [userId],
        );
        await db.query(
          `UPDATE profiles SET status='deleted',name='Deleted member',bio='',location='',avatar_photo_id=NULL,updated_at=now() WHERE id=$1`,
          [userId],
        );
        await db.query("DELETE FROM favorites WHERE user_id=$1", [userId]);
        await db.query("DELETE FROM notifications WHERE user_id=$1", [userId]);
        await db.query('DELETE FROM session WHERE "userId"=$1', [userId]);
        await db.query('DELETE FROM account WHERE "userId"=$1', [userId]);
        await db.query(
          "DELETE FROM shared_identity_profiles WHERE user_id=$1",
          [userId],
        );
        await db.query(
          'UPDATE "user" SET name=$2,email=$3,image=NULL,"emailVerified"=false,"updatedAt"=now() WHERE id=$1',
          [userId, "Deleted member", `deleted-${uuid()}@invalid.local`],
        );
        await audit(
          db,
          userId,
          "delete_account",
          userId,
          "Account holder requested deletion; exchange records retained for participant history.",
        );
      });
      res.json({ success: true });
    }),
  );
  app.get(
    "/api/sellers/:id",
    wrap(async (req, res) => {
      const seller = await getProfile(pool, String(req.params.id));
      const status = (
        await pool.query("SELECT status FROM profiles WHERE id=$1", [seller.id])
      ).rows[0]?.status;
      if (status !== "active" && res.locals.user?.id !== seller.id)
        fail(404, "Seller unavailable.", "NOT_FOUND");
      res.json({ seller });
    }),
  );
  app.get(
    "/api/listings",
    wrap(async (req, res) => {
      const { limit, offset } = pagination(req);
      const q = z
        .object({
          q: z.string().trim().max(120).optional(),
          category: z.enum(CATEGORIES).optional(),
          condition: z.enum(CONDITIONS).optional(),
          minPrice: z.coerce.number().int().min(0).max(100000000).optional(),
          maxPrice: z.coerce.number().int().min(0).max(100000000).optional(),
          tradeOnly: z.enum(["true", "false"]).optional(),
          sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
          seller: z.string().max(100).optional(),
        })
        .parse(req.query);
      if (
        q.minPrice !== undefined &&
        q.maxPrice !== undefined &&
        q.minPrice > q.maxPrice
      )
        fail(400, "Minimum price must not exceed maximum price.");
      const clauses = [
        `l.status IN ('active','reserved')`,
        `l.is_hidden=false`,
        `l.demo_disabled=false`,
        `p.status='active'`,
      ];
      const args: unknown[] = [];
      const where = (sql: string, value: unknown) => {
        args.push(value);
        clauses.push(sql.replace("?", `$${args.length}`));
      };
      if (q.q)
        where(
          `to_tsvector('simple',l.title || ' ' || l.description) @@ plainto_tsquery('simple',?)`,
          q.q,
        );
      if (q.category) where("l.category=?", q.category);
      if (q.condition) where("l.condition=?", q.condition);
      if (q.minPrice !== undefined) where("l.price_cents>=?", q.minPrice);
      if (q.maxPrice !== undefined) where("l.price_cents<=?", q.maxPrice);
      if (q.tradeOnly === "true")
        clauses.push(`l.trade_enabled=true AND l.status='active'`);
      if (q.seller) where("l.owner_id=?", q.seller);
      const order =
        q.sort === "price_asc"
          ? "l.price_cents ASC NULLS LAST,l.id DESC"
          : q.sort === "price_desc"
            ? "l.price_cents DESC NULLS LAST,l.id DESC"
            : "l.created_at DESC,l.id DESC";
      args.push(limit + 1, offset);
      const rows = (
        await pool.query(
          `SELECT l.id FROM listings l JOIN profiles p ON p.id=l.owner_id WHERE ${clauses.join(" AND ")} ORDER BY ${order} LIMIT $${args.length - 1} OFFSET $${args.length}`,
          args,
        )
      ).rows;
      const items = await Promise.all(
        rows.map((r) => listing(pool, r.id, res.locals.user?.id)),
      );
      res.json(page(items, limit, offset));
    }),
  );
  app.get(
    "/api/listings/:id",
    wrap(async (req, res) => {
      const listingId = id.parse(req.params.id);
      const r = (
        await pool.query("SELECT * FROM listings WHERE id=$1", [listingId])
      ).rows[0];
      if (!r || !(await canReadListing(pool, r, res.locals.user?.id)))
        fail(404, "Listing unavailable.", "NOT_FOUND");
      res.json({
        listing: await listing(pool, listingId, res.locals.user?.id),
      });
    }),
  );
  app.get(
    "/api/me/inventory",
    wrap(async (_req, res) => {
      const userId = requireUser(res);
      const rows = (
        await pool.query(
          "SELECT id,status,code FROM listings WHERE owner_id=$1 ORDER BY created_at DESC",
          [userId],
        )
      ).rows;
      const items = await Promise.all(
        rows.map((r) => listing(pool, r.id, userId)),
      );
      const occupied = new Map(
        items
          .filter((r) => ["draft", "active", "reserved"].includes(r.status))
          .map((r) => [r.code, r]),
      );
      res.json({
        slots: codes.map((code) => ({
          code,
          listing: occupied.get(code) ?? null,
        })),
        history: items.filter(
          (r) => !["draft", "active", "reserved"].includes(r.status),
        ),
      });
    }),
  );
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
  }).single("file");
  app.post(
    "/api/uploads",
    wrap(async (req, res, next) => {
      requireUser(res);
      upload(req, res, next);
    }),
    wrap(async (req, res) => {
      const userId = requireUser(res);
      const file = req.file;
      if (
        !file ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
      )
        fail(400, "Upload a JPEG, PNG or WebP photograph.", "INVALID_IMAGE");
      let output: any;
      let thumbnail: Buffer;
      try {
        const metadata = await sharp(file.buffer, {
          limitInputPixels: 40000000,
          animated: false,
          failOn: "warning",
        }).metadata();
        if (!["jpeg", "png", "webp"].includes(metadata.format || ""))
          fail(400, "The file is not a supported photograph.", "INVALID_IMAGE");
        output = await sharp(file.buffer, {
          limitInputPixels: 40000000,
          animated: false,
          failOn: "warning",
        })
          .rotate()
          .resize({
            width: 1600,
            height: 1600,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 82 })
          .toBuffer({ resolveWithObject: true });
        thumbnail = await sharp(output.data)
          .resize({
            width: 480,
            height: 480,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 75 })
          .toBuffer();
      } catch {
        fail(
          400,
          "This photograph could not be decoded. Try a different JPEG, PNG or WebP.",
          "INVALID_IMAGE",
        );
      }
      const photoId = uuid(),
        key = `${photoId}.webp`,
        thumbnailKey = `${uuid()}.webp`;
      try {
        await transaction(pool, async (db) => {
          await activePeople(db, [userId], true);
          const count = Number(
            (
              await db.query("SELECT count(*) FROM photos WHERE owner_id=$1", [
                userId,
              ])
            ).rows[0].count,
          );
          if (count >= 512)
            fail(
              409,
              "Your photo storage is full. Contact support to review unused uploads.",
              "UPLOAD_QUOTA",
            );
          await storage.put(key, output.data);
          await storage.put(thumbnailKey, thumbnail);
          await db.query(
            "INSERT INTO photos(id,owner_id,storage_key,width,height,bytes,thumbnail_storage_key) VALUES($1,$2,$3,$4,$5,$6,$7)",
            [
              photoId,
              userId,
              key,
              output.info.width,
              output.info.height,
              output.data.length,
              thumbnailKey,
            ],
          );
        });
      } catch (e) {
        await Promise.allSettled([
          storage.remove(key),
          storage.remove(thumbnailKey),
        ]);
        throw e;
      }
      res.status(201).json({
        photo: {
          id: photoId,
          url: publicPath(`/api/photos/${photoId}`),
          thumbnailUrl: publicPath(`/api/photos/${photoId}?size=thumb`),
          width: output.info.width,
          height: output.info.height,
        },
      });
    }),
  );
  app.get(
    "/api/photos/:id",
    wrap(async (req, res) => {
      const photoId = id.parse(req.params.id),
        userId = res.locals.user?.id;
      const size = z.enum(["thumb", "full"]).optional().parse(req.query.size);
      const photo = (
        await pool.query("SELECT * FROM photos WHERE id=$1", [photoId])
      ).rows[0];
      if (!photo) fail(404, "Photo not found.", "NOT_FOUND");
      let allowed = photo.owner_id === userId;
      if (!allowed)
        allowed = !!(
          await pool.query(
            `SELECT 1 FROM profiles WHERE avatar_photo_id=$1 AND status='active' LIMIT 1`,
            [photoId],
          )
        ).rowCount;
      if (!allowed)
        allowed = !!(
          await pool.query(
            `SELECT 1 FROM listing_photos lp JOIN listings l ON l.id=lp.listing_id JOIN profiles p ON p.id=l.owner_id WHERE lp.photo_id=$1 AND l.published_at IS NOT NULL AND l.status IN ('active','reserved','traded','archived') AND l.is_hidden=false AND l.demo_disabled=false AND p.status='active' LIMIT 1`,
            [photoId],
          )
        ).rowCount;
      if (!allowed && userId)
        allowed = !!(
          await pool.query(
            `SELECT 1 FROM trade_offers t WHERE (t.sender_id=$1 OR t.recipient_id=$1) AND (t.offered_snapshot->'photos' @> $2::jsonb OR t.requested_snapshot->'photos' @> $2::jsonb) LIMIT 1`,
            [userId, JSON.stringify([{ id: photoId }])],
          )
        ).rowCount;
      if (!allowed) fail(404, "Photo not found.", "NOT_FOUND");
      const buffer = await storage
        .get(
          size === "thumb" && photo.thumbnail_storage_key
            ? photo.thumbnail_storage_key
            : photo.storage_key,
        )
        .catch(() =>
          fail(
            503,
            "Photo temporarily unavailable. Please retry.",
            "STORAGE_UNAVAILABLE",
          ),
        );
      res.setHeader("Cache-Control", "private, max-age=300");
      res.type("image/webp").send(buffer);
    }),
  );
  const listingBody = z
    .object({
      code: z.string().max(10).optional(),
      title: z.string().trim().max(80).optional(),
      description: z.string().trim().max(2000).optional(),
      category: z.union([z.enum(CATEGORIES), z.literal("")]).optional(),
      condition: z.union([z.enum(CONDITIONS), z.literal("")]).optional(),
      priceCents: z.number().int().min(1).max(100000000).nullable().optional(),
      tradeEnabled: z.boolean().optional(),
      tradePreferences: z.string().trim().max(500).optional(),
      photoIds: z
        .array(id)
        .max(6)
        .refine(
          (v) => new Set(v).size === v.length,
          "Duplicate photos are not permitted.",
        )
        .optional(),
      status: z.enum(["draft", "active", "archived"]).optional(),
      clientRequestId: clientKey.optional(),
    })
    .strict();
  const saveListing = (editing: boolean) =>
    wrap(async (req: Request, res: Response) => {
      const userId = requireUser(res),
        body = listingBody.parse(req.body);
      const listingId = editing ? id.parse(req.params.id) : uuid();
      const savedId = await transaction(pool, async (db) => {
        await activePeople(db, [userId], true);
        const { clientRequestId, ...payload } = body;
        const requestHash = hash([editing ? listingId : null, payload]);
        if (clientRequestId) {
          const previous = (
            await db.query(
              "SELECT listing_id,request_hash FROM listing_commands WHERE actor_id=$1 AND client_request_id=$2",
              [userId, clientRequestId],
            )
          ).rows[0];
          if (previous) {
            if (previous.request_hash !== requestHash)
              fail(
                409,
                "This listing request ID was used for different content.",
                "IDEMPOTENCY_CONFLICT",
              );
            return previous.listing_id as string;
          }
        }
        let current: any;
        if (editing) {
          current = (await lockListings(db, [listingId]))[0];
          if (!current) fail(404, "Listing not found.", "NOT_FOUND");
          if (current.owner_id !== userId)
            fail(403, "Only the owner can change this listing.", "FORBIDDEN");
          if (
            ["reserved", "traded", "hidden"].includes(current.status) ||
            current.is_hidden
          )
            fail(
              409,
              "This listing cannot be edited in its current state.",
              "LISTING_LOCKED",
            );
        }
        const code = normalizeCode(body.code ?? current?.code ?? "");
        const title = body.title ?? current?.title ?? "",
          description = body.description ?? current?.description ?? "";
        const category = body.category ?? current?.category ?? "",
          condition = body.condition ?? current?.condition ?? "";
        const price =
          body.priceCents === undefined
            ? (current?.price_cents ?? null)
            : body.priceCents;
        const tradeEnabled =
          body.tradeEnabled ?? current?.trade_enabled ?? true;
        const tradePreferences =
          body.tradePreferences ?? current?.trade_preferences ?? "";
        const status = body.status ?? current?.status ?? "draft";
        const photoIds =
          body.photoIds ??
          (editing
            ? (
                await db.query(
                  "SELECT photo_id FROM listing_photos WHERE listing_id=$1 ORDER BY position",
                  [listingId],
                )
              ).rows.map((p) => p.photo_id)
            : []);
        if (photoIds.length) {
          const ownPhotos = await db.query(
            "SELECT id FROM photos WHERE id=ANY($1::uuid[]) AND owner_id=$2",
            [photoIds, userId],
          );
          if (ownPhotos.rowCount !== photoIds.length)
            fail(
              400,
              "Every photo must belong to your account.",
              "PHOTO_OWNERSHIP",
            );
        }
        if (
          status === "active" &&
          (!title ||
            !description ||
            !category ||
            !condition ||
            !photoIds.length)
        )
          fail(
            400,
            "Add a title, description, category, condition and at least one photo before publishing.",
            "INCOMPLETE_LISTING",
          );
        if (status === "active" && !tradeEnabled && price === null)
          fail(
            400,
            "Add a reference price or enable trading.",
            "INCOMPLETE_LISTING",
          );
        if (editing) {
          await db.query(
            `UPDATE listings SET code=$2,title=$3,description=$4,category=$5,condition=$6,price_cents=$7,trade_enabled=$8,trade_preferences=$9,status=$10,published_at=CASE WHEN $10='active' THEN COALESCE(published_at,now()) ELSE published_at END,version=version+1,updated_at=now() WHERE id=$1`,
            [
              listingId,
              code,
              title,
              description,
              category,
              condition,
              price,
              tradeEnabled,
              tradePreferences,
              status,
            ],
          );
          await invalidateOffers(
            db,
            [listingId],
            "An item in this offer was changed or removed. Review the updated listing before sending a new offer.",
          );
          await db.query("DELETE FROM listing_photos WHERE listing_id=$1", [
            listingId,
          ]);
        } else {
          await db.query(
            `INSERT INTO listings(id,owner_id,code,title,description,category,condition,price_cents,trade_enabled,trade_preferences,status,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CASE WHEN $11='active' THEN now() ELSE NULL END)`,
            [
              listingId,
              userId,
              code,
              title,
              description,
              category,
              condition,
              price,
              tradeEnabled,
              tradePreferences,
              status,
            ],
          );
        }
        for (let i = 0; i < photoIds.length; i++)
          await db.query(
            "INSERT INTO listing_photos(listing_id,photo_id,position) VALUES($1,$2,$3)",
            [listingId, photoIds[i], i],
          );
        if (clientRequestId)
          await db.query(
            "INSERT INTO listing_commands(actor_id,client_request_id,listing_id,request_hash) VALUES($1,$2,$3,$4)",
            [userId, clientRequestId, listingId, requestHash],
          );
        return listingId;
      });
      res
        .status(editing ? 200 : 201)
        .json({ listing: await listing(pool, savedId, userId) });
    });
  app.post("/api/listings", saveListing(false));
  app.patch("/api/listings/:id", saveListing(true));
  app.get(
    "/api/favorites",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        { limit, offset } = pagination(req);
      const rows = (
        await pool.query(
          `SELECT f.listing_id FROM favorites f JOIN listings l ON l.id=f.listing_id JOIN profiles p ON p.id=l.owner_id WHERE f.user_id=$1 AND l.published_at IS NOT NULL AND l.status<>'draft' AND l.status<>'hidden' AND l.is_hidden=false AND l.demo_disabled=false AND p.status='active' ORDER BY f.created_at DESC,f.listing_id DESC LIMIT $2 OFFSET $3`,
          [userId, limit + 1, offset],
        )
      ).rows;
      res.json(
        page(
          await Promise.all(
            rows.map((r) => listing(pool, r.listing_id, userId)),
          ),
          limit,
          offset,
        ),
      );
    }),
  );
  app.put(
    "/api/favorites/:id",
    wrap(async (req, res) => {
      const userId = requireUser(res),
        listingId = id.parse(req.params.id),
        body = z.object({ saved: z.boolean() }).strict().parse(req.body);
      await transaction(pool, async (db) => {
        await activePeople(db, [userId], true);
        const r = (
          await db.query("SELECT * FROM listings WHERE id=$1", [listingId])
        ).rows[0];
        if (!r || !(await canReadListing(db, r, userId)))
          fail(404, "Listing unavailable.", "NOT_FOUND");
        if (body.saved)
          await db.query(
            "INSERT INTO favorites(user_id,listing_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
            [userId, listingId],
          );
        else
          await db.query(
            "DELETE FROM favorites WHERE user_id=$1 AND listing_id=$2",
            [userId, listingId],
          );
      });
      res.json({ saved: body.saved });
    }),
  );
}
