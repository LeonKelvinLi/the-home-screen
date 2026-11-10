import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  MessageCircle,
  X,
  ShieldCheck,
} from "lucide-react";
import {
  api,
  withBase,
  codeOf,
  requestId,
  time,
  type Listing,
  type Page,
  type Slot,
  type Trade,
} from "./api";
import {
  Confirm,
  Dialog,
  Empty,
  ErrorBox,
  Link,
  Loading,
  PageTitle,
  Photo,
  ReportButton,
  Seller,
  SignedOut,
  Spinner,
  Status,
  useApp,
  useResource,
} from "./ui";

function TradeItem({
  item,
  label,
  availability,
  snapshot = false,
}: {
  item: Listing;
  label: string;
  availability?: string;
  snapshot?: boolean;
}) {
  return (
    <div className="trade-item">
      <span className="eyebrow">{label}</span>
      <Photo listing={item} />
      <span className="code-pill">{item.code}</span>
      <h3>{item.title}</h3>
      <p>{item.owner.name || item.owner.username}</p>
      <div className="trade-item-meta">
        <span>{item.condition}</span>
        {snapshot ? (
          <small className="snapshot-note">At request: {item.status}</small>
        ) : (
          <Status value={availability || item.status} />
        )}
      </div>
    </div>
  );
}
export function TradePair({ trade }: { trade: Trade }) {
  const { user } = useApp();
  const availability = ["accepted", "disputed"].includes(trade.state)
    ? "reserved"
    : trade.state === "completed"
      ? "traded"
      : undefined;
  return (
    <div className="trade-pair">
      <TradeItem
        item={trade.offered}
        availability={availability}
        snapshot={!availability}
        label={
          trade.sender.id === user?.id
            ? "You offer"
            : trade.sender.name + " offers"
        }
      />
      <ArrowLeftRight className="pair-arrow" size={22} />
      <TradeItem
        item={trade.requested}
        availability={availability}
        snapshot={!availability}
        label={
          trade.recipient.id === user?.id
            ? "You give"
            : trade.recipient.name + " gives"
        }
      />
    </div>
  );
}
export function TradeComposer({
  target,
  onClose,
}: {
  target: Listing;
  onClose: () => void;
}) {
  const { go } = useApp();
  const { data, loading, error, reload } = useResource<{ slots: Slot[] }>(
    "/me/inventory",
  );
  const { data: sellerFeed } = useResource<Page<Listing>>(
    "/listings?seller=" + target.owner.id + "&limit=78",
  );
  const [ownCode, setOwnCode] = useState(""),
    [targetCode, setTargetCode] = useState(target.code),
    [message, setMessage] = useState(""),
    [review, setReview] = useState(false),
    [busy, setBusy] = useState(false),
    [sendError, setSendError] = useState("");
  const [key] = useState(requestId);
  const eligible =
    data?.slots.flatMap((s) =>
      s.listing?.status === "active" && s.listing.tradeEnabled
        ? [s.listing]
        : [],
    ) || [];
  const own = eligible.find((l) => l.code === codeOf(ownCode));
  const wanted =
    sellerFeed?.items.find((l) => l.code === codeOf(targetCode)) ||
    (codeOf(targetCode) === target.code ? target : undefined);
  const valid = !!own && wanted?.status === "active" && wanted?.tradeEnabled;
  const send = async () => {
    if (!own || !wanted) return;
    setBusy(true);
    setSendError("");
    try {
      const d = await api<{ trade: Trade }>("/trades", "POST", {
        offeredListingId: own.id,
        requestedListingId: wanted.id,
        message,
        clientRequestId: key,
      });
      go("/trades/" + d.trade.id);
      onClose();
    } catch (e) {
      setSendError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      title={review ? "Review your trade" : "A good exchange."}
      onClose={() => {
        if (!busy) onClose();
      }}
      wide
    >
      <p className="muted">
        {review
          ? "Two items. Two people. Check both sides before you send."
          : "Choose what you offer and what you want from " +
            target.owner.name +
            "’s shelf."}
      </p>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox error={error} retry={reload} />
      ) : !eligible.length ? (
        <Empty
          title="Start with something to offer."
          body="Add a trade-enabled listing to your inventory, then come back to this item."
          action={{
            label: "List an item",
            to:
              "/sell/new?returnTo=" + encodeURIComponent("/items/" + target.id),
          }}
        />
      ) : (
        <>
          <div className="trade-composer-pair">
            <section className="trade-box">
              <span className="eyebrow">01 — You offer</span>
              {!review && (
                <label>
                  Your inventory code
                  <input
                    aria-label="Your inventory code"
                    value={ownCode}
                    placeholder="e.g. A-1"
                    maxLength={3}
                    onChange={(e) => {
                      setOwnCode(e.target.value.toUpperCase());
                      setSendError("");
                    }}
                    list="my-trade-items"
                  />
                  <datalist id="my-trade-items">
                    {eligible.map((l) => (
                      <option value={l.code} key={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </datalist>
                </label>
              )}
              {own ? (
                <TradeItem item={own} label="From your shelf" />
              ) : (
                <div className="item-picker">
                  {eligible.map((l) => (
                    <button
                      className="picker-item"
                      key={l.id}
                      onClick={() => setOwnCode(l.code)}
                    >
                      <Photo listing={l} />
                      <span>
                        <strong>{l.code}</strong>
                        {l.title}
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              )}
              {ownCode && !own && (
                <p className="field-error">
                  Choose one of your available, trade-enabled items.
                </p>
              )}
            </section>
            <ArrowLeftRight size={25} className="pair-arrow" />
            <section className="trade-box">
              <span className="eyebrow">02 — You want</span>
              {!review && (
                <label>
                  Their inventory code
                  <input
                    aria-label="Their inventory code"
                    value={targetCode}
                    onChange={(e) => {
                      setTargetCode(e.target.value.toUpperCase());
                      setSendError("");
                    }}
                    maxLength={3}
                  />
                </label>
              )}
              {wanted ? (
                <TradeItem
                  item={wanted}
                  label={"From " + target.owner.name + "’s shelf"}
                />
              ) : (
                <p className="field-error">
                  No public item matches this code on this seller's shelf.
                </p>
              )}
              {wanted &&
                (wanted.status !== "active" || !wanted.tradeEnabled) && (
                  <p className="field-error">
                    This item isn't available to trade.
                  </p>
                )}
            </section>
          </div>
          {!review && (
            <label>
              A note (optional)
              <textarea
                value={message}
                maxLength={1000}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say hello or tell them why it’s a good match."
                rows={3}
              />
            </label>
          )}
          {review && (
            <div className="trade-review-note">
              <ShieldCheck size={21} />
              <p>
                Sending this request keeps both items available. The other
                person must accept before either item is reserved. Arrange the
                exchange together; no payment or shipping is handled here.
              </p>
            </div>
          )}
          {sendError && <ErrorBox error={sendError} />}
          <div className="actions end">
            {review && (
              <button
                className="button secondary"
                onClick={() => setReview(false)}
                disabled={busy}
              >
                Back to items
              </button>
            )}
            <button
              className="button"
              disabled={!valid || busy}
              onClick={review ? send : () => setReview(true)}
            >
              {busy ? <Spinner /> : <ArrowLeftRight size={18} />}{" "}
              {review ? "Send trade request" : "Review trade"}
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}

export function Trades() {
  const { user, go } = useApp();
  const initial = new URLSearchParams(location.search).get("tab") || "received";
  const [tab, setTab] = useState(initial);
  const { data, error, loading, reload } = useResource<Page<Trade>>(
    user ? "/trades?tab=" + tab : null,
  );
  const [extra, setExtra] = useState<Trade[]>([]),
    [next, setNext] = useState<string | null>(null),
    [more, setMore] = useState(false),
    [moreError, setMoreError] = useState("");
  useEffect(() => {
    setExtra([]);
    setNext(data?.nextCursor || null);
  }, [data]);
  const load = async () => {
    if (!next) return;
    setMore(true);
    setMoreError("");
    try {
      const p = await api<Page<Trade>>(
        "/trades?tab=" + tab + "&cursor=" + encodeURIComponent(next),
      );
      setExtra((v) => [...v, ...p.items]);
      setNext(p.nextCursor);
    } catch (e) {
      setMoreError((e as Error).message);
    } finally {
      setMore(false);
    }
  };
  if (!user) return <SignedOut what="propose and manage trades" />;
  const items = [...(data?.items || []), ...extra];
  return (
    <>
      <PageTitle eyebrow="Give a little. Find a lot." title="Your exchanges." />
      <div className="tab-bar">
        {[
          ["received", "Received"],
          ["sent", "Sent"],
          ["accepted", "Accepted"],
          ["history", "History"],
        ].map(([key, label]) => (
          <button
            className={tab === key ? "selected" : ""}
            key={key}
            onClick={() => {
              setTab(key);
              history.replaceState({}, "", withBase("/trades?tab=" + key));
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox error={error} retry={reload} />
      ) : items.length ? (
        <div className="trades-grid">
          {items.map((t) => (
            <Link key={t.id} to={"/trades/" + t.id} className="trade-card">
              <div className="trade-card-top">
                <Status value={t.state} />
                <span>{time(t.createdAt)}</span>
              </div>
              <TradePair trade={t} />
              <div className="trade-card-bottom">
                <span>View exchange</span>
                <ArrowRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title={
            tab === "received"
              ? "Good offers start here."
              : tab === "sent"
                ? "Make the first move."
                : tab === "accepted"
                  ? "Your next exchange is out there."
                  : "A place for every exchange."
          }
          body={
            tab === "received"
              ? "Offers for your items will arrive here. Make sure your shelf has something to trade."
              : tab === "sent"
                ? "Find something you like and offer an item from your own shelf."
                : "Explore the marketplace and find your next good trade."
          }
          action={{
            label: tab === "received" ? "Manage your shelf" : "Explore goods",
            to: tab === "received" ? "/sell" : "/explore",
          }}
        />
      )}
      {moreError && <ErrorBox error={moreError} />}
      {next && (
        <div className="load-more">
          <button className="button secondary" disabled={more} onClick={load}>
            {more ? <Spinner /> : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}

const actionText: Record<
  string,
  { title: string; body: string; label: string }
> = {
  accept: {
    title: "Accept this trade?",
    body: "Both items will be reserved for this exchange. Other offers involving either item will close. Acceptance does not mean the physical exchange is complete.",
    label: "Accept trade",
  },
  decline: {
    title: "Decline this offer?",
    body: "This offer will close. Both items will remain available.",
    label: "Decline offer",
  },
  withdraw: {
    title: "Withdraw your offer?",
    body: "Your pending request will close. Both items will remain available.",
    label: "Withdraw offer",
  },
  confirm: {
    title: "Have you exchanged the items?",
    body: "Confirm only after you have completed your part of the exchange. Both people must confirm before the items move to history. This is a participant declaration, not independently verified delivery.",
    label: "Confirm exchange",
  },
  cancel: {
    title: "Request cancellation?",
    body: "After acceptance, both people must request cancellation before the reserved items are released. A problem can be reported for operator review.",
    label: "Request cancellation",
  },
  dispute: {
    title: "Report a problem?",
    body: "Both items remain reserved while the moderation team reviews this exchange. Explain the issue so they can help.",
    label: "Report problem",
  },
};
export function TradePage({ id }: { id: string }) {
  const { user, toast } = useApp();
  const { data, error, loading, reload } = useResource<{ trade: Trade }>(
    user ? "/trades/" + id : null,
  );
  const [action, setAction] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [actionError, setActionError] = useState(""),
    [reason, setReason] = useState("");
  const [operation, setOperation] = useState<{
    action: string;
    key: string;
  } | null>(null);
  const t = data?.trade;
  const choose = (a: string) => {
    setAction(a);
    setActionError("");
    setReason("");
    setOperation((o) =>
      o?.action === a ? o : { action: a, key: requestId() },
    );
  };
  const submit = async () => {
    if (!action || !operation) return;
    setBusy(true);
    setActionError("");
    try {
      await api("/trades/" + id + "/actions", "POST", {
        action,
        clientRequestId: operation.key,
        reason,
      });
      setAction(null);
      setOperation(null);
      reload();
      toast("Exchange updated.");
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (!user) return <SignedOut what="view this exchange" />;
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  if (!t) return null;
  const incoming = t.recipient.id === user.id;
  const confirmed = t.confirmedBy.includes(user.id);
  const cancellation = t.cancelRequestedBy.includes(user.id);
  return (
    <>
      <PageTitle
        eyebrow="Two sides to a good exchange"
        title="Trade details."
        back="/trades"
      >
        <Status value={t.state} />
      </PageTitle>
      <div className="trade-detail-layout">
        <section className="panel trade-detail-main">
          <TradePair trade={t} />
          <div className="trade-state-note">
            <ArrowLeftRight size={20} />
            <div>
              <strong>
                {t.state === "accepted"
                  ? "Accepted · Awaiting exchange"
                  : t.state === "completed"
                    ? "Exchange confirmed by both people"
                    : t.state === "pending"
                      ? "Waiting for a response"
                      : t.state === "disputed"
                        ? "A problem has been reported"
                        : "This offer is " + t.state}
              </strong>
              <p>
                {t.state === "pending"
                  ? "No items are reserved until the recipient accepts. Expires " +
                    time(t.expiresAt) +
                    "."
                  : t.state === "accepted"
                    ? "Both items are reserved. Arrange the exchange in your conversation. Each person confirms separately after the exchange."
                    : t.state === "completed"
                      ? "Both original listings are now in history. Their inventory positions are free for something new."
                      : t.state === "disputed"
                        ? "The items stay reserved until the operator records a resolution."
                        : "The original item details are preserved below for reference."}
              </p>
            </div>
          </div>
          {t.state === "accepted" && (
            <div className="confirmation-progress">
              <div
                className={t.confirmedBy.includes(t.sender.id) ? "done" : ""}
              >
                <Check size={16} />
                {t.sender.name}
                {t.confirmedBy.includes(t.sender.id)
                  ? " confirmed"
                  : " · waiting"}
              </div>
              <div
                className={t.confirmedBy.includes(t.recipient.id) ? "done" : ""}
              >
                <Check size={16} />
                {t.recipient.name}
                {t.confirmedBy.includes(t.recipient.id)
                  ? " confirmed"
                  : " · waiting"}
              </div>
              {t.cancelRequestedBy.length > 0 && (
                <p>
                  A cancellation has been requested. Items remain reserved until
                  both participants agree.
                </p>
              )}
            </div>
          )}
          <div className="trade-actions">
            {t.state === "pending" &&
              (incoming ? (
                <>
                  <button className="button" onClick={() => choose("accept")}>
                    <Check size={18} /> Accept trade
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => choose("decline")}
                  >
                    Decline
                  </button>
                </>
              ) : (
                <button
                  className="button secondary"
                  onClick={() => choose("withdraw")}
                >
                  Withdraw offer
                </button>
              ))}
            {t.state === "accepted" && (
              <>
                <button
                  className="button"
                  disabled={confirmed || cancellation}
                  onClick={() => choose("confirm")}
                >
                  <Check size={18} />
                  {confirmed
                    ? "Your exchange is confirmed"
                    : "Confirm exchange"}
                </button>
                <button
                  className="button secondary"
                  disabled={cancellation || confirmed}
                  onClick={() => choose("cancel")}
                >
                  {cancellation
                    ? "Cancellation requested"
                    : "Request cancellation"}
                </button>
                <button
                  className="text-button"
                  onClick={() => choose("dispute")}
                >
                  Report a problem
                </button>
              </>
            )}
            <Link
              className="button secondary"
              to={"/inbox/" + t.conversationId}
            >
              <MessageCircle size={18} /> Open conversation
            </Link>
          </div>
        </section>
        <aside className="panel history-panel">
          <span className="eyebrow">Every step, recorded</span>
          <h3>Exchange history</h3>
          <ol className="timeline">
            {t.events?.map((e) => (
              <li key={e.id}>
                <span className="timeline-dot" />
                <strong>{e.action.replaceAll("_", " ")}</strong>
                <small>{time(e.createdAt)}</small>
                {e.reason && <p>{e.reason}</p>}
              </li>
            ))}
          </ol>
          <ReportButton targetType="trade" targetId={id} />
        </aside>
      </div>
      {action && (
        <Dialog
          title={actionText[action].title}
          onClose={() => {
            if (!busy) setAction(null);
          }}
        >
          <p className="muted">{actionText[action].body}</p>
          {action === "dispute" && (
            <label>
              What happened?
              <textarea
                value={reason}
                maxLength={2000}
                rows={4}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
          )}
          {actionError && <ErrorBox error={actionError} />}
          <div className="actions end">
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => setAction(null)}
            >
              Go back
            </button>
            <button
              className="button"
              disabled={
                busy || (action === "dispute" && reason.trim().length < 5)
              }
              onClick={submit}
            >
              {busy ? <Spinner /> : actionText[action].label}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
