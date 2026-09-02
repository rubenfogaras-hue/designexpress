import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendConfirmationEmail } from "@/lib/email";
import { sendServerEvent } from "@/lib/meta-capi";

// Needs the Node runtime (crypto, SMTP, the Supabase admin client) and the
// raw request body — so no edge runtime and no body parsing before verifying.
export const runtime = "nodejs";

/**
 * Stripe pings this endpoint the moment a Payment Link checkout completes.
 * On a paid `checkout.session.completed` we look the order up by its
 * `client_reference_id` (= our orderId) and send the customer the
 * "we'll call you" confirmation email — exactly once.
 *
 * The signature is verified by hand with HMAC-SHA256 so the app needs only the
 * webhook signing secret (STRIPE_WEBHOOK_SECRET), never a Stripe API key.
 */

const TOLERANCE_SECONDS = 300;

function signatureValid(payload: string, header: string, secret: string): boolean {
  const parts: Record<string, string> = {};
  for (const piece of header.split(",")) {
    const [k, v] = piece.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  }
  const timestamp = parts["t"];
  const given = parts["v1"];
  if (!timestamp || !given) return false;

  // Reject stale timestamps to blunt replay attempts.
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  console.log("[stripe-webhook] request received");

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature") ?? "";
  const payload = await req.text(); // raw body — required for verification

  if (!signatureValid(payload, signature, secret)) {
    console.warn("[stripe-webhook] invalid signature — rejecting");
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  // Only act on a completed, paid checkout. Acknowledge everything else so
  // Stripe stops retrying.
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }
  const session = (event.data?.object ?? {}) as {
    client_reference_id?: string;
    payment_status?: string;
    customer_details?: { email?: string; name?: string; phone?: string };
    amount_total?: number;
    currency?: string;
  };
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const orderId = session.client_reference_id || "";
  const payerEmail = session.customer_details?.email || "";
  const payerName = session.customer_details?.name || "";

  try {
    const supabase = getSupabaseAdmin();

    // Look the order up so we can greet by name and dedupe the email. If there
    // is no row (unexpected), fall back to the payer's Stripe details.
    let toEmail = payerEmail;
    let name = payerName;
    let phone = session.customer_details?.phone || "";
    let alreadySent = false;
    let rowId: string | null = null;

    if (orderId) {
      const { data, error } = await supabase
        .from("design_express_clients")
        .select("id, name, email, phone, confirmation_email_sent")
        .eq("order_id", orderId)
        .maybeSingle();
      if (error) {
        console.error(`[stripe-webhook] lookup failed (order=${orderId}):`, error);
      } else if (data) {
        rowId = data.id as string;
        toEmail = (data.email as string) || toEmail;
        name = (data.name as string) || name;
        phone = (data.phone as string) || phone;
        alreadySent = data.confirmation_email_sent === true;
      }
    }

    if (alreadySent) {
      console.log(`[stripe-webhook] email already sent (order=${orderId}) — skipping`);
      return NextResponse.json({ received: true, deduped: true });
    }
    if (!toEmail) {
      console.error(`[stripe-webhook] no email to send to (order=${orderId})`);
      return NextResponse.json({ received: true });
    }

    await sendConfirmationEmail({ to: toEmail, name });
    console.log(`[stripe-webhook] confirmation email sent to ${toEmail} (order=${orderId})`);

    // Tell Meta the sale actually happened. The browser pixel never sees this —
    // payment completes on Stripe's domain — so this is the only honest source
    // of Purchase. It uses the amount Stripe really charged, which includes the
    // cross-sell when the customer took it. Failures are logged, never thrown:
    // the order is already complete and Stripe still needs its 200.
    const purchase = await sendServerEvent({
      eventName: "Purchase",
      // The order id doubles as the dedup key, so a Stripe retry counts once.
      eventId: orderId || (rowId ?? "unknown"),
      orderId: orderId || (rowId ?? "unknown"),
      email: toEmail,
      phone,
      name,
      value:
        typeof session.amount_total === "number"
          ? session.amount_total / 100
          : 497,
      currency: (session.currency || "ron").toUpperCase(),
    });
    console.log(
      `[stripe-webhook] Meta Purchase (order=${orderId}):`,
      purchase.sent ? "sent" : `not sent — ${purchase.detail}`,
    );

    // Mark it sent so Stripe's retries don't email the customer twice.
    if (rowId) {
      const { error: updateError } = await supabase
        .from("design_express_clients")
        .update({ confirmation_email_sent: true })
        .eq("id", rowId);
      if (updateError) {
        console.error(`[stripe-webhook] could not flag email sent (order=${orderId}):`, updateError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // Return 500 so Stripe retries — better a delayed email than none.
    console.error("[stripe-webhook] error:", err);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
