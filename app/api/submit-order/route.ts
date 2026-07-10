import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// Needs the Node runtime (crypto + the Supabase admin client).
export const runtime = "nodejs";

const ROOM_KEYS = ["living", "bucatarie", "baie", "dormitor"];
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};
const BUCKET = "design-express-photos";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Registers the order (name/email/note) in Supabase and hands back a
 * short-lived signed URL per photo so the customer's browser can upload
 * the actual image bytes straight to Supabase Storage — never through
 * this route. That's deliberate: Vercel rejects any request body over
 * ~4.5MB, which real phone photos blow past easily.
 */
export async function POST(req: NextRequest) {
  console.log("[submit-order] request received");
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const note = String(body.note ?? "").trim().slice(0, 300);
    const consent = body.consent === true;
    const photos = Array.isArray(body.photos) ? body.photos : [];

    // ── validation ───────────────────────────────────────────────────
    if (!name) {
      return NextResponse.json({ error: "Numele este obligatoriu." }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Adresa de email nu este validă." }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json(
        { error: "Acordul de contact este necesar." },
        { status: 400 }
      );
    }
    if (photos.length === 0) {
      return NextResponse.json(
        { error: "Adaugă cel puțin o poză a camerei." },
        { status: 400 }
      );
    }
    if (photos.length > ROOM_KEYS.length) {
      return NextResponse.json(
        { error: `Poți încărca cel mult ${ROOM_KEYS.length} poze.` },
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
    console.log(`[submit-order] order=${orderId} photos=${photos.length}`);

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
      note,
      photo_paths: uploads.map((u) => u.path),
    });
    if (insertError) {
      console.error(`[submit-order] insert failed (order=${orderId}):`, insertError);
      return NextResponse.json(
        { error: "Nu am putut înregistra comanda. Te rugăm încearcă din nou." },
        { status: 500 }
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
