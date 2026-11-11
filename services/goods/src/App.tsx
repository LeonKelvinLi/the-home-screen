import {
  Component,
  useCallback,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  Bell,
  Compass,
  Heart,
  Home as HomeIcon,
  MessageCircle,
  Plus,
  Search,
  UserRound,
  X,
  WifiOff,
} from "lucide-react";
import {
  api,
  withBase,
  withoutBase,
  type Conversation,
  type Notice,
  type Page,
  type Profile,
} from "./api";
import { AppContext, Avatar, Empty, Link, Loading } from "./ui";
import { Home, Explore, ItemPage, SellerPage } from "./marketplace";
import { Inventory, ListingEditor } from "./inventory";
import { Trades, TradePage } from "./trades";
import { AuthPage, ProfilePage, SettingsPage } from "./account";
import { Inbox, Notifications } from "./communication";
import { Admin } from "./admin";
import { ManagedResale, ResaleQueue } from "./resale";
import { initNativeNavigation } from "./platform";

function AppRoute({ route }: { route: string }) {
  const path = route.split("?")[0].replace(/\/$/, "") || "/";
  if (path === "/") return <Home />;
  if (path === "/explore") return <Explore />;
  if (path === "/favorites") return <Explore favorites />;
  if (path.startsWith("/items/"))
    return <ItemPage id={decodeURIComponent(path.slice(7))} />;
  if (path.startsWith("/sellers/"))
    return <SellerPage id={decodeURIComponent(path.slice(9))} />;
  if (path === "/sell") return <Inventory />;
  if (path === "/sell/new") return <ListingEditor />;
  if (path.startsWith("/sell/"))
    return <ListingEditor id={decodeURIComponent(path.slice(6))} />;
  if (path === "/trades") return <Trades />;
  if (path.startsWith("/trades/"))
    return <TradePage id={decodeURIComponent(path.slice(8))} />;
  if (path === "/inbox") return <Inbox />;
  if (path.startsWith("/inbox/"))
    return <Inbox id={decodeURIComponent(path.slice(7))} />;
  if (path === "/notifications") return <Notifications />;
  if (path === "/profile") return <ProfilePage />;
  if (path === "/settings") return <SettingsPage />;
  if (path === "/admin") return <Admin />;
  if (path === "/managed-resale") return <ManagedResale />;
  if (path === "/admin/resale") return <ResaleQueue />;
  if (
    path === "/login" ||
    path === "/signup" ||
    path === "/forgot-password" ||
    path === "/reset-password"
  )
    return (
      <AuthPage
        mode={
          path === "/login"
            ? "login"
            : path === "/signup"
              ? "signup"
              : path === "/forgot-password"
                ? "forgot"
                : "reset"
        }
      />
    );
  if (path === "/about") return <About />;
  return (
    <Empty
      title="Page unavailable"
      body="Browse the marketplace or go back to your previous page."
      action={{ label: "Explore goods", to: "/explore" }}
    />
  );
}
function About() {
  return (
    <div className="about-page">
      <h1>How BSTY Goods works</h1>
      <p className="about-lead">
        List an item, browse other shelves, and offer a trade.
      </p>
      <div className="about-grid">
        <section>
          <h2>List your goods</h2>
          <p>
            Every member has 78 coded inventory positions: A–1 through Z–3. Add
            your own photos, describe the details and choose a spot.
          </p>
        </section>
        <section>
          <h2>Propose a trade</h2>
          <p>
            Open a listing and propose a trade. Choose your item and theirs,
            review both sides, then send your request. Neither item is reserved
            until the other person accepts.
          </p>
        </section>
        <section>
          <h2>Complete the exchange</h2>
          <p>
            Accepting reserves both items. Use your private conversation to
            coordinate. Both people confirm the completed exchange; cancellation
            after acceptance requires both people. Report a problem if you need
            operator review.
          </p>
        </section>
      </div>
      <section className="panel about-care">
        <h2>Trading safely</h2>
        <p>
          Use your own accurate photos, describe flaws honestly and keep
          conversations respectful. Report suspicious listings or messages using
          the controls on each item or conversation. Blocking stops new offers
          and messages while keeping existing records available.
        </p>
        <p>
          BSTY Goods currently provides item listings, trading and
          conversations. It does not collect payments, issue shipping labels or
          independently verify the physical exchange. Share only the information
          you are comfortable providing.
        </p>
        <Link className="button" to="/explore">
          Browse listings <ArrowRight size={17} />
        </Link>
      </section>
    </div>
  );
}
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Interface error", error.message, info.componentStack);
  }
  render() {
    return this.state.failed ? (
      <div className="empty">
        <h1>Let’s pick that up again.</h1>
        <p>
          This screen could not load. Your saved data is still on the server.
        </p>
        <button className="button" onClick={() => location.reload()}>
          Reload page
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [route, setRoute] = useState(
      withoutBase(location.pathname + location.search),
    ),
    [user, setUser] = useState<Profile | null>(null),
    [initializing, setInitializing] = useState(true),
    [toast, setToast] = useState(""),
    [noticeCount, setNoticeCount] = useState(0),
    [messageCount, setMessageCount] = useState(0),
    [online, setOnline] = useState(navigator.onLine),
    [expired, setExpired] = useState(false);
  const go = useCallback((path: string) => {
    if (
      !path.startsWith("/") ||
      path.startsWith("//") ||
      /[\\\u0000-\u001f\u007f]/.test(path)
    )
      return;
    const internal = withoutBase(path);
    history.pushState({}, "", withBase(internal));
    setRoute(internal.split("#")[0] || "/");
    window.scrollTo({ top: 0 });
  }, []);
  const refreshUser = useCallback(async () => {
    const d = await api<{ user: Profile | null }>("/me");
    setUser(d.user);
    setExpired(false);
  }, []);
  useEffect(() => {
    void refreshUser()
      .catch(() => {})
      .finally(() => setInitializing(false));
    const pop = () => {
      setRoute(withoutBase(location.pathname + location.search));
      window.scrollTo({ top: 0 });
    };
    const onlineChange = () => setOnline(navigator.onLine);
    const expiry = () => setExpired(true);
    const resume = () => {
      void refreshUser().catch(() => {});
    };
    window.addEventListener("popstate", pop);
    window.addEventListener("online", onlineChange);
    window.addEventListener("offline", onlineChange);
    window.addEventListener("bsty:session-expired", expiry);
    window.addEventListener("bsty:resume", resume);
    let cleanup: (() => void) | undefined;
    let disposed = false;
    void initNativeNavigation(go).then((fn) => {
      if (disposed) fn();
      else cleanup = fn;
    });
    return () => {
      disposed = true;
      cleanup?.();
      window.removeEventListener("popstate", pop);
      window.removeEventListener("online", onlineChange);
      window.removeEventListener("offline", onlineChange);
      window.removeEventListener("bsty:session-expired", expiry);
      window.removeEventListener("bsty:resume", resume);
    };
  }, [refreshUser, go]);
  useEffect(() => {
    if (!user) {
      setNoticeCount(0);
      setMessageCount(0);
      return;
    }
    let current = true;
    const poll = () => {
      if (document.visibilityState === "hidden") return;
      void Promise.all([
        api<Page<Notice>>("/notifications"),
        api<Page<Conversation>>("/conversations"),
      ])
        .then(([n, c]) => {
          if (current) {
            setNoticeCount(
              n.unreadCount ?? n.items.filter((v) => !v.readAt).length,
            );
            setMessageCount(
              c.unreadCount ??
                c.items.reduce((sum, v) => sum + v.unreadCount, 0),
            );
          }
        })
        .catch(() => {});
    };
    poll();
    const timer = setInterval(poll, 8000);
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, [user?.id, route]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const path = route.split("?")[0];
    document.title =
      (path === "/"
        ? "Secondhand marketplace"
        : path.split("/")[1].replace(/^./, (c) => c.toUpperCase())) +
      " · BSTY Goods";
  }, [route]);
  const requireUser = (
    returnTo = withoutBase(location.pathname + location.search),
  ) => {
    if (user && !expired) return true;
    go("/login?returnTo=" + encodeURIComponent(returnTo));
    return false;
  };
  const active = route.split("?")[0];
  const showSearch = ![
    "/explore",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].includes(active);
  const nav = [
    { path: "/", name: "Home", icon: HomeIcon },
    { path: "/explore", name: "Explore", icon: Compass },
    { path: "/sell", name: "Sell", icon: Plus },
    { path: "/trades", name: "Trades", icon: ArrowLeftRight },
    { path: "/profile", name: "Profile", icon: UserRound },
  ];
  return (
    <AppContext.Provider
      value={{ user, go, refreshUser, toast: setToast, requireUser }}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header
        className="site-header"
        data-market-home={active === "/" || undefined}
      >
        <div className="header-inner">
          <Link className="wordmark" to="/" aria-label="BSTY Goods home">
            <span>
              BSTY<span className="wordmark-dot">•</span>
            </span>
            <small>GOODS</small>
          </Link>
          {showSearch && <HeaderSearch key={route} go={go} />}
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.slice(1, 4).map((n) => (
              <Link
                className={
                  (n.path === "/" ? active === "/" : active.startsWith(n.path))
                    ? "selected"
                    : ""
                }
                to={n.path}
                key={n.path}
              >
                {n.name === "Sell" ? "Your shelf" : n.name}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link
              to="/favorites"
              className="icon-button favorites-entry"
              aria-label="Saved goods"
            >
              <Heart size={21} />
            </Link>
            <Link to="/inbox" className="icon-button" aria-label="Inbox">
              <MessageCircle size={21} />
              {messageCount > 0 && (
                <span className="nav-badge">
                  {messageCount > 99 ? "99+" : messageCount}
                </span>
              )}
            </Link>
            <Link
              to="/notifications"
              className="icon-button"
              aria-label="Notifications"
            >
              <Bell size={21} />
              {noticeCount > 0 && (
                <span className="nav-badge">
                  {noticeCount > 99 ? "99+" : noticeCount}
                </span>
              )}
            </Link>
            <Link
              className="button compact header-listing"
              to={user ? "/sell/new" : "/login?returnTo=%2Fsell%2Fnew"}
            >
              <Plus size={16} /> List an item
            </Link>
            {user ? (
              <Link
                to="/profile"
                className="header-profile"
                aria-label="My profile"
              >
                <Avatar profile={user} size={35} />
              </Link>
            ) : (
              <Link className="button compact header-signin" to="/login">
                Sign in <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </header>
      {!online && (
        <div className="connection-banner" role="status">
          <WifiOff size={16} /> You’re offline. Reconnect before saving changes
          or sending an offer.
        </div>
      )}
      {expired && (
        <div className="connection-banner" role="alert">
          Your session has expired.{" "}
          <Link to={"/login?returnTo=" + encodeURIComponent(route)}>
            Sign in again to continue
          </Link>
          .
        </div>
      )}
      <main
        id="main-content"
        className={
          "main-content " +
          ([
            "/login",
            "/signup",
            "/forgot-password",
            "/reset-password",
          ].includes(active)
            ? "auth-content"
            : "")
        }
      >
        {initializing ? (
          <Loading />
        ) : (
          <Boundary key={route}>
            <AppRoute route={route} />
          </Boundary>
        )}
      </main>
      <footer className="site-footer">
        <span className="footer-brand">BSTY GOODS</span>
        <Link to="/managed-resale">
          Managed resale <ArrowUpRightIcon />
        </Link>
        <Link to="/about">
          How it works <ArrowUpRightIcon />
        </Link>
      </footer>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {nav.map(({ path, name, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={
              (path === "/" ? active === "/" : active.startsWith(path))
                ? "selected"
                : ""
            }
          >
            <span className={name === "Sell" ? "sell-nav-icon" : ""}>
              <Icon size={21} strokeWidth={name === "Sell" ? 2 : 1.65} />
            </span>
            <small>{name}</small>
          </Link>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
}
function HeaderSearch({ go }: { go: (path: string) => void }) {
  const [query, setQuery] = useState(
    new URLSearchParams(location.search).get("q") || "",
  );
  return (
    <form
      className="header-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const term = query.trim();
        go(term ? "/explore?q=" + encodeURIComponent(term) : "/explore");
      }}
    >
      <input
        aria-label="Search marketplace"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search BSTY Goods"
      />
      <button aria-label="Search marketplace" type="submit">
        <Search size={19} aria-hidden="true" />
      </button>
    </form>
  );
}
function ArrowUpRightIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
