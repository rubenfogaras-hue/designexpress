import crypto from "node:crypto";

/**
 * Meta Conversions API — the Purchase event, sent server-side.
 *
 * The browser pixel cannot see a purchase: payment completes on Stripe's own
 * domain. This runs from the Stripe webhook, which is the only place that
 * knows money actually arrived, and it is verified by Stripe's signature
 * before we ever get here.
 *
 * Server-side also means ad blockers cannot remove it, and we can attach
 * hashed contact details so Meta can match the buyer back to the ad they saw.
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

export type PurchasePayload = {
  /** Our order id — also the deduplication key, so retries never double-count. */
  orderId: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  /** Actual amount paid, major units. Includes the cross-sell if they took it. */
  value: number;
  currency: string;
};

/**
 * Sends one Purchase event. Never throws and never blocks the webhook — a
 * missing analytics event is worth far less than a confirmed order, and Stripe
 * must still get its 200.
 */
export async function sendPurchaseEvent(
  payload: PurchasePayload,
): Promise<{ sent: boolean; detail?: string }> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;

  if (!pixelId || !token) {
    console.warn("[meta-capi] not configured — skipping Purchase");
    return { sent: false, detail: "not configured" };
  }

  const [first, ...rest] = (payload.name ?? "").trim().split(/\s+/);
  const userData: Record<string, string[]> = {};
  const em = payload.email ? hashEmail(payload.email) : null;
  const ph = payload.phone ? hashPhone(payload.phone) : null;
  const fn = first ? hashName(first) : null;
  const ln = rest.length ? hashName(rest.join(" ")) : null;
  if (em) userData.em = [em];
  if (ph) userData.ph = [ph];
  if (fn) userData.fn = [fn];
  if (ln) userData.ln = [ln];

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        // Same id on a Stripe retry, so Meta counts the purchase once.
        event_id: payload.orderId,
        action_source: "website",
        event_source_url: SOURCE_URL,
        user_data: userData,
        custom_data: {
          currency: payload.currency,
          value: payload.value,
          content_name: "Design Express",
          order_id: payload.orderId,
        },
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
      console.error("[meta-capi] Purchase rejected:", detail);
      return { sent: false, detail };
    }

    return { sent: (json.events_received ?? 0) > 0 };
  } catch (err) {
    console.error("[meta-capi] Purchase failed:", err);
    return { sent: false, detail: String(err) };
  }
}
