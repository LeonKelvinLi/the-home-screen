import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  LogOut,
  Settings,
  Shield,
  UserRound,
  Trash2,
  Heart,
  MessageCircle,
  ArrowLeftRight,
  Grid2X2,
} from "lucide-react";
import { api, withBase, type Photo, type Profile } from "./api";
import {
  SharedSignIn,
  identityError,
  navigateToIdentity,
  safeGoodsReturn,
  type IdentityOptions,
  type LinkedIdentity,
} from "./identity";
import {
  Avatar,
  Confirm,
  Dialog,
  Empty,
  ErrorBox,
  Link,
  Loading,
  PageTitle,
  SignedOut,
  Spinner,
  useApp,
  useResource,
} from "./ui";

export function AuthPage({
  mode,
}: {
  mode: "login" | "signup" | "forgot" | "reset";
}) {
  const { go, refreshUser } = useApp();
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false),
    [legacyOpen, setLegacyOpen] = useState(false);
  const sharedMode = mode === "login" || mode === "signup";
  const identity = useResource<IdentityOptions>(
    sharedMode ? "/identity/options" : null,
  );
  useEffect(() => {
    if (
      sharedMode &&
      !identity.loading &&
      (!identity.data?.beastypages || identity.error)
    )
      setLegacyOpen(true);
  }, [
    sharedMode,
    identity.loading,
    identity.data?.beastypages,
    identity.error,
  ]);
  const params = new URLSearchParams(location.search);
  const returnTo = safeGoodsReturn(params.get("returnTo"));
  const token = params.get("token") || "";
  const callbackError = identityError();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (sharedMode) {
        const result = await api<{ token: string | null }>(
          "/auth/" + (mode === "signup" ? "sign-up/email" : "sign-in/email"),
          "POST",
          {
            ...(mode === "signup"
              ? { name, callbackURL: location.origin + withBase(returnTo) }
              : {}),
            email,
            password,
          },
        );
        if (mode === "signup" && result.token === null) setSent(true);
        else {
          await refreshUser();
          go(returnTo);
        }
      } else if (mode === "forgot") {
        await api("/auth/request-password-reset", "POST", {
          email,
          redirectTo: location.origin + withBase("/reset-password"),
        });
        setSent(true);
      } else {
        await api("/auth/reset-password", "POST", {
          token,
          newPassword: password,
        });
        setSent(true);
      }
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-layout">
      <div className="auth-art">
        <span className="eyebrow">BSTY GOODS / A GOOD EXCHANGE</span>
        <h1>
          Your next
          <br />
          favorite
          <br />
          <span>is out there.</span>
        </h1>
        <ArrowLeftRight size={106} strokeWidth={1} />
        <span className="auth-art-foot">GOOD FINDS. BETTER TRADES.</span>
      </div>
      <section className="auth-form-wrap">
        <div className="auth-form auth-shared-form">
          <span className="eyebrow">
            {mode === "signup"
              ? "Make a little room"
              : mode === "login"
                ? "Good to see you"
                : "Back to good things"}
          </span>
          <h1>
            {mode === "signup"
              ? "Join the exchange."
              : mode === "login"
                ? "Welcome back."
                : mode === "forgot"
                  ? "Forgot your password?"
                  : "A fresh start."}
          </h1>
          {!sharedMode && (
            <p className="muted">
              {mode === "forgot"
                ? "Reset the password for an existing Goods email account. Shared BEASTY accounts are managed on BEASTY Pages."
                : "Choose a new password for your Goods email account."}
            </p>
          )}
          {callbackError && <ErrorBox error={callbackError} />}
          {sent ? (
            <div className="auth-success">
              <Check size={28} />
              <h2>
                {mode === "signup"
                  ? "Check your email."
                  : mode === "forgot"
                    ? "Request received."
                    : "Password updated."}
              </h2>
              <p>
                {mode === "signup"
                  ? "Your Goods email account was created. Open the verification link sent to your email address before signing in. You can connect BEASTY Pages later in Settings."
                  : mode === "forgot"
                    ? "If an eligible account exists and email delivery is configured, a reset link will be sent to that address. Check your inbox."
                    : "You can now sign in with your new password."}
              </p>
              <Link className="button full" to="/login">
                Back to sign in <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <>
              {sharedMode && (
                <>
                  <SharedSignIn
                    options={identity.data}
                    loading={identity.loading}
                    setupError={identity.error}
                    returnTo={returnTo}
                    onRetry={identity.reload}
                  />
                  <button
                    className="legacy-toggle text-button"
                    aria-expanded={legacyOpen}
                    aria-controls="goods-email-form"
                    onClick={() => setLegacyOpen((v) => !v)}
                  >
                    {legacyOpen
                      ? "Hide Goods email sign-in"
                      : "Use an existing Goods email account"}
                    <ArrowRight size={15} />
                  </button>
                </>
              )}
              {(!sharedMode || legacyOpen) && (
                <section
                  id="goods-email-form"
                  className={sharedMode ? "legacy-email-panel" : ""}
                >
                  {sharedMode && (
                    <>
                      <h2>
                        {mode === "signup"
                          ? "Create a separate Goods email account"
                          : "Goods email sign-in"}
                      </h2>
                      <p className="muted small-copy">
                        {mode === "signup"
                          ? "For a shared account across both websites, use BEASTY Pages above. This email account starts in Goods and can be connected later."
                          : "Already had a Goods email account? Sign in here first, then link BEASTY Pages in Settings to keep your inventory and trade history."}
                      </p>
                    </>
                  )}
                  {mode === "reset" && !token ? (
                    <ErrorBox error="This reset link is missing its token. Request a new link from Forgot password." />
                  ) : (
                    <form className="form" onSubmit={submit}>
                      {mode === "signup" && (
                        <label>
                          Display name
                          <input
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={2}
                            maxLength={60}
                            placeholder="What should we call you?"
                          />
                        </label>
                      )}
                      {mode !== "reset" && (
                        <label>
                          Email address
                          <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                          />
                        </label>
                      )}
                      {mode !== "forgot" && (
                        <label>
                          {mode === "reset" ? "New password" : "Password"}
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={
                              mode === "login"
                                ? "current-password"
                                : "new-password"
                            }
                            minLength={mode === "login" ? 1 : 12}
                            maxLength={128}
                            required
                          />
                          {mode !== "login" && (
                            <small>Use at least 12 characters.</small>
                          )}
                        </label>
                      )}
                      {error && <ErrorBox error={error} />}
                      <button className="button full" disabled={busy}>
                        {busy ? <Spinner /> : null}
                        {mode === "signup"
                          ? "Create account"
                          : mode === "login"
                            ? "Sign in"
                            : mode === "forgot"
                              ? "Request reset link"
                              : "Update password"}
                        {!busy && <ArrowRight size={17} />}
                      </button>
                      {mode === "login" && (
                        <Link
                          className="text-button full"
                          to="/forgot-password"
                        >
                          Forgot password?
                        </Link>
                      )}
                    </form>
                  )}
                  {sharedMode && (
                    <p className="auth-switch">
                      {mode === "login"
                        ? "Need a Goods email account?"
                        : "Already have a Goods email account?"}{" "}
                      <Link
                        to={
                          (mode === "login" ? "/signup" : "/login") +
                          "?returnTo=" +
                          encodeURIComponent(returnTo)
                        }
                      >
                        {mode === "login" ? "Create one" : "Sign in"}
                      </Link>
                    </p>
                  )}
                </section>
              )}
            </>
          )}
          <Link className="text-button subtle" to="/explore">
            Keep exploring <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export function ProfilePage() {
  const { user, refreshUser, go, toast } = useApp();
  const [logout, setLogout] = useState(false);
  const signOut = async () => {
    setLogout(true);
    try {
      await api("/auth/sign-out", "POST", {});
      for (const key of Object.keys(sessionStorage))
        if (key.startsWith("bsty-draft:")) sessionStorage.removeItem(key);
      await refreshUser();
      go("/");
      toast("You’re signed out.");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setLogout(false);
    }
  };
  if (!user) return <SignedOut what="make your shelf your own" />;
  return (
    <>
      <PageTitle
        eyebrow="Your corner of the community"
        title={"Hey, " + (user.name.split(" ")[0] || "there") + "."}
      />
      <section className="my-profile panel">
        <Avatar profile={user} size={88} />
        <div>
          <h2>{user.name}</h2>
          <p className="muted">@{user.username}</p>
          <p>
            {user.bio || "Your shelf is a little piece of you. Make it yours."}
          </p>
          <span className="small-copy muted">
            {user.completedTrades || 0} completed trades · Member since{" "}
            {new Date(user.createdAt).toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <Link className="button secondary" to="/settings">
          <Settings size={17} /> Edit profile
        </Link>
      </section>
      <div className="profile-destinations">
        {[
          {
            to: "/sell",
            title: "Your shelf",
            body: "78 positions for your good stuff",
            icon: Grid2X2,
          },
          {
            to: "/favorites",
            title: "Saved goods",
            body: "The finds you want to come back to",
            icon: Heart,
          },
          {
            to: "/trades",
            title: "Your exchanges",
            body: "Offers, reservations and history",
            icon: ArrowLeftRight,
          },
          {
            to: "/inbox",
            title: "Your conversations",
            body: "Keep every exchange connected",
            icon: MessageCircle,
          },
          {
            to: "/sellers/" + user.id,
            title: "Public storefront",
            body: "See your shelf as the community does",
            icon: UserRound,
          },
          {
            to: "/settings",
            title: "Account settings",
            body: "Profile, privacy and account controls",
            icon: Settings,
          },
        ].map(({ to, title, body, icon: Icon }) => (
          <Link to={to} className="profile-destination" key={to}>
            <Icon size={24} strokeWidth={1.4} />
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
            <ArrowRight size={19} />
          </Link>
        ))}
      </div>
      {user.role === "admin" && (
        <Link className="button secondary" to="/admin">
          <Shield size={17} /> Operator workspace
        </Link>
      )}
      <button
        className="text-button logout"
        onClick={signOut}
        disabled={logout}
      >
        <LogOut size={17} />
        {logout ? "Signing out…" : "Sign out of Goods"}
      </button>
    </>
  );
}

export function SettingsPage() {
  const { user, refreshUser, toast, go } = useApp();
  const [name, setName] = useState(user?.name || ""),
    [username, setUsername] = useState(user?.username || ""),
    [bio, setBio] = useState(user?.bio || ""),
    [locationName, setLocation] = useState(user?.location || ""),
    [photo, setPhoto] = useState<Photo | null>(null),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(""),
    [deleting, setDeleting] = useState(false),
    [confirmation, setConfirmation] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const initializedUserId = useRef(user?.id);
  const identity = useResource<LinkedIdentity>(
    user ? "/identity/linked" : null,
  );
  const options = useResource<IdentityOptions>(
    user ? "/identity/options" : null,
  );
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState("");
  const linked = identity.data?.linked === true;
  const {
    data: blocks,
    reload: reloadBlocks,
    error: blockError,
  } = useResource<{ items: Profile[] }>(user ? "/blocks" : null);
  useEffect(() => {
    if (user && initializedUserId.current !== user.id) {
      initializedUserId.current = user.id;
      setName(user.name);
      setUsername(user.username);
      setBio(user.bio || "");
      setLocation(user.location || "");
      setPhoto(null);
      setError("");
    }
  }, [user?.id]);
  if (!user) return <SignedOut what="manage your account" />;
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/me", "PATCH", {
        ...(!linked && !identity.loading && !identity.error ? { name } : {}),
        username,
        bio,
        location: locationName,
        ...(photo ? { avatarPhotoId: photo.id } : {}),
      });
      await refreshUser();
      toast("Profile updated.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const avatar = async (f: File) => {
    setUploading(true);
    setError("");
    try {
      if (f.size > 10 * 1024 * 1024)
        throw new Error("Choose a profile photo smaller than 10 MB.");
      const body = new FormData();
      body.append("file", f);
      const d = await api<{ photo: Photo }>("/uploads", "POST", body);
      setPhoto(d.photo);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      await api("/me", "DELETE", { confirmation });
      await refreshUser();
      go("/");
      toast("Your account has been disabled.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const unblock = async (id: string) => {
    try {
      await api("/blocks", "POST", { userId: id, blocked: false });
      reloadBlocks();
      toast("User unblocked.");
    } catch (e) {
      toast((e as Error).message);
    }
  };
  const connect = async () => {
    setLinking(true);
    setLinkError("");
    try {
      const response = await api<{ url: string }>("/identity/link", "POST", {
        returnTo: "/settings",
      });
      navigateToIdentity(response.url);
    } catch (cause) {
      setLinkError((cause as Error).message);
      setLinking(false);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="Make it yours"
        title="Account settings."
        back="/profile"
      />
      <div className="settings-layout">
        <form className="panel form" onSubmit={save}>
          <h2>Your public profile</h2>
          <div className="avatar-editor">
            <Avatar
              profile={{ ...user, avatarUrl: photo?.url || user.avatarUrl }}
              size={80}
            />
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                ref={file}
                className="file-input"
                aria-label="Profile photograph"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void avatar(f);
                }}
              />
              <button
                className="button secondary compact"
                type="button"
                disabled={uploading}
                onClick={() => file.current?.click()}
              >
                {uploading ? <Spinner /> : <Camera size={16} />} Change photo
              </button>
              <small>Save your profile to apply this photo.</small>
            </div>
          </div>
          <label>
            Display name
            <input
              maxLength={60}
              minLength={2}
              required
              value={linked ? user.name : name}
              readOnly={linked || identity.loading || !!identity.error}
              onChange={(e) => setName(e.target.value)}
            />
            {linked && (
              <small>
                Your name is synced from BEASTY Pages when you sign in. Manage
                your shared identity there.
              </small>
            )}
          </label>
          <label>
            Username
            <input
              maxLength={30}
              minLength={3}
              pattern="[A-Za-z0-9_]+"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <small>
              Letters, numbers and underscores. Visible on your storefront.
            </small>
          </label>
          <label>
            Bio
            <textarea
              rows={4}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words about you and your collection."
            />
          </label>
          <label>
            City or region
            <input
              maxLength={100}
              value={locationName}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Oakland, CA"
            />
            <small>
              Share a general area. Keep your exact address private.
            </small>
          </label>
          {error && !deleting && <ErrorBox error={error} />}
          <button className="button" disabled={busy || uploading}>
            {busy ? <Spinner /> : <Check size={17} />} Save profile
          </button>
        </form>
        <aside className="settings-aside">
          <section className="panel">
            <h3>
              {linked
                ? "Your shared BEASTY account"
                : "Connect your BEASTY account"}
            </h3>
            {identity.loading ? (
              <Loading />
            ) : identity.error ? (
              <ErrorBox error={identity.error} retry={identity.reload} />
            ) : linked ? (
              <>
                <span className="shared-connected">
                  <Check size={15} /> BEASTY Pages connected
                </span>
                <p className="muted small-copy">
                  Your name and sign-in are managed by BEASTY Pages. Your Goods
                  username, bio, photos, inventory and trades stay in Goods.
                </p>
                {identity.data?.identity?.email && (
                  <p className="shared-account-email">
                    <span>Shared email</span>
                    <strong>{identity.data.identity.email}</strong>
                  </p>
                )}
                <a
                  className="text-button"
                  href={identity.data?.manageUrl || options.data?.manageUrl}
                >
                  Manage BEASTY account <ArrowRight size={15} />
                </a>
              </>
            ) : (
              <>
                <p className="muted small-copy">
                  Already use BEASTY Pages? Link it to this signed-in Goods
                  account to keep your shelf and trade history. You’ll confirm
                  your BEASTY account before the connection is saved.
                </p>
                <button
                  className="button full"
                  type="button"
                  disabled={linking || !options.data?.beastypages}
                  onClick={() => void connect()}
                >
                  {linking ? <Spinner /> : null}Link BEASTY Pages{" "}
                  <ArrowRight size={16} />
                </button>
                {!options.loading && !options.data?.beastypages && (
                  <p className="small-copy muted">
                    Shared account linking is unavailable right now. Your
                    existing Goods sign-in still works.
                  </p>
                )}
              </>
            )}
            {linkError && <ErrorBox error={linkError} />}
            {identityError() && <ErrorBox error={identityError()} />}
          </section>
          {!linked && (
            <section className="panel">
              <h3>Goods email sign-in</h3>
              <p className="muted">
                {user.email?.endsWith("@members.beasty.invalid")
                  ? "Email managed by BEASTY Pages"
                  : user.email}
              </p>
              <Link className="text-button" to="/forgot-password">
                Reset Goods password <ArrowRight size={15} />
              </Link>
            </section>
          )}
          <section className="panel">
            <h3>Blocked accounts</h3>
            <p className="muted small-copy">
              Blocked accounts cannot start new trades or send you messages.
              Existing exchange records remain.
            </p>
            {blockError && <ErrorBox error={blockError} />}
            {blocks?.items.length ? (
              blocks.items.map((p) => (
                <div className="block-row" key={p.id}>
                  <Avatar profile={p} size={30} />
                  <span>{p.name}</span>
                  <button className="text-button" onClick={() => unblock(p.id)}>
                    Unblock
                  </button>
                </div>
              ))
            ) : (
              <span className="muted small-copy">
                You haven’t blocked anyone.
              </span>
            )}
          </section>
          <section className="panel deletion-panel">
            <h3>Delete Goods account</h3>
            <p className="muted small-copy">
              Disable your account and withdraw pending offers. Resolve accepted
              or disputed trades first. Exchange and moderation records are
              retained for support; this action does not erase other
              participants’ history.
              {linked &&
                " Your BEASTY Pages account is managed separately and will not be deleted here."}
            </p>
            <button
              className="text-button danger"
              onClick={() => {
                setDeleting(true);
                setError("");
              }}
            >
              <Trash2 size={16} /> Delete my Goods account
            </button>
          </section>
        </aside>
      </div>
      {deleting && (
        <Dialog
          title="Delete your Goods account?"
          onClose={() => {
            if (!busy) setDeleting(false);
          }}
        >
          <p className="muted">
            You will lose access to your shelf and conversations. Unresolved
            accepted trades must be resolved before deletion. Type DELETE to
            continue.
            {linked && " This does not delete your BEASTY Pages account."}
          </p>
          <label>
            Confirmation
            <input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
              placeholder="DELETE"
            />
          </label>
          {error && <ErrorBox error={error} />}
          <div className="actions end">
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => setDeleting(false)}
            >
              Keep my account
            </button>
            <button
              className="button danger-button"
              disabled={busy || confirmation !== "DELETE"}
              onClick={remove}
            >
              {busy ? <Spinner /> : "Delete account"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
