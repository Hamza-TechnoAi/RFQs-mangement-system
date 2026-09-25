export type Notification = { message: string; type: "success" | "error" };
const key = "rfq-notification";
export const notify = (message: string, type: Notification["type"] = "success") => {
  const detail = { message, type } satisfies Notification;
  sessionStorage.setItem(key, JSON.stringify(detail));
  window.dispatchEvent(new CustomEvent(key, { detail }));
};
export const takeNotification = (): Notification | null => {
  if (typeof window === "undefined") return null;
  try { const value = sessionStorage.getItem(key); sessionStorage.removeItem(key); return value ? JSON.parse(value) as Notification : null; } catch { return null; }
};
export const notificationEvent = key;
