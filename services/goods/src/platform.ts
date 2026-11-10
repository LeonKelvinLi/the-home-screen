import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Share } from "@capacitor/share";

export async function shareUrl(url: string, title: string) {
  if (Capacitor.isNativePlatform()) {
    await Share.share({ title, url, dialogTitle: "Share this find" });
    return "shared";
  }
  if (navigator.share) {
    await navigator.share({ title, url });
    return "shared";
  }
  if (!navigator.clipboard)
    throw new Error(
      "Sharing is unavailable in this browser. Copy the page address to share it.",
    );
  await navigator.clipboard.writeText(url);
  return "copied";
}

/** Returns cleanup; only approved same-origin deep links become client routes. */
export async function initNativeNavigation(navigate: (path: string) => void) {
  if (!Capacitor.isNativePlatform()) return () => {};
  const links = await App.addListener("appUrlOpen", ({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.origin === location.origin)
        navigate(parsed.pathname + parsed.search);
    } catch {
      /* Malformed external links must not navigate the webview. */
    }
  });
  const back = await App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) history.back();
    else if (Capacitor.getPlatform() === "android") void App.minimizeApp();
  });
  const foreground = await App.addListener("appStateChange", ({ isActive }) => {
    if (isActive) window.dispatchEvent(new Event("bsty:resume"));
  });
  return () => {
    void links.remove();
    void back.remove();
    void foreground.remove();
  };
}
