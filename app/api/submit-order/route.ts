import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Needs the Node runtime (filesystem access for saving uploads).
export const runtime = "nodejs";

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 12 * 1024 * 1024; // 12 MB per photo
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Saves the customer's room photos + info before they're sent to Stripe's
 * Payment Link to pay. The Payment Link itself can't collect file uploads,
 * so we capture them here and hand back an orderId the customer's email is
 * tagged with (via client_reference_id) so the order can be matched up.
 */
export async function POST(req: NextRequest) {
  console.log("[submit-order] request received");
  try {
    const form = await req.formData();

    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const note = String(form.get("note") ?? "").trim().slice(0, 300);
    const consent = String(form.get("consent") ?? "") === "true";
    const photos = form.getAll("photos").filter((p): p is File => p instanceof File);

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
      if (!ALLOWED_TYPES.includes(photo.type)) {
        return NextResponse.json(
          { error: "Sunt acceptate doar imagini JPG sau PNG." },
          { status: 400 }
        );
      }
      if (photo.size > MAX_PHOTO_BYTES) {
        return NextResponse.json(
          { error: "O poză depășește limita de 12 MB." },
          { status: 400 }
        );
      }
    }

    const orderId = randomUUID();
    console.log(`[submit-order] order=${orderId} photos=${photos.length}`);

    // ── persist uploaded photos ──────────────────────────────────────
    // Stored locally under /uploads for this reference build. On Vercel the
    // filesystem is ephemeral/read-only, so a failure here must NOT block the
    // customer from paying — we log it and carry on. Production path:
    // Supabase Storage (matches the stack) or Vercel Blob / S3. See
    // project_specs.md.
    const savedPhotos: string[] = [];
    const dir = path.join(process.cwd(), "uploads", orderId);
    try {
      await mkdir(dir, { recursive: true });
      for (const photo of photos) {
        const safe = photo.name.replace(/[^\w.\-]+/g, "_").slice(-120) || "photo";
        const buffer = Buffer.from(await photo.arrayBuffer());
        await writeFile(path.join(dir, safe), buffer);
        savedPhotos.push(safe);
      }
    } catch (storageErr) {
      console.warn(`[submit-order] photo storage skipped (order=${orderId}):`, storageErr);
    }

    // Order record for follow-up (name, email, note, which photos came in).
    try {
      await mkdir(dir, { recursive: true });
      await writeFile(
        path.join(dir, "order.json"),
        JSON.stringify(
          { orderId, name, email, note, photos: savedPhotos, createdAt: new Date().toISOString() },
          null,
          2
        )
      );
    } catch (recordErr) {
      console.warn(`[submit-order] order record skipped (order=${orderId}):`, recordErr);
    }

    console.log(`[submit-order] done order=${orderId}`);
    return NextResponse.json({ orderId });
  } catch (err) {
    console.error("[submit-order] error:", err);
    return NextResponse.json(
      { error: "Nu am putut înregistra comanda. Te rugăm încearcă din nou." },
      { status: 500 }
    );
  }
}
