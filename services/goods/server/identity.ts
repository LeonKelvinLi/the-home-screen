import { createHash } from "node:crypto";
import type { Express, Request, Response } from "express";
import type { Pool } from "pg";
import { fromNodeHeaders } from "better-auth/node";
import type { GenericOAuthConfig } from "better-auth/plugins/generic-oauth";
import type { createAuth } from "./auth.js";
import { fail, transaction, wrap } from "./common.js";
import { requestContext } from "./runtime.js";
import { z } from "zod";

export interface SharedProfile {
  memberId: string;
  name: string;
  email: string | null;
}
function originFor(config: NodeJS.ProcessEnv) {
  if (!config.BEASTY_IDENTITY_ORIGIN || !config.BEASTY_SSO_CLIENT_SECRET)
    return null;
  const u = new URL(config.BEASTY_IDENTITY_ORIGIN);
  if (
    u.origin !== config.BEASTY_IDENTITY_ORIGIN ||
    (u.protocol !== "https:" &&
      !(
        u.protocol === "http:" &&
        ["127.0.0.1", "localhost", "[::1]"].includes(u.hostname)
      ))
  )
    throw new Error(
      "BEASTY_IDENTITY_ORIGIN must be an exact HTTPS origin (or loopback for testing).",
    );
  return u.origin;
}
export function sharedProvider(
  config: NodeJS.ProcessEnv,
): GenericOAuthConfig | null {
  const issuer = originFor(config);
  if (!issuer) return null;
  return {
    providerId: "beastypages",
    name: "BEASTY Pages",
    clientId: config.BEASTY_SSO_CLIENT_ID || "bsty-goods",
    clientSecret: config.BEASTY_SSO_CLIENT_SECRET,
    authorizationUrl: issuer + "/api/identity/authorize",
    tokenUrl: issuer + "/api/identity/token",
    userInfoUrl: issuer + "/api/identity/userinfo",
    scopes: ["profile", "email"],
    pkce: true,
    authentication: "post",
    // Keep existing Goods recovery credentials intact. The shared display name
    // and verified email snapshot are synchronized separately by the hooks below.
    // Replacing email here can otherwise lock out an already linked subject
    // when that contact is also used by another legacy Goods account.
    overrideUserInfo: false,
    accountSubject: ({ profile }) => String(profile.sub),
    getUserInfo: async (tokens) => {
      const response = await fetch(issuer + "/api/identity/userinfo", {
        headers: { Authorization: "Bearer " + tokens.accessToken },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("BEASTY identity verification failed.");
      const p = z
        .object({
          sub: z.string().min(1).max(120),
          name: z.string().trim().min(1).max(2000),
          email: z.string().nullable().optional(),
          email_verified: z.boolean().optional(),
        })
        .parse(await response.json());
      const email =
        p.email_verified === true &&
        p.email &&
        z.string().email().safeParse(p.email).success
          ? p.email.toLowerCase()
          : null;
      const context = requestContext.getStore();
      const name = p.name.slice(0, 80);
      if (context) context.identity = { memberId: p.sub, name, email };
      const alias =
        "member-" +
        createHash("sha256").update(p.sub).digest("hex").slice(0, 32) +
        "@members.beasty.invalid";
      return {
        sub: p.sub,
        id: p.sub,
        name,
        email: email || alias,
        emailVerified: !!email,
        email_verified: !!email,
      };
    },
    mapProfileToUser: (profile) => ({
      name: String(profile.name),
      email: String(profile.email),
      emailVerified: profile.email_verified === true,
    }),
  };
}
export async function syncSharedProfile(pool: Pool, userId: string) {
  const profile = requestContext.getStore()?.identity;
  if (!profile) return;
  await transaction(pool, async (db) => {
    // Hold the binding until all profile writes commit. Unlink/delete may run
    // concurrently, and must not leave a stale private identity snapshot.
    const linked = (
      await db.query(
        'SELECT 1 FROM account WHERE "userId"=$1 AND "providerId"=$2 AND "accountId"=$3 FOR SHARE',
        [userId, "beastypages", profile.memberId],
      )
    ).rowCount;
    if (!linked) return;
    await db.query(
      `INSERT INTO shared_identity_profiles(user_id,member_id,name,verified_email) VALUES($1,$2,$3,$4) ON CONFLICT(user_id) DO UPDATE SET member_id=EXCLUDED.member_id,name=EXCLUDED.name,verified_email=EXCLUDED.verified_email,synced_at=now()`,
      [userId, profile.memberId, profile.name, profile.email],
    );
    await db.query('UPDATE "user" SET name=$2,"updatedAt"=now() WHERE id=$1', [
      userId,
      profile.name,
    ]);
    await db.query("UPDATE profiles SET name=$2,updated_at=now() WHERE id=$1", [
      userId,
      profile.name,
    ]);
  });
}
function destination(value: string, basePath: string, origin: string) {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(value)
  )
    fail(400, "Choose a page inside Goods.", "INVALID_RETURN");
  let path = value;
  if (
    basePath &&
    !(
      path === basePath ||
      path.startsWith(basePath + "/") ||
      path.startsWith(basePath + "?")
    )
  )
    path = basePath + path;
  const url = new URL(path, origin);
  if (
    url.origin !== origin ||
    (basePath &&
      url.pathname !== basePath &&
      !url.pathname.startsWith(basePath + "/"))
  )
    fail(400, "Choose a page inside Goods.", "INVALID_RETURN");
  return url.toString();
}
export function registerSharedIdentity(
  app: Express,
  pool: Pool,
  auth: ReturnType<typeof createAuth>["auth"],
  requireUser: (res: Response) => string,
  config: NodeJS.ProcessEnv,
) {
  const issuer = originFor(config),
    basePath = (config.APP_BASE_PATH || "").replace(/\/$/, ""),
    origin = new URL(config.APP_URL || "http://localhost:8791").origin;
  let cached: { until: number; enabled: boolean } | null = null;
  const googleAvailable = async () => {
    if (!issuer) return false;
    if (cached && cached.until > Date.now()) return cached.enabled;
    try {
      const r = await fetch(issuer + "/api/identity/status", {
        signal: AbortSignal.timeout(5000),
      });
      const d = await r.json();
      const enabled = r.ok && d.googleEnabled === true;
      cached = { until: Date.now() + 15000, enabled };
      return enabled;
    } catch {
      return false;
    }
  };
  app.get(
    "/api/identity/options",
    wrap(async (_req, res) =>
      res.json({
        beastypages: !!issuer,
        google: await googleAvailable(),
        pagesUrl: issuer || "https://beastypages.com",
        manageUrl: (issuer || "https://beastypages.com") + "/login",
      }),
    ),
  );
  const run = async (req: Request, res: Response, link: boolean) => {
    if (!issuer)
      fail(
        503,
        "BEASTY account sign-in is not configured yet. Use an existing Goods email account.",
        "IDENTITY_UNAVAILABLE",
      );
    if (link) {
      const userId = requireUser(res);
      if (
        (
          await pool.query(
            'SELECT 1 FROM account WHERE "userId"=$1 AND "providerId"=$2',
            [userId, "beastypages"],
          )
        ).rowCount
      )
        fail(
          409,
          "This Goods account is already connected to BEASTY Pages.",
          "ALREADY_LINKED",
        );
    }
    const body = z
      .object({
        method: z.enum(["beastypages", "google"]).default("beastypages"),
        returnTo: z
          .string()
          .max(1000)
          .default(link ? "/settings" : "/"),
      })
      .strict()
      .parse(req.body);
    if (body.method === "google" && !(await googleAvailable()))
      fail(
        503,
        "Google sign-in is not available yet. Continue with BEASTY Pages or try again shortly.",
        "GOOGLE_UNAVAILABLE",
      );
    const callbackURL = destination(body.returnTo, basePath, origin);
    const headers = fromNodeHeaders(req.headers);
    headers.set("Content-Type", "application/json");
    const forwarded = await auth.handler(
      new Request(
        origin +
          basePath +
          "/api/auth/" +
          (link ? "link-social" : "sign-in/social"),
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            provider: "beastypages",
            callbackURL,
            errorCallbackURL: origin + basePath + "/login",
            disableRedirect: true,
            ...(body.method === "google"
              ? { additionalParams: { connection: "google" } }
              : {}),
          }),
        },
      ),
    );
    for (const cookie of forwarded.headers.getSetCookie())
      res.append("Set-Cookie", cookie);
    const data = await forwarded.json();
    if (!forwarded.ok)
      return res.status(forwarded.status).json({
        error: data.message || "Unable to start BEASTY sign-in.",
        code: data.code,
      });
    return res.json(data);
  };
  app.post(
    "/api/identity/sign-in",
    wrap((req, res) => run(req, res, false)),
  );
  app.post(
    "/api/identity/link",
    wrap((req, res) => run(req, res, true)),
  );
  app.get(
    "/api/identity/linked",
    wrap(async (_req, res) => {
      const userId = requireUser(res);
      const a = (
        await pool.query(
          'SELECT a."accountId" AS member_id,s.name,s.verified_email,s.synced_at FROM account a LEFT JOIN shared_identity_profiles s ON s.user_id=a."userId" WHERE a."userId"=$1 AND a."providerId"=$2',
          [userId, "beastypages"],
        )
      ).rows[0];
      res.json({
        linked: !!a,
        provider: a ? "beastypages" : null,
        ...(a
          ? {
              memberId: a.member_id,
              identity: {
                name: a.name,
                email: a.verified_email,
                syncedAt: a.synced_at,
              },
            }
          : {}),
        pagesUrl: issuer || "https://beastypages.com",
        manageUrl: (issuer || "https://beastypages.com") + "/login",
      });
    }),
  );
}
