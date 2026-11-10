import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { api, withoutBase } from "./api";
import { ErrorBox, Spinner } from "./ui";

export interface IdentityOptions {
  beastypages: boolean;
  google: boolean;
  pagesUrl: string;
  manageUrl: string;
}
export interface LinkedIdentity {
  linked: boolean;
  provider: "beastypages" | null;
  memberId?: string;
  identity?: {
    name: string | null;
    email: string | null;
    syncedAt: string | null;
  };
  pagesUrl: string;
  manageUrl: string;
}

/** Preserve the intended Goods screen without accepting another site's URL. */
export function safeGoodsReturn(value: string | null): string {
  const path = withoutBase(value || "/");
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(path)
  )
    return "/";
  try {
    const url = new URL(path, location.origin);
    if (
      url.origin !== location.origin ||
      ["/login", "/signup", "/forgot-password", "/reset-password"].includes(
        url.pathname.replace(/\/+$/, ""),
      )
    )
      return "/";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/";
  }
}

export function identityError(search = location.search): string {
  const params = new URLSearchParams(search);
  const error = params.get("error") || params.get("identityError");
  if (!error) return "";
  if (
    ["access_denied", "cancelled", "canceled", "google_cancelled"].includes(
      error,
    )
  )
    return "Sign-in was canceled. You can try again or use another sign-in method.";
  if (
    [
      "account_not_linked",
      "email_mismatch",
      "email_does_not_match",
      "account_already_exists",
      "unable_to_link_account",
      "google_link_required",
      "google_link_signin_required",
    ].includes(error)
  )
    return "This sign-in is not connected to your Goods account. Sign in with your existing Goods email, then choose Link BEASTY Pages in Settings to keep your shelf.";
  if (
    [
      "provider_not_configured",
      "google_unavailable",
      "identity_unavailable",
    ].includes(error)
  )
    return "This sign-in method is unavailable right now. Use another method below or try again later.";
  return "We could not finish signing you in. Please try again. Existing Goods email accounts can also sign in below.";
}

export function GoogleMark() {
  return (
    <svg
      className="google-mark"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.909c1.702-1.567 2.684-3.875 2.684-6.614Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.468-.806 5.956-2.181l-2.909-2.258c-.806.54-1.837.859-3.047.859-2.344 0-4.328-1.584-5.036-3.713H.957v2.332A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A9 9 0 0 0 0 9c0 1.452.347 2.827.957 4.039l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.507.454 3.44 1.346l2.58-2.58C13.464.893 11.426 0 9 0A9 9 0 0 0 .957 4.961l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

export function navigateToIdentity(url: string) {
  if (typeof url !== "string" || !url.trim())
    throw new Error(
      "The sign-in destination could not be opened. Please try again.",
    );
  const parsed = new URL(url, location.origin);
  if (!["http:", "https:"].includes(parsed.protocol))
    throw new Error(
      "The sign-in destination could not be opened. Please try again.",
    );
  location.assign(parsed.href);
}

export function SharedSignIn({
  options,
  loading,
  setupError,
  returnTo,
  onRetry,
}: {
  options: IdentityOptions | null;
  loading: boolean;
  setupError: string;
  returnTo: string;
  onRetry: () => void;
}) {
  const [busy, setBusy] = useState<"beastypages" | "google" | null>(null);
  const [error, setError] = useState("");
  const start = async (method: "beastypages" | "google") => {
    if (busy) return;
    setBusy(method);
    setError("");
    try {
      const response = await api<{ url: string }>("/identity/sign-in", "POST", {
        method,
        returnTo,
      });
      navigateToIdentity(response.url);
    } catch (cause) {
      setError((cause as Error).message);
      setBusy(null);
    }
  };
  return (
    <section className="shared-sign-in" aria-label="BEASTY account sign-in">
      <div className="shared-account-label">
        <ShieldCheck size={16} />
        <span>BEASTY Pages + BSTY Goods</span>
      </div>
      <h2>
        One BEASTY account.
        <br />
        More good finds.
      </h2>
      <p>
        Use your BEASTY Pages account for Goods. Your shared sign-in connects
        both websites; your shelf, trades and marketplace profile stay in Goods.
      </p>
      <div className="shared-sign-in-actions">
        <button
          className="button full"
          disabled={loading || !!busy || !options?.beastypages}
          onClick={() => void start("beastypages")}
        >
          {busy === "beastypages" ? <Spinner /> : null}Continue with BEASTY
          Pages
          <ArrowRight size={17} />
        </button>
        <button
          className="button google-button full"
          disabled={loading || !!busy || !options?.google}
          onClick={() => void start("google")}
        >
          {busy === "google" ? <Spinner /> : <GoogleMark />}Continue with Google
        </button>
      </div>
      {loading ? (
        <p className="shared-sign-in-note" role="status">
          Checking sign-in options…
        </p>
      ) : setupError ? (
        <div className="shared-setup-note">
          <p>
            Shared sign-in could not be checked. You can use an existing Goods
            email account below.
          </p>
          <button className="text-button" onClick={onRetry}>
            Check again
          </button>
        </div>
      ) : !options?.beastypages ? (
        <p className="shared-sign-in-note">
          Shared sign-in is not available right now. Existing Goods email
          accounts can continue below.
        </p>
      ) : !options.google ? (
        <p className="shared-sign-in-note">
          Google sign-in is not available right now. Continue with BEASTY Pages
          to use a sign-in code.
        </p>
      ) : (
        <p className="shared-sign-in-note">
          Google and sign-in codes use the same BEASTY account.
        </p>
      )}
      {error && <ErrorBox error={error} />}
    </section>
  );
}
