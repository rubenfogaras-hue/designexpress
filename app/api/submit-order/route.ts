import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendServerEvent } from "@/lib/meta-capi";

// Needs the Node runtime (crypto + the Supabase admin client).
export const runtime = "nodejs";

const ROOM_KEYS = ["camera1", "camera2"];
const QUESTION_KEYS = ["q1", "q2", "q3"];
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};
const BUCKET = "design-express-photos";
const NOTE_LIMIT = 300;
const ANSWER_LIMIT = 200;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Keep only the six known question keys, as trimmed strings. */
function cleanAnswers(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const key of QUESTION_KEYS) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      out[key] = value.trim().slice(0, ANSWER_LIMIT);
    }
  }
  return out;
}

/**
 * Registers the order (contact details, answers, note) in Supabase and hands
 * back a short-lived signed URL per photo so the customer's browser can upload
 * the image bytes straight to Supabase Storage — never through this route.
 * That's deliberate: Vercel rejects any request body over ~4.5MB, which real
 * phone photos blow past easily.
 */
export async function POST(req: NextRequest) {
  console.log("[submit-order] request received");
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const note = String(body.note ?? "").trim().slice(0, NOTE_LIMIT);
    const consent = body.consent === true;
    const answers = cleanAnswers(body.answers);
    const branch = body.branch === "green" ? "green" : "red";
    const photos = Array.isArray(body.photos) ? body.photos : [];

    // ── validation ───────────────────────────────────────────────────
    if (!name) {
      return NextResponse.json({ error: "Numele este obligatoriu." }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Adresa de email nu este validă." }, { status: 400 });
    }
    if (phone.replace(/[^0-9]/g, "").length < 9) {
      return NextResponse.json(
        { error: "Introdu un număr de telefon valid." },
        { status: 400 }
      );
    }
    if (!consent) {
      return NextResponse.json(
        { error: "Acordul de contact este necesar." },
        { status: 400 }
      );
    }
    // Both rooms are required — there is nothing to render without them.
    if (photos.length !== ROOM_KEYS.length) {
      return NextResponse.json(
        { error: `Sunt necesare toate cele ${ROOM_KEYS.length} poze.` },
        { status: 400 }
      );
    }

    const seenRooms = new Set<string>();
    for (const photo of photos) {
      const room = String(photo?.room ?? "");
      const type = String(photo?.type ?? "");
      if (!ROOM_KEYS.includes(room) || seenRooms.has(room)) {
        return NextResponse.json(
          { error: "Cameră necunoscută sau duplicată pentru o poză." },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES[type]) {
        return NextResponse.json(
          { error: "Sunt acceptate doar imagini JPG sau PNG." },
          { status: 400 }
        );
      }
      seenRooms.add(room);
    }

    const orderId = randomUUID();
    console.log(
      `[submit-order] order=${orderId} photos=${photos.length} branch=${branch}`
    );

    const supabase = getSupabaseAdmin();

    // ── one signed upload URL per photo, named after its room ──────────
    const uploads: { path: string; token: string; room: string }[] = [];
    for (const photo of photos) {
      const room = String(photo.room);
      const ext = ALLOWED_TYPES[String(photo.type)];
      const path = `${orderId}/${room}${ext}`;
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUploadUrl(path);
      if (error || !data) {
        console.error(`[submit-order] signed URL failed (order=${orderId}):`, error);
        return NextResponse.json(
          { error: "Nu am putut pregăti încărcarea pozelor." },
          { status: 502 }
        );
      }
      uploads.push({ path, token: data.token, room });
    }

    // ── save the order record ───────────────────────────────────────
    const { error: insertError } = await supabase.from("design_express_clients").insert({
      order_id: orderId,
      name,
      email,
      phone,
      note,
      answers,
      branch,
      photo_paths: uploads.map((u) => u.path),
    });
    if (insertError) {
      console.error(`[submit-order] insert failed (order=${orderId}):`, insertError);
      return NextResponse.json(
        { error: "Nu am putut înregistra comanda. Te rugăm încearcă din nou." },
        { status: 500 }
      );
    }

    // Server copies of the two browser events, carrying the same ids the
    // wizard used. Meta discards whichever duplicate arrives second, so an
    // ad-blocked browser event still gets counted. Failures are logged only:
    // the order is saved and the customer must not be held up for analytics.
    const tracking = (body.tracking ?? {}) as {
      leadEventId?: string;
      checkoutEventId?: string;
      fbp?: string | null;
      fbc?: string | null;
    };
    if (tracking.leadEventId || tracking.checkoutEventId) {
      const shared = {
        email,
        phone,
        name,
        fbp: tracking.fbp ?? null,
        fbc: tracking.fbc ?? null,
        value: 497,
        currency: "RON",
        orderId,
      };
      const [lead, checkout] = await Promise.all([
        tracking.leadEventId
          ? sendServerEvent({
              ...shared,
              eventName: "Lead" as const,
              eventId: tracking.leadEventId,
            })
          : Promise.resolve({ sent: false }),
        tracking.checkoutEventId
          ? sendServerEvent({
              ...shared,
              eventName: "InitiateCheckout" as const,
              eventId: tracking.checkoutEventId,
            })
          : Promise.resolve({ sent: false }),
      ]);
      console.log(
        `[submit-order] Meta server events (order=${orderId}): Lead=${lead.sent} InitiateCheckout=${checkout.sent}`,
      );
    }

    console.log(`[submit-order] done order=${orderId}`);
    return NextResponse.json({ orderId, uploads });
  } catch (err) {
    console.error("[submit-order] error:", err);
    return NextResponse.json(
      { error: "Nu am putut înregistra comanda. Te rugăm încearcă din nou." },
      { status: 500 }
    );
  }
}
