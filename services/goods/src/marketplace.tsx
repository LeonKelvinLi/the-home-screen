import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ArrowLeftRight,
  Search,
  SlidersHorizontal,
  X,
  Heart,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Grid2X2,
  MapPin,
} from "lucide-react";
import {
  api,
  conditions,
  money,
  recentlyViewedIds,
  listingPhotoUrl,
  recordViewed,
  clearRecentlyViewed,
  type Listing,
  type Page,
  type Profile,
} from "./api";
import {
  Avatar,
  Dialog,
  DemoBadge,
  DemoCatalogNotice,
  Empty,
  ErrorBox,
  Link,
  Loading,
  PageTitle,
  Photo,
  ProductGrid,
  ReportButton,
  Seller,
  SignedOut,
  Spinner,
  Status,
  useApp,
  useResource,
} from "./ui";
import { TradeComposer } from "./trades";
import { shareUrl } from "./platform";

export function Home() {
  const { user } = useApp();
  const { data, error, loading, reload } = useResource<Page<Listing>>(
    "/listings?sort=newest&limit=12",
  );
  const { data: categories } = useResource<{ items: string[] }>("/categories");
  const saved = useResource<Page<Listing>>(user ? "/favorites?limit=4" : null);
  const category = saved.data?.items.find(
    (item) => item.status === "active" && item.category,
  )?.category;
  const related = useResource<Page<Listing>>(
    category
      ? "/listings?category=" + encodeURIComponent(category) + "&limit=8"
      : null,
  );
  const [recent, setRecent] = useState<Listing[]>([]);
  const [recentError, setRecentError] = useState("");
  const [recentVersion, setRecentVersion] = useState(0);
  useEffect(() => {
    let current = true;
    setRecent([]);
    setRecentError("");
    const ids = recentlyViewedIds(user?.id).slice(0, 8);
    if (!ids.length) return;
    void Promise.allSettled(
      ids.map((id) =>
        api<{ listing: Listing }>("/listings/" + encodeURIComponent(id)),
      ),
    ).then((results) => {
      if (!current) return;
      setRecent(
        results.flatMap((result) =>
          result.status === "fulfilled" &&
          result.value.listing.status === "active" &&
          !result.value.listing.isHidden
            ? [result.value.listing]
            : [],
        ),
      );
      if (
        results.some(
          (result) =>
            result.status === "rejected" &&
            ![403, 404].includes(result.reason?.status),
        )
      )
        setRecentError(
          "Your recent finds could not all be refreshed. Please try again.",
        );
    });
    return () => {
      current = false;
    };
  }, [user?.id, recentVersion]);
  const sellers = [
    ...new Map(
      (data?.items || []).map((item) => [item.owner.id, item.owner]),
    ).values(),
  ].slice(0, 4);
  const relatedItems =
    related.data?.items
      .filter(
        (item) =>
          item.status === "active" &&
          !saved.data?.items.some((savedItem) => savedItem.id === item.id),
      )
      .slice(0, 4) || [];
  const featured = [
    data?.items.find(
      (item) => item.category === "Electronics" && item.photos.length,
    ),
    data?.items.find(
      (item) => item.category === "Collectibles" && item.photos.length,
    ),
  ].filter((item): item is Listing => Boolean(item));
  return (
    <div className="market-home">
      <section className="market-masthead" aria-labelledby="market-title">
        <div className="market-intro">
          <h1 id="market-title">The swap meet.</h1>
          <p>Browse secondhand goods. List yours or make a trade.</p>
          <Link to="/explore?tradeOnly=true" className="market-trade-link">
            <ArrowLeftRight size={17} /> Browse tradeable items{" "}
            <ArrowUpRight size={15} />
          </Link>
        </div>
        {featured.length > 0 && (
          <div className="market-featured" aria-label="Featured listings">
            {featured.map((item) => (
              <Link
                className="market-feature"
                key={item.id}
                to={"/items/" + item.id}
              >
                <Photo listing={item} />
                <span>
                  <span>{item.title}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
                {(item.isDemo || item.owner.isDemo) && <DemoBadge />}
              </Link>
            ))}
          </div>
        )}
      </section>
      <nav className="market-categories" aria-label="Shop by category">
        <Link className="market-all" to="/explore">
          <Grid2X2 size={16} /> All goods
        </Link>
        {categories?.items.map((name) => (
          <Link key={name} to={"/explore?category=" + encodeURIComponent(name)}>
            {name}
          </Link>
        ))}
      </nav>
      <section
        className="section market-feed"
        aria-labelledby="new-listings-title"
      >
        <div className="section-heading">
          <h2 id="new-listings-title">New listings</h2>
          <Link className="text-button" to="/explore">
            Browse all <ArrowRight size={18} />
          </Link>
        </div>
        {data?.items.some((item) => item.isDemo || item.owner.isDemo) && (
          <DemoCatalogNotice />
        )}
        {loading ? (
          <Loading cards />
        ) : error ? (
          <ErrorBox error={error} retry={reload} />
        ) : data?.items.length ? (
          <ProductGrid items={data.items} />
        ) : (
          <Empty
            title="No listings yet"
            body="List an item to start the marketplace."
            action={{ label: "List an item", to: "/sell/new" }}
          />
        )}
      </section>
      {sellers.length > 0 && (
        <section className="section seller-discovery-section">
          <div className="section-heading">
            <div>
              <h2>
                {sellers.every((seller) => seller.isDemo)
                  ? "Sample storefronts"
                  : "Browse sellers"}
              </h2>
            </div>
          </div>
          <div className="seller-discovery-grid">
            {sellers.map((seller) => (
              <Link
                to={"/sellers/" + seller.id}
                className="seller-discovery-card"
                key={seller.id}
              >
                <Avatar profile={seller} size={47} />
                <div>
                  <strong>{seller.name}</strong>
                  <span>@{seller.username}</span>
                  {seller.isDemo && <DemoBadge />}
                  <small>{seller.location || "Newly listed goods"}</small>
                </div>
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </div>
        </section>
      )}
      {user && (saved.error || !!saved.data?.items.length) && (
        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Saved goods</h2>
            </div>
            <Link className="text-button" to="/favorites">
              View saved <ArrowRight size={17} />
            </Link>
          </div>
          {saved.error ? (
            <ErrorBox error={saved.error} retry={saved.reload} />
          ) : (
            <ProductGrid
              items={saved.data?.items || []}
              onSaved={saved.reload}
            />
          )}
        </section>
      )}
      {category && (related.error || relatedItems.length > 0) && (
        <section className="section">
          <div className="section-heading">
            <div>
              <h2>More in {category}</h2>
            </div>
            <Link
              className="text-button"
              to={"/explore?category=" + encodeURIComponent(category)}
            >
              Explore <ArrowRight size={17} />
            </Link>
          </div>
          {related.error ? (
            <ErrorBox error={related.error} retry={related.reload} />
          ) : (
            <ProductGrid items={relatedItems} onSaved={saved.reload} />
          )}
        </section>
      )}
      {(recentError || recent.length > 0) && (
        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Recently viewed</h2>
            </div>
            <button
              className="text-button subtle"
              onClick={() => {
                clearRecentlyViewed(user?.id);
                setRecent([]);
                setRecentError("");
              }}
            >
              Clear history
            </button>
          </div>
          {recentError && (
            <ErrorBox
              error={recentError}
              retry={() => setRecentVersion((v) => v + 1)}
            />
          )}
          <ProductGrid items={recent.slice(0, 4)} />
        </section>
      )}
    </div>
  );
}

export function Explore({ favorites = false }: { favorites?: boolean }) {
  const { user, go } = useApp();
  const search = new URLSearchParams(location.search);
  const [q, setQ] = useState(search.get("q") || "");
  const [category, setCategory] = useState(search.get("category") || "");
  const [condition, setCondition] = useState(search.get("condition") || "");
  const [tradeOnly, setTradeOnly] = useState(
    search.get("tradeOnly") === "true",
  );
  const [min, setMin] = useState(
    search.get("minPrice") ? String(Number(search.get("minPrice")) / 100) : "",
  );
  const [max, setMax] = useState(
    search.get("maxPrice") ? String(Number(search.get("maxPrice")) / 100) : "",
  );
  const [sort, setSort] = useState(search.get("sort") || "newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [items, setItems] = useState<Listing[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [more, setMore] = useState(false),
    [version, setVersion] = useState(0);
  const { data: categories } = useResource<{ items: string[] }>("/categories");
  const params = new URLSearchParams(location.search);
  params.set("limit", "24");
  const path = favorites ? "/favorites?limit=24" : "/listings?" + params;
  useEffect(() => {
    let current = true;
    if (favorites && !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    api<Page<Listing>>(path)
      .then((d) => {
        if (current) {
          setItems(d.items);
          setNext(d.nextCursor);
        }
      })
      .catch((e) => {
        if (current) setError(e.message);
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [path, user?.id, version]);
  const apply = (e?: FormEvent) => {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (condition) p.set("condition", condition);
    if (tradeOnly) p.set("tradeOnly", "true");
    if (min) p.set("minPrice", String(Math.round(Number(min) * 100)));
    if (max) p.set("maxPrice", String(Math.round(Number(max) * 100)));
    p.set("sort", sort);
    setFilterOpen(false);
    go("/explore?" + p);
  };
  const loadMore = async () => {
    if (!next) return;
    setMore(true);
    try {
      const separator = path.includes("?") ? "&" : "?";
      const d = await api<Page<Listing>>(
        path + separator + "cursor=" + encodeURIComponent(next),
      );
      setItems((v) => [
        ...v,
        ...d.items.filter((i) => !v.some((old) => old.id === i.id)),
      ]);
      setNext(d.nextCursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setMore(false);
    }
  };
  const reset = () => {
    setQ("");
    setCategory("");
    setCondition("");
    setTradeOnly(false);
    setMin("");
    setMax("");
    setSort("newest");
    go("/explore");
  };
  if (favorites && !user) return <SignedOut what="save your favorite finds" />;
  const fields = (
    <>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories?.items.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Condition
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="">Any condition</option>
          {conditions.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <div className="field-row">
        <label>
          Min price ($)
          <input
            type="number"
            min="0"
            step="0.01"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="0"
          />
        </label>
        <label>
          Max price ($)
          <input
            type="number"
            min="0"
            step="0.01"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Any"
          />
        </label>
      </div>
      <label>
        Sort by
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Recently listed</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={tradeOnly}
          onChange={(e) => setTradeOnly(e.target.checked)}
        />{" "}
        Open to trade
      </label>
      <button className="button full" type="submit">
        Show results <ArrowRight size={16} />
      </button>
      <button className="text-button full" type="button" onClick={reset}>
        Reset filters
      </button>
    </>
  );
  return (
    <>
      <PageTitle title={favorites ? "Saved goods" : "Browse the market"}>
        {!favorites && (
          <button
            className="button secondary mobile-filter"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal size={17} /> Filters
          </button>
        )}
      </PageTitle>
      <div className={favorites ? "" : "explore-layout"}>
        {!favorites && (
          <form className="filters" onSubmit={apply}>
            <div className="filter-heading">
              <SlidersHorizontal size={17} />
              <strong>Filter listings</strong>
            </div>
            {fields}
          </form>
        )}
        <section className="explore-results">
          {!favorites && (
            <form className="search-bar" onSubmit={apply}>
              <Search size={19} />
              <input
                aria-label="Search listings"
                placeholder="Search listings"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Clear search"
                  onClick={() => setQ("")}
                >
                  <X size={17} />
                </button>
              )}
              <button className="button compact" type="submit">
                Search
              </button>
            </form>
          )}
          {loading ? (
            <Loading cards />
          ) : (
            <>
              {error && (
                <ErrorBox
                  error={error}
                  retry={() => setVersion((v) => v + 1)}
                />
              )}
              <p className="result-summary">
                {items.length} {items.length === 1 ? "find" : "finds"}
                {next ? " and more" : ""}
                {search.get("q") ? " for “" + search.get("q") + "”" : ""}
              </p>
              {items.some((item) => item.isDemo || item.owner.isDemo) && (
                <DemoCatalogNotice />
              )}
              {items.length ? (
                <ProductGrid
                  items={items}
                  onSaved={
                    favorites ? () => setVersion((v) => v + 1) : undefined
                  }
                />
              ) : (
                <Empty
                  title={
                    favorites ? "Keep a good find." : "Nothing here just yet."
                  }
                  body={
                    favorites
                      ? "Tap the heart on any item to find it here later."
                      : "Try another search or reset your filters."
                  }
                  action={
                    favorites
                      ? { label: "Explore goods", to: "/explore" }
                      : undefined
                  }
                >
                  {!favorites && (
                    <button className="button secondary" onClick={reset}>
                      Reset filters
                    </button>
                  )}
                </Empty>
              )}
              {next && (
                <div className="load-more">
                  <button
                    className="button secondary"
                    disabled={more}
                    onClick={loadMore}
                  >
                    {more ? <Spinner /> : <ArrowDown size={17} />} Load more
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      {filterOpen && (
        <Dialog title="Find your thing" onClose={() => setFilterOpen(false)}>
          <form className="form" onSubmit={apply}>
            {fields}
          </form>
        </Dialog>
      )}
    </>
  );
}

export function ItemPage({ id }: { id: string }) {
  const { user, requireUser, go, toast } = useApp();
  const { data, error, loading, reload } = useResource<{ listing: Listing }>(
    "/listings/" + id,
  );
  const [index, setIndex] = useState(0),
    [fullscreen, setFullscreen] = useState(false),
    [trade, setTrade] = useState(false),
    [busy, setBusy] = useState(false);
  const l = data?.listing;
  useEffect(() => {
    if (l && ["active", "reserved"].includes(l.status) && !l.isHidden)
      recordViewed(l.id, user?.id);
  }, [l?.id, user?.id]);
  useEffect(() => setIndex(0), [id]);
  const message = async () => {
    if (!l || l.isDemo || l.owner.isDemo || !requireUser()) return;
    setBusy(true);
    try {
      const d = await api<{ conversation: { id: string } }>(
        "/conversations",
        "POST",
        { sellerId: l.owner.id, listingId: l.id },
      );
      go("/inbox/" + d.conversation.id);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const share = async () => {
    try {
      const result = await shareUrl(location.href, l?.title || "BSTY Goods");
      if (result === "copied") toast("Listing link copied.");
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        toast("Copy this page address to share the item.");
    }
  };
  const save = async () => {
    if (!l || !requireUser()) return;
    try {
      await api("/favorites/" + id, "PUT", { saved: !l.isFavorite });
      reload();
    } catch (e) {
      toast((e as Error).message);
    }
  };
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  if (!l) return null;
  const owned = user?.id === l.owner.id;
  const demo = l.isDemo || l.owner.isDemo;
  let touchStart: { x: number; y: number } | null = null;
  const gallery = (
    <div
      className={"gallery " + (fullscreen ? "gallery-fullscreen" : "")}
      onTouchStart={(e) => {
        touchStart =
          e.touches.length === 1
            ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
            : null;
      }}
      onTouchEnd={(e) => {
        if (!touchStart || e.touches.length > 0) return;
        const delta = e.changedTouches[0].clientX - touchStart.x;
        const vertical = e.changedTouches[0].clientY - touchStart.y;
        if (Math.abs(delta) > 45 && Math.abs(delta) > Math.abs(vertical))
          setIndex((i) =>
            Math.max(
              0,
              Math.min(l.photos.length - 1, i + (delta < 0 ? 1 : -1)),
            ),
          );
      }}
    >
      {l.photos[index] ? (
        <img
          className="gallery-main"
          src={listingPhotoUrl(l, l.photos[index])}
          alt={l.title + " — photo " + (index + 1)}
          onClick={() => !fullscreen && setFullscreen(true)}
        />
      ) : (
        <Photo listing={l} />
      )}
      {demo && <DemoBadge />}
      <span className="gallery-counter">
        {l.photos.length ? index + 1 : 0} / {l.photos.length}
      </span>
      {!fullscreen && (
        <button
          className="gallery-expand icon-button"
          onClick={() => setFullscreen(true)}
          aria-label="View full size photos"
        >
          <Maximize2 size={18} />
        </button>
      )}
      {index > 0 && (
        <button
          className="gallery-prev icon-button"
          aria-label="Previous photo"
          onClick={() => setIndex((i) => i - 1)}
        >
          <ChevronLeft />
        </button>
      )}
      {index < l.photos.length - 1 && (
        <button
          className="gallery-next icon-button"
          aria-label="Next photo"
          onClick={() => setIndex((i) => i + 1)}
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
  return (
    <>
      <div className="item-topline">
        <Link className="back-link" to="/explore">
          <ChevronLeft size={18} /> Marketplace
        </Link>
        <div className="actions">
          <button className="text-button" onClick={share}>
            <Share2 size={17} /> Share
          </button>
          <button className="text-button" onClick={save}>
            <Heart size={17} fill={l.isFavorite ? "currentColor" : "none"} />
            {l.isFavorite ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      <div className="item-layout">
        <div className="item-visual">
          {gallery}
          {l.photos.length > 1 && (
            <div className="gallery-thumbs">
              {l.photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setIndex(i)}
                  className={i === index ? "selected" : ""}
                  aria-label={"View photo " + (i + 1)}
                >
                  <img src={listingPhotoUrl(l, p, true)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <section className="item-info">
          <div className="item-kicker">
            <span className="code-pill">{l.code}</span>
            {demo ? <DemoBadge /> : <Status value={l.status} />}
          </div>
          <h1>{l.title || "Untitled draft"}</h1>
          <p className="item-subtitle">
            {l.category} <span>·</span> {l.condition}
          </p>
          <div className="item-price">
            {demo && l.priceCents === null
              ? "Sample item"
              : money(l.priceCents)}
          </div>
          {l.priceCents !== null && (
            <p className="muted small-copy">
              {demo
                ? "Example value for this sample item."
                : "Listed value · Contact the seller to discuss this item."}
            </p>
          )}
          {demo && (
            <div className="demo-item-notice">
              <strong>Sample listing</strong>
              <p>
                This illustrated item and its seller are part of the demo
                catalog. You can browse and save it. Trades and messages are
                available for real community listings.
              </p>
            </div>
          )}
          {l.tradeEnabled && !demo && (
            <div className="trade-callout">
              <ArrowLeftRight size={19} />
              <div>
                <strong>Open to trade</strong>
                <p>Offer an item from your shelf to start a trade.</p>
              </div>
            </div>
          )}
          <Seller profile={l.owner} />
          <div className="item-actions">
            {demo ? (
              <>
                <Link
                  className="button full"
                  to={user ? "/sell/new" : "/signup?returnTo=%2Fsell%2Fnew"}
                >
                  {user
                    ? "List your own item"
                    : "Join BEASTY and list your own"}
                  <ArrowRight size={18} />
                </Link>
                <Link className="button secondary full" to="/explore">
                  Keep exploring
                </Link>
              </>
            ) : owned ? (
              <Link className="button full" to={"/sell/" + l.id}>
                Manage this listing
              </Link>
            ) : (
              <>
                {l.tradeEnabled && (
                  <button
                    className="button full"
                    disabled={l.status !== "active"}
                    onClick={() => {
                      if (requireUser()) setTrade(true);
                    }}
                  >
                    <ArrowLeftRight size={19} />
                    {l.status === "active"
                      ? "Propose a trade"
                      : "Item " + l.status}
                  </button>
                )}
                <button
                  className="button secondary full"
                  disabled={
                    busy || l.status === "hidden" || l.status === "draft"
                  }
                  onClick={message}
                >
                  {busy ? <Spinner /> : <MessageCircle size={19} />} Message
                  seller
                </button>
              </>
            )}
          </div>
          <div className="item-detail-block">
            <h3>Description</h3>
            <p className="preserve-lines">{l.description}</p>
          </div>
          {l.tradePreferences && (
            <div className="item-detail-block">
              <h3>
                {demo ? "Example trade preferences" : "Open to trading for"}
              </h3>
              <p>{l.tradePreferences}</p>
            </div>
          )}
          <div className="item-detail-block item-facts">
            <div>
              <span>Inventory position</span>
              <strong>{l.code}</strong>
            </div>
            <div>
              <span>Condition</span>
              <strong>{l.condition}</strong>
            </div>
            <div>
              <span>{demo ? "Added to demo catalog" : "Listed"}</span>
              <strong>{new Date(l.createdAt).toLocaleDateString()}</strong>
            </div>
            <div>
              <span>Item reference</span>
              <small className="monospace">{l.id.slice(0, 12)}</small>
            </div>
          </div>
          {!demo && <ReportButton targetType="listing" targetId={l.id} />}
        </section>
      </div>
      {fullscreen && (
        <Dialog
          title="Listing photos"
          onClose={() => setFullscreen(false)}
          wide
        >
          {gallery}
          <p className="muted small-copy">
            Pinch to zoom on supported devices.
          </p>
        </Dialog>
      )}
      {trade && !demo && (
        <TradeComposer target={l} onClose={() => setTrade(false)} />
      )}
    </>
  );
}

export function SellerPage({ id }: { id: string }) {
  const { user, toast, requireUser } = useApp();
  const { data, error, loading, reload } = useResource<{ seller: Profile }>(
    "/sellers/" + id,
  );
  const {
    data: feed,
    loading: feedLoading,
    error: feedError,
  } = useResource<Page<Listing>>("/listings?seller=" + id + "&limit=78");
  const [blocking, setBlocking] = useState(false);
  const block = async () => {
    if (!requireUser()) return;
    setBlocking(true);
    try {
      await api("/blocks", "POST", { userId: id, blocked: true });
      toast("User blocked. Manage blocked users in Settings.");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBlocking(false);
    }
  };
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  const p = data?.seller;
  if (!p) return null;
  return (
    <>
      <section className="seller-profile">
        <Avatar profile={p} size={96} />
        <div>
          <span className="eyebrow">
            {p.isDemo ? "Sample storefront" : "The seller's shelf"}
          </span>
          <h1>{p.name}</h1>
          {p.isDemo && <DemoBadge />}
          <span className="muted">@{p.username}</span>
          {p.bio && <p>{p.bio}</p>}
          <div className="profile-facts">
            {p.location && (
              <span>
                <MapPin size={14} />
                {p.location}
              </span>
            )}
            {!p.isDemo && (
              <span>
                Member since{" "}
                {new Date(p.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
            {!p.isDemo && (
              <span>{p.completedTrades || 0} completed trades</span>
            )}
          </div>
        </div>
        {user?.id !== id && !p.isDemo && (
          <div className="seller-controls">
            <button className="text-button" onClick={block} disabled={blocking}>
              Block user
            </button>
            <ReportButton targetType="user" targetId={id} />
          </div>
        )}
      </section>
      {p.isDemo && <DemoCatalogNotice />}
      <div className="section-heading">
        <div>
          <span className="eyebrow">Coded from A–1 to Z–3</span>
          <h2>On the shelf.</h2>
        </div>
        <span className="muted">{feed?.items.length || 0} items</span>
      </div>
      {feedLoading ? (
        <Loading cards />
      ) : feedError ? (
        <ErrorBox error={feedError} />
      ) : feed?.items.length ? (
        <div className="public-shelf">
          {feed.items.map((l) => (
            <Link to={"/items/" + l.id} className="shelf-item" key={l.id}>
              <Photo listing={l} />
              <span className="shelf-code">{l.code}</span>
              {(l.isDemo || p.isDemo) && <DemoBadge />}
              <h3>{l.title}</h3>
              <div className="product-meta">
                <span>
                  {(l.isDemo || p.isDemo) && l.priceCents === null
                    ? "Sample item"
                    : money(l.priceCents)}
                </span>
                {!(l.isDemo || p.isDemo) && <Status value={l.status} />}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title="Room for something new."
          body="This seller doesn't have any public listings yet."
          action={{ label: "Explore the marketplace", to: "/explore" }}
        />
      )}
    </>
  );
}
