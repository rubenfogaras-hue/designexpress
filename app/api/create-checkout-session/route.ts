import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStripe } from "@/lib/stripe";

// Needs the Node runtime (Stripe SDK + filesystem for saving uploads).
export const runtime = "nodejs";

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 12 * 1024 * 1024; // 12 MB per photo
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
// Fallback amount in minor units (247 lei = 24700 bani). Used only when no
// STRIPE_PRICE_ID is set — e.g. in test mode, where the live price doesn't exist.
const PRICE_MINOR = Number(process.env.DESIGN_EXPRESS_PRICE_MINOR ?? 24700);
const PRICE_CURRENCY = (process.env.DESIGN_EXPRESS_CURRENCY ?? "ron").toLowerCase();
// Preferred: charge the pre-made Stripe Product's price (set STRIPE_PRICE_ID).
const PRICE_ID = process.env.STRIPE_PRICE_ID;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function baseUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  console.log("[create-checkout-session] request received");
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
    console.log(`[create-checkout-session] order=${orderId} photos=${photos.length}`);

    // ── persist uploaded photos ──────────────────────────────────────
    // Stored locally under /uploads for this reference build. On Vercel the
    // filesystem is ephemeral/read-only, so a failure here must NOT block the
    // payment — we log it and carry on. Production path: Supabase Storage
    // (matches the stack) or Vercel Blob / S3. See project_specs.md.
    const savedPhotos: string[] = [];
    if (photos.length) {
      try {
        const dir = path.join(process.cwd(), "uploads", orderId);
        await mkdir(dir, { recursive: true });
        for (const photo of photos) {
          const safe = photo.name.replace(/[^\w.\-]+/g, "_").slice(-120) || "photo";
          const buffer = Buffer.from(await photo.arrayBuffer());
          await writeFile(path.join(dir, safe), buffer);
          savedPhotos.push(safe);
        }
      } catch (storageErr) {
        console.warn(
          `[create-checkout-session] photo storage skipped (order=${orderId}):`,
          storageErr
        );
      }
    }

    // ── create Stripe Checkout session ───────────────────────────────
    const stripe = getStripe();
    const base = baseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Explicit so Checkout doesn't rely on auto payment-method detection
      // (which errors if none are pre-activated for the currency).
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        PRICE_ID
          ? { price: PRICE_ID, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: PRICE_CURRENCY,
                unit_amount: PRICE_MINOR,
                product_data: {
                  name: "Design Express - Horizont Visuals",
                  description:
                    "Render fotorealist in stil clasic-contemporan pentru pana la 5 camere, in 1-2 zile lucratoare.",
                },
              },
            },
      ],
      metadata: {
        orderId,
        name,
        photos: String(savedPhotos.length),
        note: note.slice(0, 480),
      },
      success_url: `${base}/multumire?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/?checkout=cancelled`,
    });

    // Attach a lightweight order record next to the photos for follow-up.
    try {
      const dir = path.join(process.cwd(), "uploads", orderId);
      await mkdir(dir, { recursive: true });
      await writeFile(
        path.join(dir, "order.json"),
        JSON.stringify(
          {
            orderId,
            name,
            email,
            note,
            photos: savedPhotos,
            sessionId: session.id,
            createdAt: new Date().toISOString(),
          },
          null,
          2
        )
      );
    } catch (recordErr) {
      console.warn(
        `[create-checkout-session] order record skipped (order=${orderId}):`,
        recordErr
      );
    }

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe nu a returnat un URL de plată." },
        { status: 502 }
      );
    }

    console.log(
      `[create-checkout-session] done order=${orderId} session=${session.id}`
    );
    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Log the real cause for debugging; return a clean, on-brand message.
    console.error("[create-checkout-session] error:", err);
    return NextResponse.json(
      { error: "Nu am putut iniția plata. Te rugăm încearcă din nou." },
      { status: 500 }
    );
  }
}
