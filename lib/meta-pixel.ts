/**
 * Browser side of the Meta pixel.
 *
 * Events are defined here rather than in Meta's Event Setup Tool for two
 * reasons: that tool matches on button text, which breaks silently whenever a
 * label is reworded, and it cannot attach the `eventID` needed to deduplicate
 * against the server copy.
 *
 * The base pixel is installed in `app/layout.tsx`.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const OFFER_VALUE = 497;
export const OFFER_CURRENCY = "RON";

/** A shared id lets Meta discard the duplicate when both copies arrive. */
export function newEventId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `e-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Fires a standard event. Silently does nothing when `fbq` is absent — a good
 * share of visitors block it, and tracking must never break the order flow.
 */
export function trackPixel(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  try {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    if (eventId) window.fbq("track", event, params ?? {}, { eventID: eventId });
    else window.fbq("track", event, params ?? {});
  } catch {
    // A tracking failure must never surface to the customer.
  }
}

/**
 * Reads Meta's own cookies so the server copy can be attributed to the same
 * browser and, via `_fbc`, to the ad that brought them. Without these, a
 * server event is much harder for Meta to tie back to a specific ad.
 */
export function readMetaCookies(): { fbp: string | null; fbc: string | null } {
  try {
    if (typeof document === "undefined") return { fbp: null, fbc: null };
    const read = (key: string) =>
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${key}=`))
        ?.split("=")[1] ?? null;
    return { fbp: read("_fbp"), fbc: read("_fbc") };
  } catch {
    return { fbp: null, fbc: null };
  }
}
