import crypto from "node:crypto";

/**
 * Meta Conversions API — server-side events.
 *
 * Two jobs:
 *
 *  1. `Purchase`, which the browser can never see: payment completes on
 *     Stripe's own domain.
 *  2. A server copy of the browser events (`Lead`, `InitiateCheckout`). Each
 *     pair shares an `event_id`, so Meta keeps whichever arrives and discards
 *     the duplicate. When an ad blocker kills the browser copy, the server one
 *     still lands — which is the coverage Meta's checklist asks for and the
 *     Event Setup Tool structurally cannot provide.
 *
 *   META_PIXEL_ID         the dataset id (public — it ships in the page too)
 *   META_CAPI_TOKEN       Events Manager -> Settings -> Conversions API
 *   META_TEST_EVENT_CODE  optional; routes events to the Test Events view
 */

const API_VERSION = "v21.0";
const SOURCE_URL = "https://designexpress.vercel.app";

/** Meta requires every identifier SHA-256 hashed, normalised first. */
function hash(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function hashEmail(email: string): string | null {
  const clean = email.trim().toLowerCase();
  return clean ? hash(clean) : null;
}

/**
 * Meta wants digits only, country code included. Romanian mobiles are entered
 * as 07xx xxx xxx, so the national leading zero becomes the 40 prefix.
 */
function hashPhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "40" + digits.slice(1);
  else if (!digits.startsWith("40") && digits.length <= 9) digits = "40" + digits;
  return hash(digits);
}

function hashName(part: string): string | null {
  const clean = part.trim().toLowerCase();
  return clean ? hash(clean) : null;
}

export type ServerEvent = {
  eventName: "Lead" | "InitiateCheckout" | "Purchase";
  /** Must match the browser event's eventID, or Meta counts it twice. */
  eventId: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  /** Meta's browser cookies, when the page managed to read them. */
  fbp?: string | null;
  fbc?: string | null;
  value?: number;
  currency?: string;
  orderId?: string | null;
};

/**
 * Sends one event. Never throws — a missing analytics event is worth far less
 * than the order it describes, and the caller (an API route or the Stripe
 * webhook) must finish its real work regardless.
 */
export async function sendServerEvent(
  event: ServerEvent,
): Promise<{ sent: boolean; detail?: string }> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;

  if (!pixelId || !token) {
    console.warn(`[meta-capi] not configured — skipping ${event.eventName}`);
    return { sent: false, detail: "not configured" };
  }

  const [first, ...rest] = (event.name ?? "").trim().split(/\s+/);
  const userData: Record<string, unknown> = {};
  const em = event.email ? hashEmail(event.email) : null;
  const ph = event.phone ? hashPhone(event.phone) : null;
  const fn = first ? hashName(first) : null;
  const ln = rest.length ? hashName(rest.join(" ")) : null;
  if (em) userData.em = [em];
  if (ph) userData.ph = [ph];
  if (fn) userData.fn = [fn];
  if (ln) userData.ln = [ln];
  // Not hashed — Meta matches these two verbatim.
  if (event.fbp) userData.fbp = event.fbp;
  if (event.fbc) userData.fbc = event.fbc;

  const customData: Record<string, unknown> = { content_name: "Design Express" };
  if (typeof event.value === "number") customData.value = event.value;
  if (event.currency) customData.currency = event.currency;
  if (event.orderId) customData.order_id = event.orderId;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: "website",
        event_source_url: SOURCE_URL,
        user_data: userData,
        custom_data: customData,
      },
    ],
    access_token: token,
  };

  if (process.env.META_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const json = (await res.json()) as {
      events_received?: number;
      error?: { message?: string };
    };

    if (!res.ok || json.error) {
      const detail = json.error?.message || `HTTP ${res.status}`;
      console.error(`[meta-capi] ${event.eventName} rejected:`, detail);
      return { sent: false, detail };
    }

    return { sent: (json.events_received ?? 0) > 0 };
  } catch (err) {
    console.error(`[meta-capi] ${event.eventName} failed:`, err);
    return { sent: false, detail: String(err) };
  }
}
