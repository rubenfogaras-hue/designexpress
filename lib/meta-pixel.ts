/**
 * Thin wrapper around the Meta Pixel's `fbq`, which is installed in
 * `app/layout.tsx`.
 *
 * Everything here is deliberately forgiving: the pixel is loaded
 * `afterInteractive`, and an ad blocker can remove it entirely, so `fbq` may
 * simply not exist. Tracking must never break the order flow — a failed
 * beacon is worth less than a customer.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const OFFER_VALUE = 297;
export const OFFER_CURRENCY = "RON";

/** Fires a standard Meta event; silently does nothing if the pixel is absent. */
export function trackPixel(event: string, params?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    window.fbq("track", event, params);
  } catch {
    // A tracking failure must never surface to the customer.
  }
}
