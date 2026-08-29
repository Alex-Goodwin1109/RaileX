/** Browser notification helpers with graceful fallbacks. */

export type NotifyResult = "shown" | "denied" | "unsupported" | "failed";

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function ensureNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "default") {
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  }
  return Notification.permission;
}

/**
 * Shows a real browser notification. Falls back to a service-worker notification
 * when the Notification constructor is unavailable (some mobile browsers).
 */
export async function showBrowserNotification(
  title: string,
  options: NotificationOptions = {},
): Promise<NotifyResult> {
  const permission = await ensureNotificationPermission();
  if (permission === "unsupported") return "unsupported";
  if (permission !== "granted") return "denied";

  const payload: NotificationOptions = { icon: "/favicon.png", badge: "/favicon.png", ...options };

  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg?.showNotification) {
      await reg.showNotification(title, payload);
      return "shown";
    }
  } catch {
    /* fall through to the constructor */
  }

  try {
    const n = new Notification(title, payload);
    n.onclick = () => {
      window.focus();
      n.close();
    };
    return "shown";
  } catch {
    return "failed";
  }
}
