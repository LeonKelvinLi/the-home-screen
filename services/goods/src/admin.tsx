import { useState } from "react";
import { Check, Shield, Search } from "lucide-react";
import { api, time, type Listing, type Profile, type Trade } from "./api";
import {
  Dialog,
  Empty,
  ErrorBox,
  Link,
  Loading,
  PageTitle,
  Spinner,
  Status,
  useApp,
  useResource,
} from "./ui";

type Report = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  context?: { text?: string };
};
export function Admin() {
  const { user, toast } = useApp();
  const { data, error, loading, reload } = useResource<{
    users: Profile[];
    reports: Report[];
    listings: Listing[];
    trades: Trade[];
  }>(user?.role === "admin" ? "/admin/overview" : null);
  const [tab, setTab] = useState("reports"),
    [action, setAction] = useState<{
      action: string;
      targetId: string;
      title: string;
    } | null>(null),
    [reason, setReason] = useState(""),
    [resolution, setResolution] = useState<"canceled" | "completed">(
      "canceled",
    ),
    [busy, setBusy] = useState(false),
    [actionError, setActionError] = useState("");
  if (user?.role !== "admin")
    return (
      <Empty
        title="Operator access required."
        body="This workspace is available to authorized marketplace operators."
        action={{ label: "Back to marketplace", to: "/explore" }}
      />
    );
  const choose = (type: string, id: string, title: string) => {
    setAction({ action: type, targetId: id, title });
    setReason("");
    setActionError("");
  };
  const send = async () => {
    if (!action) return;
    setBusy(true);
    setActionError("");
    try {
      await api("/admin/actions", "POST", {
        action: action.action,
        targetId: action.targetId,
        reason,
        ...(action.action === "resolve_trade" ? { resolution } : {}),
      });
      setAction(null);
      reload();
      toast("Operator action recorded.");
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title="Moderation">
        <span className="operator-label">
          <Shield size={17} /> Operator
        </span>
      </PageTitle>
      <p className="muted">
        Review concerns, protect the community and record the reason for every
        intervention.
      </p>
      <div className="tab-bar">
        {[
          ["reports", "Reports"],
          ["listings", "Listings"],
          ["users", "Accounts"],
          ["trades", "Trades"],
        ].map(([k, l]) => (
          <button
            className={tab === k ? "selected" : ""}
            key={k}
            onClick={() => setTab(k)}
          >
            {l}
          </button>
        ))}
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox error={error} retry={reload} />
      ) : (
        <div className="admin-list">
          {tab === "reports" &&
            (data?.reports.length ? (
              data.reports.map((r) => (
                <article className="panel admin-row" key={r.id}>
                  <div>
                    <Status value={r.status} />
                    <h3>
                      {r.targetType} · {r.targetId}
                    </h3>
                    <p>{r.reason}</p>
                    {r.context?.text && (
                      <div className="reported-context">
                        <strong>Reported content</strong>
                        <p className="preserve-lines">{r.context.text}</p>
                      </div>
                    )}
                    <small className="muted">{time(r.createdAt)}</small>
                  </div>
                  <button
                    className="button secondary compact"
                    disabled={r.status === "resolved"}
                    onClick={() =>
                      choose("resolve_report", r.id, "Resolve this report")
                    }
                  >
                    Resolve report
                  </button>
                </article>
              ))
            ) : (
              <Empty
                title="A clear queue."
                body="Reports from members will appear here for review."
              />
            ))}
          {tab === "listings" &&
            data?.listings.map((l) => (
              <article className="panel admin-row" key={l.id}>
                <div>
                  <Status value={l.status} />
                  <Link to={"/items/" + l.id}>
                    <h3>{l.title || "Untitled draft"}</h3>
                  </Link>
                  <small>
                    {l.owner.name} · {l.code}
                  </small>
                </div>
                <button
                  className="button secondary compact"
                  disabled={l.status === "hidden"}
                  onClick={() =>
                    choose("hide_listing", l.id, "Hide this listing")
                  }
                >
                  Hide listing
                </button>
              </article>
            ))}
          {tab === "users" &&
            data?.users.map((p) => (
              <article className="panel admin-row" key={p.id}>
                <div>
                  <h3>{p.name}</h3>
                  <span className="muted">@{p.username}</span>
                  {p.status && <Status value={p.status} />}
                </div>
                <div className="actions">
                  <button
                    className="button secondary compact"
                    disabled={p.id === user.id}
                    onClick={() =>
                      choose("restrict_user", p.id, "Restrict this account")
                    }
                  >
                    Restrict
                  </button>
                  <button
                    className="text-button"
                    onClick={() =>
                      choose("restore_user", p.id, "Restore this account")
                    }
                  >
                    Restore
                  </button>
                </div>
              </article>
            ))}
          {tab === "trades" &&
            data?.trades.map((t) => (
              <article className="panel admin-row" key={t.id}>
                <div>
                  <Status value={t.state} />
                  <h3>
                    {t.offered.title} ↔ {t.requested.title}
                  </h3>
                  <small>
                    {t.sender.name} · {t.recipient.name}
                  </small>
                  <p className="monospace small-copy">{t.id}</p>
                  <div className="small-copy">
                    {t.events?.map((e) => (
                      <div key={e.id}>
                        {time(e.createdAt)} · {e.action}
                        {e.reason ? " · " + e.reason : ""}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="button secondary compact"
                  disabled={!["accepted", "disputed"].includes(t.state)}
                  onClick={() =>
                    choose("resolve_trade", t.id, "Resolve this exchange")
                  }
                >
                  Record resolution
                </button>
              </article>
            ))}
        </div>
      )}
      {action && (
        <Dialog
          title={action.title}
          onClose={() => {
            if (!busy) setAction(null);
          }}
        >
          <p className="muted">
            This action will be recorded in the audit history. Review the source
            records before proceeding.
          </p>
          {action.action === "resolve_trade" && (
            <label>
              Resolution
              <select
                value={resolution}
                onChange={(e) =>
                  setResolution(e.target.value as typeof resolution)
                }
              >
                <option value="canceled">Cancel and release both items</option>
                <option value="completed">
                  Complete and archive both items
                </option>
              </select>
            </label>
          )}
          <label>
            Reason
            <textarea
              rows={4}
              value={reason}
              maxLength={2000}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
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
              disabled={busy || reason.trim().length < 5}
              onClick={send}
            >
              {busy ? <Spinner /> : <Check size={17} />} Record action
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
