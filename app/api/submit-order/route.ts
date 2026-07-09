import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// Needs the Node runtime (crypto + the Supabase admin client).
export const runtime = "nodejs";

const MAX_PHOTOS = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
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
    if (photos.length > MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Poți încărca cel mult ${MAX_PHOTOS} poze.` },
        { status: 400 }
      );
    }
    for (const photo of photos) {
      const type = String(photo?.type ?? "");
      if (!ALLOWED_TYPES.includes(type)) {
        return NextResponse.json(
          { error: "Sunt acceptate doar imagini JPG sau PNG." },
          { status: 400 }
        );
      }
    }

    const orderId = randomUUID();
    console.log(`[submit-order] order=${orderId} photos=${photos.length}`);

    const supabase = getSupabaseAdmin();

    // ── one signed upload URL per photo ────────────────────────────────
    const uploads: { path: string; token: string; name: string }[] = [];
    for (const photo of photos) {
      const safeName =
        String(photo.name ?? "photo").replace(/[^\w.\-]+/g, "_").slice(-120) || "photo";
      const path = `${orderId}/${safeName}`;
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
      uploads.push({ path, token: data.token, name: safeName });
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
