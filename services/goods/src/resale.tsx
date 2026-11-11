import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Boxes, ClipboardList, HandHeart } from "lucide-react";
import { api, time, type Page } from "./api";
import {
  ErrorBox,
  Link,
  Loading,
  PageTitle,
  Spinner,
  Status,
  useApp,
  useResource,
} from "./ui";

type Inquiry = {
  id: string;
  goal: "consign" | "fundraiser";
  contactEmail: string;
  collectionSize: number;
  organization: string;
  details: string;
  state: "submitted" | "reviewed" | "withdrawn";
  createdAt: string;
};

const goalLabel = {
  consign: "Managed consignment",
  fundraiser: "Fundraising collection",
};

export function ManagedResale() {
  const { user } = useApp();
  const requests = useResource<{ items: Inquiry[] }>(
    user ? "/resale/requests" : null,
  );
  const [goal, setGoal] = useState<Inquiry["goal"]>("consign");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const retry = useRef<{ payload: string; key: string }>();
  const pending = requests.data?.items.some(
    (item) => item.state === "submitted",
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields = {
      contactEmail: String(data.get("contactEmail") || "").trim(),
      collectionSize: Number(data.get("collectionSize")),
      goal,
      organization: String(data.get("organization") || "").trim(),
      details: String(data.get("details") || "").trim(),
    };
    const payload = JSON.stringify(fields);
    if (retry.current?.payload !== payload)
      retry.current = { payload, key: crypto.randomUUID() };
    setBusy(true);
    setError("");
    setReceipt("");
    try {
      await api("/resale/requests", "POST", {
        ...fields,
        clientKey: retry.current.key,
      });
      setReceipt("Request received. You can track it here.");
      retry.current = undefined;
      requests.reload();
    } catch (cause) {
      setError((cause as Error).message);
      requests.reload();
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async (requestId: string) => {
    setBusy(true);
    setError("");
    try {
      await api("/resale/requests/" + requestId + "/withdraw", "POST", {});
      setReceipt("Request withdrawn.");
      requests.reload();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageTitle title="Managed resale" back="/" />
      <div className="resale-layout">
        <section className="resale-intro">
          <h2>Let us handle your collection.</h2>
          <p>
            For creators, public figures, and teams with secondhand clothing or
            accessories to sell.
          </p>
          <ul>
            <li>
              <Boxes size={21} />
              <span>
                <strong>Intake and storage</strong>Tell us what you have so we
                can review storage and drop-off options.
              </span>
            </li>
            <li>
              <ClipboardList size={21} />
              <span>
                <strong>Tagging and listings</strong>For accepted collections,
                we can photograph, tag, and list each piece on BSTY Goods.
              </span>
            </li>
            <li>
              <HandHeart size={21} />
              <span>
                <strong>Consignment or fundraising</strong>Request a resale
                proposal with a commission, or propose a beneficiary for a
                fundraising collection.
              </span>
            </li>
          </ul>
          <p>
            We’ll review capacity, fees, handling, and any beneficiary with you
            before you send items.
          </p>
        </section>
        <section
          className="panel resale-form"
          aria-labelledby="resale-form-title"
        >
          <h2 id="resale-form-title">Request a review</h2>
          {!user ? (
            <>
              <p>
                Sign in to send your collection details and track the request.
              </p>
              <Link className="button" to="/login?returnTo=%2Fmanaged-resale">
                Sign in to apply <ArrowRight size={17} />
              </Link>
            </>
          ) : (
            <>
              {receipt && <p role="status">{receipt}</p>}
              {error && <ErrorBox error={error} />}
              {requests.loading ? (
                <Loading />
              ) : requests.error ? (
                <ErrorBox error={requests.error} retry={requests.reload} />
              ) : pending ? (
                <p>
                  Your collection is waiting for review. You can withdraw the
                  request below.
                </p>
              ) : (
                <form className="form" onSubmit={submit}>
                  <label>
                    Contact email
                    <input
                      name="contactEmail"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                    />
                  </label>
                  <label>
                    Approximate number of items
                    <input
                      name="collectionSize"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={100000}
                      required
                    />
                  </label>
                  <label>
                    What are you planning?
                    <select
                      value={goal}
                      onChange={(event) =>
                        setGoal(event.target.value as Inquiry["goal"])
                      }
                    >
                      <option value="consign">Managed consignment</option>
                      <option value="fundraiser">Fundraising collection</option>
                    </select>
                  </label>
                  {goal === "fundraiser" && (
                    <label>
                      Proposed beneficiary <small>(optional)</small>
                      <input name="organization" maxLength={160} />
                    </label>
                  )}
                  <label>
                    About your collection
                    <textarea
                      name="details"
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={4}
                      placeholder="Types of items, condition, location, and preferred timing"
                    />
                  </label>
                  <button className="button" disabled={busy}>
                    {busy ? <Spinner /> : "Send request"}
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      </div>
      {user && !!requests.data?.items.length && (
        <section className="section">
          <div className="section-heading">
            <h2>Your requests</h2>
          </div>
          <div className="resale-requests">
            {requests.data.items.map((item) => (
              <article className="panel resale-request" key={item.id}>
                <div>
                  <h3>
                    {goalLabel[item.goal]} ·{" "}
                    {item.collectionSize.toLocaleString()} items
                  </h3>
                  <p className="muted">{time(item.createdAt)}</p>
                </div>
                <Status value={item.state} />
                {item.state === "submitted" && (
                  <button
                    className="button secondary"
                    type="button"
                    disabled={busy}
                    onClick={() => void withdraw(item.id)}
                  >
                    Withdraw request
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export function ResaleQueue() {
  const { user } = useApp();
  const [state, setState] = useState<Inquiry["state"]>("submitted");
  const [cursor, setCursor] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const queue = useResource<Page<Inquiry>>(
    user?.role === "admin"
      ? "/admin/resale/requests?state=" +
          state +
          (cursor ? "&cursor=" + encodeURIComponent(cursor) : "")
      : null,
  );
  if (user?.role !== "admin")
    return <PageTitle title="Operator access required" back="/" />;

  const review = async (requestId: string) => {
    setBusy(requestId);
    setError("");
    try {
      await api("/admin/resale/requests/" + requestId + "/review", "POST", {});
      setCursor("");
      queue.reload();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <PageTitle title="Managed resale requests" back="/admin" />
      <div className="tab-bar">
        {(["submitted", "reviewed", "withdrawn"] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={state === value ? "selected" : ""}
            aria-pressed={state === value}
            onClick={() => {
              setState(value);
              setCursor("");
              setError("");
            }}
          >
            {value === "submitted"
              ? "Pending"
              : value === "reviewed"
                ? "Reviewed"
                : "Withdrawn"}
          </button>
        ))}
      </div>
      {error && <ErrorBox error={error} />}
      {queue.loading ? (
        <Loading />
      ) : queue.error ? (
        <ErrorBox error={queue.error} retry={queue.reload} />
      ) : (
        <div className="resale-requests">
          {queue.data?.items.length ? (
            queue.data.items.map((item) => (
              <article className="panel" key={item.id}>
                <h3>
                  {goalLabel[item.goal]} ·{" "}
                  {item.collectionSize.toLocaleString()} items
                </h3>
                <p className="muted">
                  {item.contactEmail} · {time(item.createdAt)}
                </p>
                {item.organization && (
                  <p>Proposed beneficiary: {item.organization}</p>
                )}
                <p className="preserve-lines">{item.details}</p>
                {item.state === "submitted" && (
                  <button
                    className="button"
                    type="button"
                    disabled={!!busy}
                    onClick={() => void review(item.id)}
                  >
                    Mark reviewed
                  </button>
                )}
              </article>
            ))
          ) : (
            <p>No requests in this view.</p>
          )}
          <div className="actions">
            {cursor && (
              <button
                className="button secondary"
                type="button"
                onClick={() => setCursor("")}
              >
                First page
              </button>
            )}
            {queue.data?.nextCursor && (
              <button
                className="button secondary"
                type="button"
                onClick={() => setCursor(queue.data?.nextCursor || "")}
              >
                Next page
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
