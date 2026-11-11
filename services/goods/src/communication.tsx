import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Bell,
  Check,
  MessageCircle,
  Send,
  Flag,
  Ban,
} from "lucide-react";
import {
  api,
  requestId,
  time,
  type Conversation,
  type Message,
  type Notice,
  type Page,
} from "./api";
import {
  Avatar,
  Dialog,
  Empty,
  ErrorBox,
  Link,
  Loading,
  PageTitle,
  Photo,
  ReportButton,
  SignedOut,
  Spinner,
  Status,
  useApp,
  useResource,
} from "./ui";

export function Inbox({ id }: { id?: string }) {
  const { user, toast } = useApp();
  const [list, setList] = useState<Page<Conversation> | null>(null),
    [conversation, setConversation] = useState<Conversation | null>(null),
    [messages, setMessages] = useState<Message[]>([]),
    [next, setNext] = useState<string | null>(null),
    [older, setOlder] = useState(false),
    [body, setBody] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [messageError, setMessageError] = useState(""),
    [loading, setLoading] = useState(true),
    [loadingMessages, setLoadingMessages] = useState(!!id),
    [moreConversations, setMoreConversations] = useState(false);
  const sendKey = useRef(requestId());
  const end = useRef<HTMLDivElement>(null);
  const lastRead = useRef("");
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    const fetchList = () =>
      api<Page<Conversation>>("/conversations")
        .then((d) => {
          if (active) {
            setList((old) => ({
              items: [
                ...d.items,
                ...(old?.items.filter(
                  (i) => !d.items.some((j) => j.id === i.id),
                ) || []),
              ],
              nextCursor:
                old?.items.length && old.items.length > d.items.length
                  ? old.nextCursor
                  : d.nextCursor,
            }));
            setError("");
          }
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    void fetchList();
    const timer = setInterval(fetchList, 7000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [user?.id]);
  useEffect(() => {
    if (!user || !id) {
      setConversation(null);
      setMessages([]);
      setLoadingMessages(false);
      return;
    }
    let active = true;
    setLoadingMessages(true);
    setMessageError("");
    setMessages([]);
    lastRead.current = "";
    api<{ conversation: Conversation }>("/conversations/" + id)
      .then((d) => {
        if (active) setConversation(d.conversation);
      })
      .catch((e) => {
        if (active) setMessageError(e.message);
      });
    const load = (initial = false) =>
      api<Page<Message>>("/conversations/" + id + "/messages")
        .then((d) => {
          if (!active) return;
          setMessages((old) => {
            const latest = [
              ...old,
              ...d.items.filter((m) => !old.some((o) => o.id === m.id)),
            ];
            return latest.sort((a, b) =>
              a.createdAt.localeCompare(b.createdAt),
            );
          });
          if (initial) setNext(d.nextCursor);
          const key = d.items.at(-1)?.id || "empty";
          if (key !== lastRead.current) {
            lastRead.current = key;
            void api("/conversations/" + id + "/read", "POST", {})
              .then(() =>
                setList((old) =>
                  old
                    ? {
                        ...old,
                        items: old.items.map((c) =>
                          c.id === id ? { ...c, unreadCount: 0 } : c,
                        ),
                      }
                    : old,
                ),
              )
              .catch(() => {});
          }
          setMessageError("");
        })
        .catch((e) => {
          if (active) setMessageError(e.message);
        })
        .finally(() => {
          if (active) setLoadingMessages(false);
        });
    void load(true);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id, user?.id]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages.at(-1)?.id]);
  if (!user) return <SignedOut what="keep your conversations together" />;
  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !body.trim()) return;
    setBusy(true);
    setMessageError("");
    try {
      const d = await api<{ message: Message }>(
        "/conversations/" + id + "/messages",
        "POST",
        { body: body.trim(), clientRequestId: sendKey.current },
      );
      setMessages((old) =>
        old.some((m) => m.id === d.message.id) ? old : [...old, d.message],
      );
      setBody("");
      sendKey.current = requestId();
    } catch (e) {
      setMessageError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const loadOlder = async () => {
    if (!next || !id) return;
    setOlder(true);
    try {
      const d = await api<Page<Message>>(
        "/conversations/" + id + "/messages?cursor=" + encodeURIComponent(next),
      );
      setMessages((old) => [
        ...d.items.filter((m) => !old.some((o) => o.id === m.id)),
        ...old,
      ]);
      setNext(d.nextCursor);
    } catch (e) {
      setMessageError((e as Error).message);
    } finally {
      setOlder(false);
    }
  };
  const loadConversations = async () => {
    if (!list?.nextCursor) return;
    setMoreConversations(true);
    try {
      const d = await api<Page<Conversation>>(
        "/conversations?cursor=" + encodeURIComponent(list.nextCursor),
      );
      setList((old) =>
        old
          ? {
              items: [
                ...old.items,
                ...d.items.filter((c) => !old.items.some((o) => o.id === c.id)),
              ],
              nextCursor: d.nextCursor,
            }
          : d,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setMoreConversations(false);
    }
  };
  const block = async () => {
    if (!conversation) return;
    try {
      await api("/blocks", "POST", {
        userId: conversation.other.id,
        blocked: true,
      });
      toast("Account blocked. You can manage this in Settings.");
    } catch (e) {
      toast((e as Error).message);
    }
  };
  return (
    <>
      <PageTitle title="Inbox" />
      <div className={"inbox-layout " + (id ? "has-thread" : "")}>
        <aside className="conversation-list panel">
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorBox error={error} />
          ) : list?.items.length ? (
            <>
              {list.items.map((c) => (
                <Link
                  className={
                    "conversation-row " + (c.id === id ? "selected" : "")
                  }
                  to={"/inbox/" + c.id}
                  key={c.id}
                >
                  <Avatar profile={c.other} size={44} />
                  <div>
                    <strong>{c.other.name}</strong>
                    <span>
                      {c.lastMessage?.body || "Start the conversation"}
                    </span>
                    <small>
                      {c.tradeId
                        ? "Trade conversation"
                        : c.listing?.title || "Listing conversation"}
                    </small>
                  </div>
                  {c.unreadCount > 0 && (
                    <span
                      className="unread-dot"
                      aria-label={c.unreadCount + " unread messages"}
                    />
                  )}
                </Link>
              ))}
              {list.nextCursor && (
                <button
                  className="text-button full"
                  disabled={moreConversations}
                  onClick={loadConversations}
                >
                  {moreConversations ? <Spinner /> : "Older conversations"}
                </button>
              )}
            </>
          ) : (
            <Empty
              title="Say hello."
              body="Open any listing to message the seller, or start a trade to keep its conversation together."
              action={{ label: "Explore goods", to: "/explore" }}
            />
          )}
        </aside>
        <section className="message-panel panel">
          {!id ? (
            <Empty
              title="A good conversation starts here."
              body="Choose a conversation to pick up where you left off."
            />
          ) : (
            <>
              <div className="message-heading">
                <Link
                  to="/inbox"
                  className="icon-button mobile-thread-back"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={19} />
                </Link>
                {conversation ? (
                  <>
                    <Avatar profile={conversation.other} size={38} />
                    <Link to={"/sellers/" + conversation.other.id}>
                      <strong>{conversation.other.name}</strong>
                      <small>@{conversation.other.username}</small>
                    </Link>
                    <button
                      className="text-button block-message"
                      onClick={block}
                    >
                      Block
                    </button>
                  </>
                ) : (
                  <strong>Conversation</strong>
                )}
              </div>
              {conversation?.tradeId && (
                <Link
                  className="thread-context"
                  to={"/trades/" + conversation.tradeId}
                >
                  <ArrowLeftRight size={19} />
                  <span>View this exchange</span>
                  <ArrowRight size={16} />
                </Link>
              )}
              {conversation?.listing && (
                <Link
                  className="thread-context"
                  to={"/items/" + conversation.listing.id}
                >
                  <Photo listing={conversation.listing} />
                  <span>
                    <strong>{conversation.listing.code}</strong>{" "}
                    {conversation.listing.title}
                  </span>
                  <ArrowRight size={16} />
                </Link>
              )}
              <div
                className="message-history"
                role="log"
                aria-label="Conversation messages"
                aria-live="polite"
              >
                {loadingMessages ? (
                  <Loading />
                ) : (
                  <>
                    {next && (
                      <button
                        className="text-button full"
                        disabled={older}
                        onClick={loadOlder}
                      >
                        {older ? <Spinner /> : "Load earlier messages"}
                      </button>
                    )}
                    {!messages.length && !messageError && (
                      <div className="conversation-start">
                        <MessageCircle size={28} strokeWidth={1.2} />
                        <p>A friendly hello is a good place to start.</p>
                        <small>
                          Keep personal payment and address details private.
                        </small>
                      </div>
                    )}
                    {messages.map((m) => (
                      <div
                        className={
                          "message-row " +
                          (m.senderId === user.id ? "mine" : "")
                        }
                        key={m.id}
                      >
                        <div className="message-bubble">
                          <p>{m.body}</p>
                          <time>{time(m.createdAt)}</time>
                        </div>
                        <ReportButton targetType="message" targetId={m.id} />
                      </div>
                    ))}
                  </>
                )}
                <div ref={end} />
              </div>
              {messageError && (
                <div className="message-error">
                  <ErrorBox error={messageError} />
                </div>
              )}
              <form className="message-composer" onSubmit={send}>
                <textarea
                  aria-label="Message"
                  rows={2}
                  maxLength={2000}
                  placeholder="Write a message…"
                  value={body}
                  disabled={busy}
                  onChange={(e) => {
                    setBody(e.target.value);
                    sendKey.current = requestId();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(e);
                    }
                  }}
                />
                <button
                  className="button"
                  aria-label="Send message"
                  disabled={busy || !body.trim()}
                >
                  {busy ? <Spinner /> : <Send size={19} />}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </>
  );
}

export function Notifications() {
  const { user, go, toast } = useApp();
  const { data, error, loading, reload } = useResource<Page<Notice>>(
    user ? "/notifications" : null,
  );
  const [extra, setExtra] = useState<Notice[]>([]),
    [next, setNext] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setExtra([]);
    setNext(data?.nextCursor || null);
  }, [data]);
  if (!user) return <SignedOut what="see your notifications" />;
  const items = [...(data?.items || []), ...extra];
  const open = async (n: Notice) => {
    try {
      await api("/notifications/read", "POST", { ids: [n.id] });
    } catch (e) {
      toast((e as Error).message);
    }
    const href =
      n.href.startsWith("/") && !n.href.startsWith("//")
        ? n.href
        : "/notifications";
    go(href);
  };
  const markAll = async () => {
    setBusy(true);
    try {
      await api("/notifications/read", "POST", { all: true });
      reload();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const loadMore = async () => {
    if (!next) return;
    setBusy(true);
    try {
      const d = await api<Page<Notice>>(
        "/notifications?cursor=" + encodeURIComponent(next),
      );
      setExtra((v) => [...v, ...d.items]);
      setNext(d.nextCursor);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title="Notifications">
        {items.some((n) => !n.readAt) && (
          <button
            className="button secondary"
            disabled={busy}
            onClick={markAll}
          >
            <Check size={17} /> Mark all read
          </button>
        )}
      </PageTitle>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox error={error} retry={reload} />
      ) : items.length ? (
        <div className="notification-list">
          {items.map((n) => (
            <button
              className={"notification-row " + (!n.readAt ? "unread" : "")}
              key={n.id}
              onClick={() => open(n)}
            >
              <span className="notice-icon">
                <Bell size={21} strokeWidth={1.4} />
              </span>
              <div>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <time>{time(n.createdAt)}</time>
              </div>
              {!n.readAt && <span className="unread-dot" />}
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
      ) : (
        <Empty
          title="All quiet. All good."
          body="Trade offers, messages and updates about your shelf will appear here."
          action={{ label: "Explore goods", to: "/explore" }}
        />
      )}
      {next && (
        <button className="button secondary" disabled={busy} onClick={loadMore}>
          Load more updates
        </button>
      )}
    </>
  );
}
