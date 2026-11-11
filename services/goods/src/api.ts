import { sampleProductImages } from "./sample-products";

export const appBase = import.meta.env.BASE_URL.replace(/\/$/, "");
export function withoutBase(path: string): string {
  if (!appBase) return path || "/";
  if (path === appBase) return "/";
  if (path.startsWith(appBase + "/")) return path.slice(appBase.length);
  if (path.startsWith(appBase + "?") || path.startsWith(appBase + "#"))
    return "/" + path.slice(appBase.length);
  return path || "/";
}
export function withBase(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//") || !appBase) return path;
  if (
    path === appBase ||
    path.startsWith(appBase + "/") ||
    path.startsWith(appBase + "?") ||
    path.startsWith(appBase + "#")
  )
    return path;
  return appBase + path;
}

export interface Profile {
  id: string;
  isDemo?: boolean;
  name: string;
  username: string;
  bio: string;
  location: string;
  avatarUrl: string | null;
  createdAt: string;
  completedTrades: number;
  role?: string;
  email?: string;
  status?: string;
}
export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
}
export type ListingStatus =
  "draft" | "active" | "reserved" | "traded" | "archived" | "hidden";
export interface Listing {
  id: string;
  isDemo?: boolean;
  owner: Profile;
  code: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  priceCents: number | null;
  tradeEnabled: boolean;
  tradePreferences: string;
  status: ListingStatus;
  version: number;
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isHidden?: boolean;
}
export function listingPhotoUrl(
  listing: Listing,
  photo: Photo,
  thumbnail = false,
) {
  const sample = listing.isDemo && sampleProductImages[listing.id];
  if (sample && listing.photos[0]?.id === photo.id) {
    return withBase("/sample-products/" + sample + ".webp");
  }
  return (thumbnail && photo.thumbnailUrl) || photo.url;
}

export interface Slot {
  code: string;
  listing: Listing | null;
}
export interface Trade {
  id: string;
  sender: Profile;
  recipient: Profile;
  offered: Listing;
  requested: Listing;
  state: string;
  createdAt: string;
  expiresAt: string;
  confirmedBy: string[];
  cancelRequestedBy: string[];
  conversationId: string;
  events: {
    id: string;
    actorId: string;
    action: string;
    createdAt: string;
    reason?: string;
  }[];
}
export interface Conversation {
  id: string;
  other: Profile;
  listing: Listing | null;
  tradeId: string | null;
  lastMessage: { body: string; createdAt: string } | null;
  unreadCount: number;
}
export interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  clientRequestId: string;
}
export interface Notice {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  readAt: string | null;
}
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  unreadCount?: number;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(withBase("/api" + path), {
      method,
      credentials: "include",
      headers:
        body instanceof FormData
          ? undefined
          : { "Content-Type": "application/json" },
      body:
        body instanceof FormData
          ? body
          : body === undefined
            ? undefined
            : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Connection lost. Your changes have not been confirmed. Please try again.",
      0,
    );
  }
  const data = await response.json().catch(() => ({
    error: "The server could not complete this request. Please try again.",
  }));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/"))
      window.dispatchEvent(new Event("bsty:session-expired"));
    throw new ApiError(
      typeof data.error === "string"
        ? data.error
        : data.message || "This request could not be completed.",
      response.status,
      data.code,
    );
  }
  return data as T;
}
export const requestId = () => crypto.randomUUID();
export const money = (cents: number | null) =>
  cents == null
    ? "Open to trade"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: cents % 100 ? 2 : 0,
      }).format(cents / 100);
export const time = (date: string) =>
  new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
export const codeOf = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/^([A-Z])-?([123])$/, "$1-$2");
export const conditions = ["New", "Like new", "Good", "Fair", "Poor"];

const recentKey = (userId?: string) => "bsty-recent:" + (userId || "guest");
export function recentlyViewedIds(userId?: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(recentKey(userId)) || "[]");
    return Array.isArray(value)
      ? value
          .filter(
            (id): id is string =>
              typeof id === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(id),
          )
          .slice(0, 16)
      : [];
  } catch {
    return [];
  }
}
export function recordViewed(id: string, userId?: string) {
  try {
    localStorage.setItem(
      recentKey(userId),
      JSON.stringify(
        [id, ...recentlyViewedIds(userId).filter((v) => v !== id)].slice(0, 16),
      ),
    );
  } catch {
    /* Browsing remains available when device storage is disabled. */
  }
}
export function clearRecentlyViewed(userId?: string) {
  try {
    localStorage.removeItem(recentKey(userId));
  } catch {
    /* No stored history to clear. */
  }
}
