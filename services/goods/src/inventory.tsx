import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Grid2X2,
  ImagePlus,
  LayoutGrid,
  List,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
  ArrowLeftRight,
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  api,
  withoutBase,
  conditions,
  money,
  requestId,
  type Listing,
  type Photo as PhotoType,
  type Slot,
} from "./api";
import {
  Confirm,
  Empty,
  ErrorBox,
  Link,
  Loading,
  PageTitle,
  Photo,
  ProductCard,
  Spinner,
  Status,
  useApp,
  useResource,
} from "./ui";

export function Inventory() {
  const { user } = useApp();
  const { data, error, loading, reload } = useResource<{
    slots: Slot[];
    history: Listing[];
  }>(user ? "/me/inventory" : null);
  const [mode, setMode] = useState<"visual" | "grid">("visual"),
    [tab, setTab] = useState("all");
  if (!user)
    return (
      <div className="join-shelf">
        <span className="eyebrow">A place for your good stuff</span>
        <h1>
          Your shelf.
          <br />
          Your next exchange.
        </h1>
        <p>
          78 positions to organize your collection.
          <br />
          One simple way to find it a new home.
        </p>
        <Link className="button" to="/signup?returnTo=/sell">
          Create your shelf <ArrowRight size={18} />
        </Link>
        <Link className="text-button" to="/login?returnTo=/sell">
          Already a member? Sign in
        </Link>
        <div className="shelf-preview" aria-hidden="true">
          {["A–1", "A–2", "A–3", "B–1", "B–2", "B–3"].map((c) => (
            <span key={c}>
              {c}
              <Plus size={18} />
            </span>
          ))}
        </div>
      </div>
    );
  const occupied = data?.slots.filter((s) => s.listing).length || 0;
  const active =
    data?.slots.flatMap((s) => (s.listing ? [s.listing] : [])) || [];
  const items =
    tab === "history"
      ? data?.history || []
      : active.filter((l) => tab === "all" || l.status === tab);
  return (
    <>
      <PageTitle title="Your shelf">
        <Link to="/sell/new" className="button">
          <Plus size={18} /> List an item
        </Link>
      </PageTitle>
      <div className="inventory-summary">
        <div>
          <strong>
            {occupied}
            <span>/78</span>
          </strong>
          <span>positions in use</span>
        </div>
        <div className="capacity-track">
          <span style={{ width: (occupied / 78) * 100 + "%" }} />
        </div>
        <span>{78 - occupied} positions available</span>
      </div>
      <div className="inventory-toolbar">
        <div className="tab-bar">
          {[
            ["all", "All items"],
            ["draft", "Drafts"],
            ["active", "Available"],
            ["reserved", "Reserved"],
            ["history", "History"],
          ].map(([k, l]) => (
            <button
              key={k}
              className={tab === k ? "selected" : ""}
              onClick={() => setTab(k)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="view-switch">
          <button
            className={mode === "visual" ? "selected" : ""}
            aria-label="Visual inventory"
            onClick={() => setMode("visual")}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            className={mode === "grid" ? "selected" : ""}
            aria-label="Coded inventory grid"
            onClick={() => setMode("grid")}
          >
            <Grid2X2 size={18} />
          </button>
        </div>
      </div>
      {loading ? (
        <Loading cards />
      ) : error ? (
        <ErrorBox error={error} retry={reload} />
      ) : mode === "grid" && tab !== "history" ? (
        <div className="inventory-grid">
          <div className="grid-column-labels">
            <span />
            <strong>1</strong>
            <strong>2</strong>
            <strong>3</strong>
          </div>
          {Array.from({ length: 26 }, (_, i) =>
            String.fromCharCode(65 + i),
          ).map((row) => (
            <div className="inventory-row" key={row}>
              <span className="row-label">{row}</span>
              {[1, 2, 3].map((col) => {
                const s = data?.slots.find((s) => s.code === row + "-" + col),
                  l = s?.listing;
                return (
                  <Link
                    key={col}
                    to={
                      l ? "/sell/" + l.id : "/sell/new?code=" + row + "-" + col
                    }
                    className={
                      "inventory-cell " +
                      (l ? "occupied" : "available") +
                      (l && tab !== "all" && l.status !== tab
                        ? " filtered-out"
                        : "")
                    }
                  >
                    {l ? (
                      <>
                        <Photo listing={l} />
                        <div>
                          <strong>{l.code}</strong>
                          <span>{l.title || "Untitled draft"}</span>
                          <Status value={l.status} />
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="empty-cell-code">
                          {row}-{col}
                        </span>
                        <Plus size={22} />
                        <small>Add item</small>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      ) : items.length ? (
        <div className="product-grid inventory-visual">
          {items.map((l) => (
            <article className="inventory-card" key={l.id}>
              <Link to={"/sell/" + l.id}>
                <Photo listing={l} />
                <div className="inventory-card-heading">
                  <span className="code-pill">{l.code}</span>
                  <Status value={l.status} />
                </div>
                <h3>{l.title || "Untitled draft"}</h3>
                <span className="muted">
                  {l.condition || "Details to finish"}
                </span>
              </Link>
              <div className="inventory-card-footer">
                <Link className="text-button" to={"/sell/" + l.id}>
                  {l.status === "draft"
                    ? "Continue draft"
                    : l.status === "reserved"
                      ? "View reservation"
                      : "Manage item"}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title={
            tab === "history"
              ? "Every item has a story."
              : tab === "draft"
                ? "No unfinished business."
                : "No listings yet"
          }
          body={
            tab === "history"
              ? "Traded and archived items will stay here. Reusing a position never changes an old exchange."
              : tab === "draft"
                ? "Drafts you save will be waiting here when you’re ready."
                : "Your first listing starts a whole new possibility. Choose a photo and find it a spot on your shelf."
          }
          action={{ label: "List an item", to: "/sell/new" }}
        />
      )}
    </>
  );
}

type EditorData = {
  code: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  tradeEnabled: boolean;
  tradePreferences: string;
  photos: PhotoType[];
};
const blank: EditorData = {
  code: "",
  title: "",
  description: "",
  category: "",
  condition: "",
  price: "",
  tradeEnabled: true,
  tradePreferences: "",
  photos: [],
};
async function compressImage(file: File): Promise<File> {
  if (
    file.size <= 2_000_000 ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type)
  )
    return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext("2d")!
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/jpeg", 0.88),
    );
    return blob
      ? new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
          type: "image/jpeg",
        })
      : file;
  } catch {
    return file;
  }
}
export function ListingEditor({ id }: { id?: string }) {
  const { user, go, toast, requireUser } = useApp();
  const cacheKey = "bsty-draft:" + user?.id + ":" + (id || "new");
  const cached = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem(cacheKey) || "null",
      ) as EditorData | null;
    } catch {
      return null;
    }
  };
  const [form, setForm] = useState<EditorData>(
    () =>
      cached() || {
        ...blank,
        code: new URLSearchParams(location.search).get("code") || "",
      },
  );
  const [step, setStep] = useState(0),
    [listing, setListing] = useState<Listing | null>(null),
    [loading, setLoading] = useState(!!id),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [failed, setFailed] = useState<{ file: File; error: string }[]>([]),
    [archive, setArchive] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const readOperation = () => {
    try {
      const value = JSON.parse(
        sessionStorage.getItem(cacheKey + ":operation") || "null",
      );
      return value &&
        typeof value.payload === "string" &&
        typeof value.id === "string"
        ? (value as { payload: string; id: string })
        : null;
    } catch {
      return null;
    }
  };
  const operation = useRef<{ payload: string; id: string } | null>(
    readOperation(),
  );
  const { data: inventory, reload: reloadInventory } = useResource<{
    slots: Slot[];
  }>(user ? "/me/inventory" : null);
  const { data: categories } = useResource<{ items: string[] }>("/categories");
  useEffect(() => {
    if (!id) return;
    let current = true;
    api<{ listing: Listing }>("/listings/" + id)
      .then(({ listing: l }) => {
        if (!current) return;
        setListing(l);
        if (!cached())
          setForm({
            code: l.code,
            title: l.title,
            description: l.description,
            category: l.category,
            condition: l.condition,
            price: l.priceCents == null ? "" : String(l.priceCents / 100),
            tradeEnabled: l.tradeEnabled,
            tradePreferences: l.tradePreferences || "",
            photos: l.photos,
          });
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
  }, [id]);
  useEffect(() => {
    if (!loading && user)
      sessionStorage.setItem(cacheKey, JSON.stringify(form));
  }, [form, cacheKey, loading, user]);
  useEffect(() => {
    if (!form.code && inventory) {
      const s = inventory.slots.find((s) => !s.listing);
      if (s) setForm((f) => ({ ...f, code: s.code }));
    }
  }, [inventory]);
  const set = <K extends keyof EditorData>(key: K, value: EditorData[K]) => {
    setError("");
    setForm((f) => ({ ...f, [key]: value }));
  };
  const upload = async (files: File[]) => {
    if (!user) {
      requireUser();
      return;
    }
    setUploading(true);
    setError("");
    const failures: { file: File; error: string }[] = [];
    let count = form.photos.length;
    for (const original of files) {
      if (count >= 6) {
        failures.push({
          file: original,
          error: "Your listing can have up to six photos.",
        });
        continue;
      }
      if (original.size > 10 * 1024 * 1024) {
        failures.push({
          file: original,
          error: "Choose a photo smaller than 10 MB.",
        });
        continue;
      }
      try {
        const file = await compressImage(original);
        const body = new FormData();
        body.append("file", file);
        const r = await api<{ photo: PhotoType }>("/uploads", "POST", body);
        setForm((f) => ({ ...f, photos: [...f.photos, r.photo] }));
        count++;
      } catch (e) {
        failures.push({ file: original, error: (e as Error).message });
      }
    }
    setFailed((previous) => [
      ...previous.filter((f) => !files.includes(f.file)),
      ...failures,
    ]);
    setUploading(false);
    if (input.current) input.current.value = "";
  };
  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= form.photos.length) return;
    setForm((f) => {
      const photos = [...f.photos];
      const [p] = photos.splice(from, 1);
      photos.splice(to, 0, p);
      return { ...f, photos };
    });
  };
  const validate = (stage: number) => {
    if (stage === 0 && !form.photos.length)
      return "Add at least one photo before continuing.";
    if (stage === 1) {
      if (form.title.trim().length < 3)
        return "Give your item a title with at least three characters.";
      if (form.description.trim().length < 5)
        return "Add a description so the other person knows what to expect.";
      if (!form.category || !form.condition)
        return "Choose a category and condition.";
      if (
        form.price !== "" &&
        (!Number.isFinite(Number(form.price)) || Number(form.price) < 0)
      )
        return "Enter a valid positive listed value.";
    }
    if (stage === 2 && !/^[A-Z]-[123]$/.test(form.code))
      return "Choose an available inventory position.";
    return "";
  };
  const next = () => {
    const issue = validate(step);
    if (issue) {
      setError(issue);
      return;
    }
    setError("");
    setStep((v) => Math.min(4, v + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const save = async (status: "draft" | "active" | "archived") => {
    if (!user) {
      requireUser();
      return;
    }
    if (status === "active") {
      for (let i = 0; i <= 2; i++) {
        const issue = validate(i);
        if (issue) {
          setStep(i);
          setError(issue);
          return;
        }
      }
    }
    if (!form.code) {
      setError("Choose an inventory position first.");
      setStep(2);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        code: form.code,
        title: form.title,
        description: form.description,
        category: form.category,
        condition: form.condition,
        priceCents:
          form.price === "" ? null : Math.round(Number(form.price) * 100),
        tradeEnabled: form.tradeEnabled,
        tradePreferences: form.tradePreferences,
        photoIds: form.photos.map((p) => p.id),
        status,
      };
      const fingerprint = JSON.stringify(payload);
      if (operation.current?.payload !== fingerprint)
        operation.current = { payload: fingerprint, id: requestId() };
      sessionStorage.setItem(
        cacheKey + ":operation",
        JSON.stringify(operation.current),
      );
      const d = await api<{ listing: Listing }>(
        "/listings" + (id ? "/" + id : ""),
        id ? "PATCH" : "POST",
        { ...payload, clientRequestId: operation.current.id },
      );
      operation.current = null;
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(cacheKey + ":operation");
      toast(
        status === "active"
          ? "Your listing is live."
          : status === "archived"
            ? "Listing moved to history."
            : "Draft saved to your shelf.",
      );
      if (status === "active") go("/items/" + d.listing.id);
      else go("/sell");
    } catch (e) {
      setError((e as Error).message);
      setArchive(false);
      reloadInventory();
    } finally {
      setBusy(false);
    }
  };
  if (!user)
    return (
      <Empty
        title="Your next good listing."
        body="Sign in to add photos, choose a position and publish your item."
        action={{
          label: "Sign in",
          to:
            "/login?returnTo=" +
            encodeURIComponent(
              withoutBase(location.pathname + location.search),
            ),
        }}
      />
    );
  if (loading) return <Loading />;
  const immutable =
    listing &&
    (listing.isHidden ||
      ["reserved", "traded", "archived", "hidden"].includes(listing.status));
  const preview: Listing = {
    id: listing?.id || "preview",
    owner: user,
    code: form.code,
    title: form.title,
    description: form.description,
    category: form.category,
    condition: form.condition,
    priceCents: form.price === "" ? null : Math.round(Number(form.price) * 100),
    tradeEnabled: form.tradeEnabled,
    tradePreferences: form.tradePreferences,
    status: "active",
    version: 1,
    photos: form.photos,
    createdAt: listing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
  };
  const steps = ["Photos", "Details", "Position", "Preview", "Publish"];
  return (
    <>
      <PageTitle title={id ? "Edit listing" : "List an item"} back="/sell">
        {!immutable && (
          <button
            className="button secondary"
            disabled={busy || uploading}
            onClick={() =>
              save(listing?.status === "active" ? "active" : "draft")
            }
          >
            <Save size={17} />
            {listing?.status === "active" ? "Save changes" : "Save draft"}
          </button>
        )}
      </PageTitle>
      {immutable ? (
        <section className="panel">
          <Status value={listing.status} />
          <h2>{listing.title}</h2>
          <p className="muted">
            {listing.status === "reserved"
              ? "This item is reserved for an accepted exchange. Manage the exchange in Trades; its item details stay fixed."
              : "This listing is preserved in history or has been restricted. Its original details stay attached to past exchanges."}
          </p>
          <div className="editor-preview">
            <Photo listing={listing} />
            <div>
              <span className="code-pill">{listing.code}</span>
              <h3>{listing.title}</h3>
              <p>{listing.description}</p>
            </div>
          </div>
          <Link to="/trades?tab=accepted" className="button">
            View trades <ArrowRight size={18} />
          </Link>
        </section>
      ) : (
        <>
          <ol className="editor-steps">
            {steps.map((name, i) => (
              <li
                key={name}
                className={i === step ? "current" : i < step ? "done" : ""}
              >
                <button
                  onClick={() => {
                    if (i < step) {
                      setStep(i);
                      setError("");
                    }
                  }}
                  disabled={i > step}
                >
                  <span>{i < step ? <Check size={14} /> : i + 1}</span>
                  {name}
                </button>
              </li>
            ))}
          </ol>
          <div className="editor-layout">
            <section className="panel editor-panel">
              {step === 0 && (
                <>
                  <span className="eyebrow">01 / A good first impression</span>
                  <h2>Let your item do the talking.</h2>
                  <p className="muted">
                    Add up to six clear photos. The first one is your cover.
                    JPEG, PNG or WebP, up to 10 MB each.
                  </p>
                  <input
                    ref={input}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    multiple
                    className="file-input"
                    id="listing-photos"
                    aria-label="Listing photographs"
                    onChange={(e) =>
                      void upload(Array.from(e.target.files || []))
                    }
                    disabled={uploading || form.photos.length >= 6}
                  />
                  <div className="photo-editor-grid">
                    {form.photos.map((p, i) => (
                      <div className="uploaded-photo" key={p.id}>
                        <img
                          src={p.url}
                          alt={"Listing photograph " + (i + 1)}
                        />
                        {i === 0 && <span className="cover-label">Cover</span>}
                        <button
                          className="remove-photo icon-button"
                          aria-label={"Remove photo " + (i + 1)}
                          onClick={() =>
                            set(
                              "photos",
                              form.photos.filter((photo) => photo.id !== p.id),
                            )
                          }
                        >
                          <X size={15} />
                        </button>
                        <div className="photo-reorder">
                          <button
                            disabled={i === 0}
                            onClick={() => reorder(i, i - 1)}
                            aria-label={"Move photo " + (i + 1) + " earlier"}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          {i > 0 && (
                            <button onClick={() => reorder(i, 0)}>
                              Set cover
                            </button>
                          )}
                          <button
                            disabled={i === form.photos.length - 1}
                            onClick={() => reorder(i, i + 1)}
                            aria-label={"Move photo " + (i + 1) + " later"}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {form.photos.length < 6 && (
                      <label htmlFor="listing-photos" className="upload-target">
                        {uploading ? (
                          <Spinner />
                        ) : (
                          <ImagePlus size={28} strokeWidth={1.3} />
                        )}
                        <strong>
                          {uploading ? "Uploading…" : "Add photos"}
                        </strong>
                        <span>{form.photos.length}/6</span>
                      </label>
                    )}
                  </div>
                  {failed.map((f, i) => (
                    <div className="upload-failure" role="alert" key={i}>
                      <div>
                        <strong>{f.file.name}</strong>
                        <p>{f.error}</p>
                      </div>
                      <button
                        className="text-button"
                        disabled={uploading}
                        onClick={() => void upload([f.file])}
                      >
                        Retry
                      </button>
                      <button
                        className="icon-button"
                        aria-label={"Dismiss failed " + f.file.name}
                        onClick={() =>
                          setFailed((v) => v.filter((_, index) => index !== i))
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </>
              )}
              {step === 1 && (
                <>
                  <span className="eyebrow">02 / Tell its story</span>
                  <h2>The good details.</h2>
                  <div className="form">
                    <label>
                      Item title
                      <input
                        maxLength={80}
                        value={form.title}
                        onChange={(e) => set("title", e.target.value)}
                        placeholder="e.g. Vintage indigo chore jacket"
                      />
                      <small>{form.title.length}/80</small>
                    </label>
                    <label>
                      Description
                      <textarea
                        maxLength={1000}
                        rows={5}
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Tell us about the fit, condition and any details worth knowing."
                      />
                      <small>
                        {form.description.length}/1000 · Be honest about wear
                        and flaws.
                      </small>
                    </label>
                    <div className="field-row">
                      <label>
                        Category
                        <select
                          value={form.category}
                          onChange={(e) => set("category", e.target.value)}
                        >
                          <option value="">Choose a category</option>
                          {categories?.items.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Condition
                        <select
                          value={form.condition}
                          onChange={(e) => set("condition", e.target.value)}
                        >
                          <option value="">Choose condition</option>
                          {conditions.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label>
                      Listed value ($){" "}
                      <span className="optional">optional</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => set("price", e.target.value)}
                        placeholder="Leave blank for trade only"
                      />
                      <small>
                        A reference value for your item. Payments are not
                        collected here.
                      </small>
                    </label>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={form.tradeEnabled}
                        onChange={(e) => set("tradeEnabled", e.target.checked)}
                      />{" "}
                      Open to trade
                    </label>
                    {form.tradeEnabled && (
                      <label>
                        Trade preferences{" "}
                        <span className="optional">optional</span>
                        <textarea
                          rows={3}
                          maxLength={500}
                          value={form.tradePreferences}
                          onChange={(e) =>
                            set("tradePreferences", e.target.value)
                          }
                          placeholder="What would you love to find?"
                        />
                      </label>
                    )}
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <span className="eyebrow">03 / Find its place</span>
                  <h2>A spot on your shelf.</h2>
                  <p className="muted">
                    Choose one of your 78 inventory positions. Other sellers can
                    use this code to refer to your item.
                  </p>
                  <label className="slot-select-label">
                    Inventory position
                    <select
                      value={form.code}
                      onChange={(e) => set("code", e.target.value)}
                    >
                      <option value="">Choose a position</option>
                      {inventory?.slots.map((s) => (
                        <option
                          key={s.code}
                          disabled={!!s.listing && s.listing.id !== id}
                          value={s.code}
                        >
                          {s.code}
                          {s.listing && s.listing.id !== id ? " · In use" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="slot-picker">
                    {inventory?.slots.map((s) => (
                      <button
                        key={s.code}
                        type="button"
                        className={
                          (form.code === s.code ? "selected " : "") +
                          (s.listing && s.listing.id !== id ? "occupied" : "")
                        }
                        disabled={!!s.listing && s.listing.id !== id}
                        onClick={() => set("code", s.code)}
                        aria-label={
                          "Position " +
                          s.code +
                          (s.listing && s.listing.id !== id
                            ? " occupied"
                            : " available")
                        }
                      >
                        {s.code}
                        {form.code === s.code && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <span className="eyebrow">04 / The shopper's view</span>
                  <h2>Looking good?</h2>
                  <p className="muted">
                    This is how your item will appear. Check your photos and
                    details before making it public.
                  </p>
                  <div className="listing-preview">
                    <Photo listing={preview} />
                    <div>
                      <div className="item-kicker">
                        <span className="code-pill">{form.code}</span>
                        <span className="status status-active">Preview</span>
                      </div>
                      <h2>{form.title}</h2>
                      <p className="muted">
                        {form.category} · {form.condition}
                      </p>
                      <h3>{money(preview.priceCents)}</h3>
                      <p className="preserve-lines">{form.description}</p>
                      {form.tradeEnabled && (
                        <p className="trade-mark">
                          <ArrowLeftRight size={16} /> Open to trade
                        </p>
                      )}
                      {form.tradePreferences && (
                        <p>
                          <strong>Looking for:</strong> {form.tradePreferences}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
              {step === 4 && (
                <>
                  <div className="publish-symbol">
                    <Check size={40} />
                  </div>
                  <h2>Review before publishing</h2>
                  <p className="muted">
                    Your item will be public at position{" "}
                    <strong>{form.code}</strong>. You can edit it while it’s
                    available. Accepted trades lock the item details until the
                    exchange is resolved.
                  </p>
                  <div className="publish-summary">
                    <Photo listing={preview} />
                    <div>
                      <strong>{form.title}</strong>
                      <span>
                        {form.condition} · {form.photos.length} photos
                      </span>
                      <span>
                        {form.tradeEnabled
                          ? "Open to trade"
                          : "Message inquiries"}
                      </span>
                    </div>
                  </div>
                  <button
                    className="button full"
                    onClick={() => save("active")}
                    disabled={busy || uploading}
                  >
                    {busy ? <Spinner /> : <UploadCloud size={18} />}{" "}
                    {listing?.status === "active"
                      ? "Publish changes"
                      : "Publish listing"}
                  </button>
                </>
              )}
              {error && <ErrorBox error={error} />}
              <div className="editor-bottom">
                <button
                  className="text-button"
                  disabled={step === 0 || busy}
                  onClick={() => {
                    setStep((s) => s - 1);
                    setError("");
                  }}
                >
                  <ArrowLeft size={17} /> Back
                </button>
                {step < 4 && (
                  <button
                    className="button"
                    onClick={next}
                    disabled={busy || uploading}
                  >
                    Continue <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </section>
            <aside className="editor-aside">
              <h3>Listing tips</h3>
              <p>Use your own photos and describe any wear or damage.</p>
              <div className="mini-shelf">
                <span>{form.code || "A-1"}</span>
                <ArrowLeftRight size={30} strokeWidth={1} />
              </div>
              {id && (
                <button
                  className="text-button danger"
                  onClick={() => setArchive(true)}
                >
                  <Trash2 size={16} /> Remove listing
                </button>
              )}
            </aside>
          </div>
        </>
      )}
      {archive && (
        <Confirm
          title="Remove this listing?"
          body="The item will move to history and its position will become available. Pending trade offers for it will close. Past exchanges keep their original record."
          onClose={() => setArchive(false)}
          onConfirm={() => save("archived")}
          busy={busy}
          label="Remove listing"
        />
      )}
    </>
  );
}
