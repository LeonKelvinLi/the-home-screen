import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { sharedProvider, syncSharedProfile } from "./identity.js";
import { getMigrations } from "better-auth/db/migration";
import type { Pool } from "pg";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { uuid } from "./common.js";

export function createAuth(
  pool: Pool,
  appUrl: string,
  origins: string[],
  config: NodeJS.ProcessEnv = process.env,
) {
  const secret = config.AUTH_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("AUTH_SECRET must contain at least 32 characters.");
  const production = config.NODE_ENV === "production";
  const mailMode = config.MAIL_MODE || (production ? "resend" : "spool");
  if (mailMode === "spool" && production)
    throw new Error(
      "Production requires an external reset/verification mail provider; MAIL_MODE=spool is development only.",
    );
  if (mailMode !== "spool" && mailMode !== "resend")
    throw new Error("MAIL_MODE must be spool or resend.");
  if (mailMode === "resend" && (!config.RESEND_API_KEY || !config.MAIL_FROM))
    throw new Error("Resend mail requires RESEND_API_KEY and MAIL_FROM.");
  const pending = new Set<Promise<void>>();
  const sendMail = async (to: string, subject: string, url: string) => {
    if (mailMode === "spool") {
      const directory = resolve(config.MAIL_SPOOL_DIR || "./var/mail");
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await writeFile(
        resolve(directory, `${uuid()}.json`),
        JSON.stringify({
          to,
          subject,
          url,
          text: `${subject}: ${url}`,
          createdAt: new Date().toISOString(),
        }),
        { mode: 0o600 },
      );
    } else {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.MAIL_FROM,
          to: [to],
          subject,
          text: `${subject}\n\n${url}\n\nIf you did not request this, ignore this email.`,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("Mail provider rejected the message.");
    }
  };
  // Do not expose account existence through provider response latency. No reset
  // URL, token, message body or recipient is written to application logs.
  const enqueue = (to: string, subject: string, url: string) => {
    let task: Promise<void>;
    task = sendMail(to, subject, url)
      .catch(() => {
        console.error(
          "Account email delivery failed; request a new email or check provider configuration.",
        );
      })
      .finally(() => pending.delete(task));
    pending.add(task);
  };
  const auth = betterAuth({
    appName: "BSTY Goods",
    database: pool,
    baseURL: appUrl,
    basePath: (config.APP_BASE_PATH || "") + "/api/auth",
    plugins: sharedProvider(config)
      ? [genericOAuth({ config: [sharedProvider(config)!] })]
      : [],
    account: {
      encryptOAuthTokens: true,
      accountLinking: {
        enabled: true,
        disableImplicitLinking: true,
        // Pages proves the stable member subject, even for phone-only members
        // who have no verified email. Implicit email linking remains disabled.
        trustedProviders: ["beastypages"],
        allowDifferentEmails: true,
      },
    },
    secret,
    trustedOrigins: origins,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      requireEmailVerification: production,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        enqueue(user.email, "Reset your BSTY Goods password", url);
      },
    },
    emailVerification: {
      sendOnSignUp: production,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        enqueue(user.email, "Verify your BSTY Goods email", url);
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 14,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    advanced: {
      cookiePrefix: "bsty",
      useSecureCookies: appUrl.startsWith("https:"),
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        path: config.APP_BASE_PATH || "/",
      },
      ipAddress: { disableIpTracking: true },
    },
    // A shared PostgreSQL limiter is applied before the auth handler. Better
    // Auth's in-memory limiter is also active as an additional login guard.
    rateLimit: {
      enabled: true,
      window: 60,
      max: Number(config.AUTH_RATE_LIMIT || 80),
    },
    databaseHooks: {
      account: {
        create: {
          after: async (account) => {
            if (account.providerId === "beastypages")
              await syncSharedProfile(pool, account.userId);
          },
        },
        delete: {
          after: async (account) => {
            if (account.providerId === "beastypages")
              await pool.query(
                `DELETE FROM shared_identity_profiles WHERE user_id=$1 AND member_id=$2 AND NOT EXISTS(SELECT 1 FROM account WHERE "userId"=$1 AND "providerId"='beastypages')`,
                [account.userId, account.accountId],
              );
          },
        },
      },
      session: {
        create: {
          after: async (session) => {
            await syncSharedProfile(pool, session.userId);
          },
          before: async (session) => {
            const exists = (
              await pool.query("SELECT status FROM profiles WHERE id=$1", [
                session.userId,
              ])
            ).rows[0];
            if (exists && exists.status !== "active") return false;
          },
        },
      },
    },
  });
  return {
    auth,
    flushMail: async () => {
      await Promise.allSettled([...pending]);
    },
  };
}

export async function migrate(
  pool: Pool,
  auth: ReturnType<typeof createAuth>["auth"],
) {
  const lock = await pool.connect();
  try {
    // One schema writer at a time, including concurrent local/API instances.
    await lock.query("SELECT pg_advisory_lock(946781232)");
    const authPlan = await getMigrations(auth.options);
    if (authPlan.unsafeChanges.length || authPlan.schemaProblems.length)
      throw new Error("Authentication migration requires manual review.");
    await authPlan.runMigrations();
    await lock.query("BEGIN");
    await lock.query(
      "CREATE TABLE IF NOT EXISTS goods_migrations(version integer PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())",
    );
    for (const [version, file] of [
      [1, "./schema.sql"],
      [2, "./002-listing-requests.sql"],
      [3, "./003-publication-history.sql"],
      [4, "./004-photo-thumbnails.sql"],
      [5, "./005-trade-event-order.sql"],
      [6, "./006-shared-identity.sql"],
    ] as const) {
      const current = await lock.query(
        "SELECT version FROM goods_migrations WHERE version=$1",
        [version],
      );
      if (!current.rowCount) {
        const schema = await readFile(new URL(file, import.meta.url), "utf8");
        await lock.query(schema);
        await lock.query("INSERT INTO goods_migrations(version) VALUES($1)", [
          version,
        ]);
      }
    }
    await lock.query("COMMIT");
  } catch (e) {
    await lock.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    await lock.query("SELECT pg_advisory_unlock(946781232)").catch(() => {});
    lock.release();
  }
}
