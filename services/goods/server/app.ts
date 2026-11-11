import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import pg from "pg";
import multer from "multer";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { z } from "zod";
import { resolve } from "node:path";
import { createAuth, migrate } from "./auth.js";
import { ApiError, ensureProfile, fail, hash, wrap } from "./common.js";
import { createStorage } from "./storage.js";
import { registerMarketplace } from "./marketplace.js";
import { registerTrades } from "./trades.js";
import { registerCommunications } from "./communications.js";
import { requestContext } from "./runtime.js";
import { registerSharedIdentity } from "./identity.js";
import { registerResale } from "./resale.js";
import { initializeDemoCatalog } from "./demo-catalog.js";

export async function createApp(overrides: NodeJS.ProcessEnv = {}) {
  const config = { ...process.env, ...overrides };
  const basePath = (config.APP_BASE_PATH || "").replace(/\/$/, "");
  config.APP_BASE_PATH = basePath;
  if (!/^(?:\/[a-z][a-z0-9-]*)*$/.test(basePath))
    throw new Error("APP_BASE_PATH must contain simple path segments.");
  const databaseUrl = config.DATABASE_URL;
  if (!databaseUrl)
    throw new Error(
      "DATABASE_URL must point to PostgreSQL; use DB_SCHEMA to isolate a shared host.",
    );
  const appUrl = new URL(config.APP_URL || "http://localhost:8791").origin;
  const production = config.NODE_ENV === "production";
  if (production && !appUrl.startsWith("https://"))
    throw new Error("Production APP_URL must use HTTPS.");
  const origins = [
    appUrl,
    ...(config.TRUSTED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  ];
  for (const origin of origins) {
    const parsed = new URL(origin);
    if (
      parsed.origin !== origin ||
      !["http:", "https:"].includes(parsed.protocol) ||
      (production && parsed.protocol !== "https:")
    )
      throw new Error(
        "TRUSTED_ORIGINS must contain exact HTTP(S) origins (HTTPS in production).",
      );
  }
  if (config.DB_SCHEMA && !/^[a-z][a-z0-9_]{0,40}$/.test(config.DB_SCHEMA))
    throw new Error("Invalid DB_SCHEMA.");
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl:
      /\brender\.com\b/.test(databaseUrl) && !config.PGSSLROOTCERT
        ? { rejectUnauthorized: false }
        : undefined,
    options: config.DB_SCHEMA
      ? `-c search_path=${config.DB_SCHEMA}`
      : undefined,
    max: Number(config.PGPOOL_MAX || 12),
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });
  pool.on("error", () =>
    console.error(
      "PostgreSQL connection interrupted; pending requests will retry through the pool.",
    ),
  );
  if (config.DB_SCHEMA) {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${config.DB_SCHEMA}"`);
  }
  const { auth, flushMail } = createAuth(pool, appUrl, origins, config);
  const storage = createStorage(config);
  try {
    await migrate(pool, auth);
    await initializeDemoCatalog(pool, storage, config);
  } catch (e) {
    await pool.end();
    storage.close();
    throw e;
  }
  const adminEmails = new Set(
    (config.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  const app = express();
  app.use((_req, _res, next) => requestContext.run({ basePath }, next));
  app.disable("x-powered-by");
  app.disable("etag");
  if (config.TRUST_PROXY) app.set("trust proxy", Number(config.TRUST_PROXY));
  app.use(
    helmet({
      contentSecurityPolicy: production
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", "blob:", "data:"],
              connectSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              objectSrc: ["'none'"],
              baseUri: ["'self'"],
              frameAncestors: ["'none'"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    "/api",
    wrap(async (req, res, next) => {
      res.setHeader("Cache-Control", "no-store");
      const origin = req.headers.origin;
      if (origin && origins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Vary", "Origin");
      }
      if (req.method === "OPTIONS") {
        if (!origin || !origins.includes(origin))
          fail(403, "This origin is not allowed.", "INVALID_ORIGIN");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET,POST,PATCH,PUT,DELETE,OPTIONS",
        );
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        return res.sendStatus(204);
      }
      if (
        !["GET", "HEAD"].includes(req.method) &&
        (!origin || !origins.includes(origin))
      )
        fail(
          403,
          "Reload the app from its trusted address before trying again.",
          "INVALID_ORIGIN",
        );
      const authRequest = req.path.startsWith("/auth/");
      const max = Number(
        authRequest
          ? config.AUTH_RATE_LIMIT || 80
          : config.API_RATE_LIMIT || 600,
      );
      const key = hash([req.ip, authRequest ? "auth" : "api"]);
      const r = (
        await pool.query(
          `INSERT INTO rate_limits(key,count,reset_at) VALUES($1,1,now()+interval '1 minute') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.reset_at<now() THEN 1 ELSE rate_limits.count+1 END,reset_at=CASE WHEN rate_limits.reset_at<now() THEN now()+interval '1 minute' ELSE rate_limits.reset_at END RETURNING count`,
          [key],
        )
      ).rows[0];
      if (r.count > max) {
        res.setHeader("Retry-After", "60");
        fail(
          429,
          "Too many requests. Please wait a minute and try again.",
          "RATE_LIMITED",
        );
      }
      next();
    }),
  );
  app.all("/api/auth/*", toNodeHandler(auth));
  app.use(express.json({ limit: "256kb", strict: true }));
  app.use(
    "/api",
    wrap(async (req, res, next) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      res.locals.user = session?.user ?? null;
      if (session?.user) {
        res.locals.profile = await ensureProfile(
          pool,
          session.user,
          adminEmails,
        );
        if (res.locals.profile.status === "deleted") res.locals.user = null;
      }
      next();
    }),
  );
  const requireUser = (res: Response) => {
    if (!res.locals.user) fail(401, "Sign in to continue.", "UNAUTHENTICATED");
    if (res.locals.profile?.is_demo)
      fail(
        403,
        "Demo sample sellers cannot sign in or perform account actions.",
        "DEMO_ACCOUNT",
      );
    if (res.locals.profile?.status !== "active")
      fail(
        403,
        "Your account is restricted. Contact support to resolve outstanding exchanges.",
        "ACCOUNT_RESTRICTED",
      );
    return res.locals.user.id as string;
  };
  app.get(
    "/api/health",
    wrap(async (_req, res) => {
      await pool.query("SELECT 1");
      res.json({ ok: true, service: "bsty-goods" });
    }),
  );
  registerSharedIdentity(app, pool, auth, requireUser, config);
  registerMarketplace(app, pool, storage, requireUser);
  registerTrades(app, pool, requireUser);
  registerCommunications(app, pool, requireUser);
  registerResale(app, pool, requireUser);
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "API route not found.", code: "NOT_FOUND" }),
  );
  const dist = resolve(config.DIST_DIR || "./dist");
  app.use(
    express.static(dist, {
      index: false,
      maxAge: production ? "1h" : 0,
      setHeaders: (res, path) => {
        if (path.endsWith(".html")) res.setHeader("Cache-Control", "no-store");
      },
    }),
  );
  app.get("*", (_req, res, next) =>
    res.sendFile(resolve(dist, "index.html"), (err) => {
      if (err) next(err);
    }),
  );
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiError)
      return res
        .status(err.status)
        .json({ error: err.message, code: err.code });
    if (err instanceof z.ZodError)
      return res.status(400).json({
        error: err.issues
          .map((i) => `${i.path.join(".") || "Request"}: ${i.message}`)
          .join(" "),
        code: "VALIDATION_ERROR",
      });
    if (err instanceof multer.MulterError)
      return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        error:
          err.code === "LIMIT_FILE_SIZE"
            ? "Choose a photograph smaller than 10 MB."
            : "Upload one photograph at a time.",
        code: "UPLOAD_REJECTED",
      });
    const dbError = err as { code?: string; type?: string; status?: number };
    if (dbError.code === "23505")
      return res.status(409).json({
        error:
          "That inventory slot, username or request is already in use. Refresh and try again.",
        code: "CONFLICT",
      });
    if (
      dbError.code === "23503" ||
      dbError.code === "23514" ||
      dbError.code === "22P02"
    )
      return res.status(400).json({
        error: "The request contains an invalid reference or value.",
        code: "VALIDATION_ERROR",
      });
    if (dbError.code === "40P01" || dbError.code === "40001")
      return res.status(409).json({
        error: "Another update won the race. Refresh and retry your action.",
        code: "CONCURRENT_UPDATE",
      });
    if (dbError.type === "entity.too.large")
      return res.status(413).json({
        error: "The request is too large.",
        code: "REQUEST_TOO_LARGE",
      });
    if (dbError instanceof SyntaxError)
      return res.status(400).json({
        error: "The request must contain valid JSON.",
        code: "INVALID_JSON",
      });
    console.error(
      "Request failed.",
      err instanceof Error ? err.name : "UnknownError",
    );
    return res.status(500).json({
      error: "Something went wrong. Please retry.",
      code: "INTERNAL_ERROR",
    });
  });
  let closed = false;
  return {
    app,
    basePath,
    pool,
    auth,
    close: async () => {
      if (closed) return;
      closed = true;
      await flushMail();
      storage.close();
      await pool.end();
    },
  };
}
