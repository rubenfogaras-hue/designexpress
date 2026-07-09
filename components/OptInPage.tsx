"use client";

import { useRef, useState, type CSSProperties } from "react";
import { CompassGlyph } from "./CompassGlyph";
import { Reveal } from "./Reveal";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

/* ────────────────────────────────────────────────────────────────────────
   Horizont Visuals — "Design Express" opt-in / order page.
   Editorial-luxury: warm ivory canvas, deep navy, a thread of antique gold.
   Cormorant Garamond for soul, Inter for clarity. All copy in Romanian.

   Flat offer: 247 lei for up to 5 room photos. The CTA:
     1. POSTs name/email/note/photo metadata (JSON, no file bytes) to
        /api/submit-order, which saves the order in Supabase and returns a
        signed upload URL per photo.
     2. Uploads each photo straight from the browser to Supabase Storage
        (bypasses Vercel's ~4.5MB request body limit).
     3. Sends the customer to the Stripe Payment Link to pay — Stripe
        handles the payment page and the confirmation after.
──────────────────────────────────────────────────────────────────────── */

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/14A9AMb1B4Zg50zfpV3F600";

const MAX_IMAGES = 5;
const NOTE_LIMIT = 300;
const NOTE_WARN = 270;

// Shared field style (exact brand values ported from the design).
const fieldStyle: CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-inter)",
  fontSize: 15,
  color: "#1a1d2c",
  background: "#faf6ee",
  border: "1px solid rgba(26,29,44,0.16)",
  borderRadius: 5,
  padding: "12px 13px",
};

const labelCaps: CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#7a7460",
  marginBottom: 7,
};

export default function OptInPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canAddImg = images.length < MAX_IMAGES;
  const noteColor = note.length >= NOTE_WARN ? "#b0492f" : "#9a8a64";
  const ctaLabel = submitting
    ? "Se redirecționează către plată…"
    : "Vreau redesignul meu — 247 lei";

  // ── image handling (up to 5, all included in the 49 €) ────────────────
  const addImages = (fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    const incoming = Array.from(fileList).filter((f) =>
      ["image/jpeg", "image/png"].includes(f.type)
    );
    setImages((prev) => [...prev, ...incoming].slice(0, MAX_IMAGES));
  };
  const removeImage = (i: number) =>
    setImages((prev) => prev.filter((_, x) => x !== i));

  const onNoteChange = (v: string) =>
    setNote(v.length > NOTE_LIMIT ? v.slice(0, NOTE_LIMIT) : v);

  const toggleConsent = () => {
    setConsent((c) => !c);
    setConsentError(false);
  };

  // ── submit → Stripe Checkout ──────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setConsentError(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          note,
          consent,
          photos: images.map((file) => ({ name: file.name, type: file.type })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || "Nu am putut înregistra comanda. Încearcă din nou."
        );
      }

      const { orderId, uploads } = await res.json();
      if (!orderId) throw new Error("Comanda nu a putut fi înregistrată.");

      // Upload each photo straight to Supabase Storage using the signed
      // URL we just got back — must finish before navigating away, since
      // leaving the page cancels any upload still in flight.
      if (uploads?.length) {
        const supabase = getSupabaseBrowser();
        await Promise.all(
          images.map((file, i) => {
            const upload = uploads[i];
            if (!upload) return Promise.resolve();
            return supabase.storage
              .from("design-express-photos")
              .uploadToSignedUrl(upload.path, upload.token, file);
          })
        );
      }

      // Hand off to Stripe's Payment Link to collect payment. Tagging the
      // order id + email lets us match the Stripe payment back to the
      // photos/note we just saved.
      const payUrl = new URL(STRIPE_PAYMENT_LINK);
      payUrl.searchParams.set("client_reference_id", orderId);
      payUrl.searchParams.set("prefilled_email", email);
      window.location.href = payUrl.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%" }}>
      {/* ── header / lockup ─────────────────────────────────────────── */}
      <header
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "26px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <CompassGlyph size={20} />
          <span
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 23,
              fontWeight: 600,
              color: "#1a1d2c",
              letterSpacing: "-0.01em",
            }}
          >
            Horizont{" "}
            <span style={{ fontStyle: "italic", fontWeight: 500 }}>Visuals</span>
          </span>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 15px",
            border: "1px solid rgba(176,138,74,0.45)",
            borderRadius: 9999,
            fontSize: 12.5,
            color: "#5a5340",
            letterSpacing: "0.01em",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#b08a4a",
              display: "inline-block",
            }}
          />
          Acum primim proiecte
        </div>
      </header>

      {/* ── hero ────────────────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "30px 32px clamp(64px,9vw,104px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(40px,6vw,76px)",
          alignItems: "flex-start",
        }}
      >
        {/* LEFT · the pitch */}
        <section style={{ flex: "1 1 430px", minWidth: 300 }}>
          <Reveal>
            <p
              style={{
                margin: "0 0 22px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#9a8a64",
              }}
            >
              Design express · În 1–2 zile
            </p>

            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-cormorant)",
                fontWeight: 500,
                color: "#1a1d2c",
                fontSize: "clamp(40px,6vw,72px)",
                lineHeight: 1.02,
                letterSpacing: "-0.018em",
              }}
            >
              Vezi interiorul nou,{" "}
              <span style={{ fontStyle: "italic", color: "#b08a4a" }}>
                fără să riști un leu.
              </span>
            </h1>

            <div
              style={{
                width: 72,
                height: 1,
                background: "rgba(176,138,74,0.55)",
                margin: "26px 0 24px",
              }}
            />

            <p
              style={{
                margin: 0,
                fontSize: "clamp(16px,1.6vw,18px)",
                lineHeight: 1.62,
                color: "#3d4255",
                maxWidth: "30em",
              }}
            >
              Vrei să renovezi, dar nu ești sigură cum poți avea atmosfera dorită?
              Trimite pozele și îți arăt camera ta, în stil clasic-contemporan, în
              1–2 zile.
            </p>

            <p
              style={{
                margin: "34px 0 0",
                fontFamily: "var(--font-cormorant)",
                fontWeight: 500,
                color: "#1a1d2c",
                fontSize: "clamp(30px,3.6vw,46px)",
                lineHeight: 1.04,
                letterSpacing: "-0.018em",
              }}
            >
              În mai puțin de&nbsp;
              <span style={{ fontStyle: "italic", color: "#b08a4a" }}>
                48 de ore.
              </span>
            </p>
          </Reveal>

          {/* before / after image */}
          <Reveal
            delay={80}
            style={{ position: "relative", marginTop: 42, maxWidth: 540 }}
          >
            <div
              className="hv-lift"
              style={{
                border: "1px solid rgba(26,29,44,0.1)",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 18px rgba(20,22,32,0.07)",
              }}
            >
              <HeroImage
                src="/assets/before.jpg"
                alt="Camera înainte"
                label="Înainte"
                labelPos="top"
                placeholderBg="#ddd3bf"
                withBottomBorder
              />
              <HeroImage
                src="/assets/after.jpg"
                alt="Camera după — stil clasic-contemporan"
                label="După"
                labelPos="bottom"
                placeholderBg="#efe7d6"
              />
            </div>

            {/* overlapping mini card */}
            <div
              style={{
                position: "absolute",
                right: -12,
                bottom: -22,
                maxWidth: 215,
                background: "#f0eadc",
                border: "1px solid rgba(176,138,74,0.45)",
                borderRadius: 10,
                padding: "15px 16px",
                boxShadow: "0 6px 22px rgba(20,22,32,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 7,
                }}
              >
                <CompassGlyph size={13} detailed={false} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#9a8a64",
                  }}
                >
                  DESIGNUL TĂU
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-cormorant)",
                  fontSize: 18,
                  color: "#1a1d2c",
                  lineHeight: 1.2,
                }}
              >
                Fotorealist, stil{" "}
                <span style={{ fontStyle: "italic" }}>clasic-contemporan</span>.
              </p>
            </div>
          </Reveal>

          <p
            style={{
              margin: "54px 0 0",
              fontSize: 13,
              color: "#8a8474",
              letterSpacing: "0.01em",
            }}
          >
            Concept vizual, nu plan de execuție ·&nbsp;
          </p>
        </section>

        {/* RIGHT · the offer card */}
        <aside style={{ flex: "1 1 392px", minWidth: 300, maxWidth: 470 }}>
          <Reveal
            as="form"
            delay={120}
            onSubmit={handleSubmit}
            noValidate
            style={{
              background: "#f0eadc",
              border: "1px solid rgba(176,138,74,0.45)",
              borderRadius: 12,
              padding: "clamp(24px,3vw,34px)",
              boxShadow: "0 8px 30px rgba(20,22,32,0.08)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "var(--font-cormorant)",
                fontWeight: 500,
                fontSize: 30,
                color: "#1a1d2c",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              Începe <span style={{ fontStyle: "italic" }}>acum</span>.{" "}
              <span style={{ fontStyle: "italic", color: "#b08a4a" }}>247 lei</span>.
            </h2>
            <p style={{ margin: "9px 0 0", fontSize: 13.5, color: "#8a8474" }}>
              Primești designul în 1–2 zile lucrătoare.
            </p>

            <div
              style={{
                height: 1,
                background: "rgba(26,29,44,0.1)",
                margin: "22px 0",
              }}
            />

            {/* name */}
            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={labelCaps}>Nume</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Numele tău"
                autoComplete="name"
                required
                className="hv-input"
                style={fieldStyle}
              />
            </label>

            {/* email */}
            <label style={{ display: "block", marginBottom: 18 }}>
              <span style={labelCaps}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adresa@email.com"
                autoComplete="email"
                required
                className="hv-input"
                style={fieldStyle}
              />
            </label>

            {/* photos */}
            <div
              style={{
                marginBottom: 6,
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#7a7460",
                }}
              >
                Fotografiile camerelor
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  color: "#9a8a64",
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                }}
              >
                {images.length}/5 incluse
              </span>
            </div>

            {/* multi-image dropzone · up to 5 room photos, all included */}
            {canAddImg && (
              <label
                className={`hv-dropzone${dragging ? " is-dragging" : ""}`}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  addImages(e.dataTransfer?.files ?? null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  cursor: "pointer",
                  border: "1px solid rgba(176,138,74,0.4)",
                  borderRadius: 8,
                  background: "#faf6ee",
                  padding: 16,
                  marginBottom: 10,
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={(e) => {
                    addImages(e.target.files);
                    e.target.value = "";
                  }}
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ flex: "none" }}
                >
                  <path
                    d="M12 16V4m0 0L8 8m4-4l4 4"
                    stroke="#b08a4a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    stroke="#b08a4a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span style={{ fontSize: 13, color: "#5a5340", lineHeight: 1.4 }}>
                  Trage pozele aici sau{" "}
                  <span
                    style={{
                      color: "#b08a4a",
                      textDecoration: "underline",
                      textUnderlineOffset: 2,
                    }}
                  >
                    alege
                  </span>{" "}
                  — până la 5<br />
                  <span style={{ fontSize: 11.5, color: "#9a8a64" }}>
                    JPG sau PNG · o poză pentru fiecare cameră
                  </span>
                </span>
              </label>
            )}

            {/* selected files */}
            {images.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  border: "1px solid rgba(176,138,74,0.5)",
                  borderRadius: 6,
                  background: "#f7f1e4",
                  padding: "11px 13px",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 13,
                    color: "#1a1d2c",
                    minWidth: 0,
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ flex: "none" }}
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="#b08a4a"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.name}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label={`Elimină ${file.name}`}
                  className="hv-remove"
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#9a8a64",
                    fontSize: 13,
                    flex: "none",
                    padding: "2px 4px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
                margin: "6px 0 18px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowTip((v) => !v)}
                className="hv-link"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  color: "#9a8a64",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                  padding: "4px 0",
                }}
              >
                Cum să fotografiezi corect?
              </button>
            </div>
            {showTip && (
              <p
                style={{
                  margin: "-8px 0 18px",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: "#5a5340",
                  background: "#ebe3d1",
                  borderLeft: "2px solid #b08a4a",
                  padding: "10px 13px",
                  borderRadius: "0 4px 4px 0",
                }}
              >
                Lumină bună, naturală. Fotografie din față, ține telefonul drept,
                cuprinde toată camera într-un singur cadru.
              </p>
            )}

            {/* note */}
            <label style={{ display: "block", marginBottom: 18 }}>
              <span style={labelCaps}>Mențiune / ce nu-ți place</span>
              <textarea
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                rows={3}
                placeholder="Ex: nu-mi place canapeaua maro, vreau ceva mai luminos…"
                className="hv-input"
                style={{
                  ...fieldStyle,
                  fontSize: 14,
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
              />
              <span
                style={{
                  display: "block",
                  textAlign: "right",
                  fontSize: 11.5,
                  marginTop: 5,
                  color: noteColor,
                }}
              >
                {note.length}/{NOTE_LIMIT}
              </span>
            </label>

            {/* consent */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 11,
                cursor: "pointer",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  flex: "none",
                  width: 19,
                  height: 19,
                  borderRadius: 4,
                  border: `1px solid ${
                    consent
                      ? "#1b2236"
                      : consentError
                        ? "#b0492f"
                        : "rgba(26,29,44,0.3)"
                  }`,
                  background: consent ? "#1b2236" : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 1,
                }}
              >
                {consent && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="#f6f1e8"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                checked={consent}
                onChange={toggleConsent}
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
              <span style={{ fontSize: 13, lineHeight: 1.45, color: "#3d4255" }}>
                Sunt de acord să fiu contactat în legătură cu designul meu.
              </span>
            </label>
            {consentError && (
              <p style={{ margin: "0 0 8px 30px", fontSize: 12, color: "#b0492f" }}>
                Te rugăm să bifezi acordul ca să continuăm.
              </p>
            )}

            {/* total + cta */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                margin: "18px 0 12px",
                paddingTop: 16,
                borderTop: "1px solid rgba(26,29,44,0.1)",
              }}
            >
              <span
                style={{ fontSize: 13, color: "#7a7460", letterSpacing: "0.02em" }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                  fontSize: 30,
                  color: "#1a1d2c",
                }}
              >
                247 lei
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="hv-cta"
              style={{
                width: "100%",
                fontFamily: "var(--font-inter)",
                fontSize: 15.5,
                fontWeight: 600,
                letterSpacing: "0.01em",
                cursor: "pointer",
                color: "#f6f1e8",
                background: "#1b2236",
                border: "1px solid #1b2236",
                borderRadius: 6,
                padding: "15px 18px",
              }}
            >
              {ctaLabel}
            </button>

            {error && (
              <p
                style={{
                  margin: "12px 0 0",
                  textAlign: "center",
                  fontSize: 12.5,
                  color: "#b0492f",
                }}
              >
                {error}
              </p>
            )}

            <p
              style={{
                margin: "13px 0 0",
                textAlign: "center",
                fontSize: 12,
                color: "#9a8a64",
                letterSpacing: "0.01em",
              }}
            >
              Plată securizată · Stripe · Fără abonament
            </p>
          </Reveal>

          <Reveal
            delay={160}
            style={{
              marginTop: 34,
              paddingTop: 30,
              borderTop: "1px solid rgba(176,138,74,0.3)",
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#9a8a64",
              }}
            >
              Ești la o decizie de casa ta de vis
            </p>
            <h3
              style={{
                margin: 0,
                fontFamily: "var(--font-cormorant)",
                fontWeight: 500,
                color: "#1a1d2c",
                fontSize: "clamp(30px,3.4vw,42px)",
                lineHeight: 1.03,
                letterSpacing: "-0.018em",
              }}
            >
              Construiți cu{" "}
              <span style={{ fontStyle: "italic", color: "#b08a4a" }}>stil.</span>
            </h3>
          </Reveal>
        </aside>
      </main>
    </div>
  );
}

/* ── before / after hero image ────────────────────────────────────────────
   Plain <img> so it degrades gracefully: if the photo file isn't in
   public/assets yet, we show a warm placeholder block (no broken icon).
   Drop your real before.jpg / after.jpg into public/assets and it just works. */
function HeroImage({
  src,
  alt,
  label,
  labelPos,
  placeholderBg,
  withBottomBorder = false,
}: {
  src: string;
  alt: string;
  label: string;
  labelPos: "top" | "bottom";
  placeholderBg: string;
  withBottomBorder?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const isTop = labelPos === "top";

  return (
    <div
      style={{
        position: "relative",
        borderBottom: withBottomBorder
          ? "1px solid rgba(26,29,44,0.08)"
          : undefined,
      }}
    >
      <div style={{ aspectRatio: "16 / 8", background: placeholderBg }}>
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
              color: "#8a7a52",
            }}
          >
            <CompassGlyph size={22} detailed={false} />
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {isTop ? "Adaugă before.jpg" : "Adaugă after.jpg"}
            </span>
          </div>
        )}
      </div>
      <span style={badgeStyle(labelPos)}>{label}</span>
    </div>
  );
}

// before / after badge (top = "Înainte", bottom = "După")
function badgeStyle(pos: "top" | "bottom"): CSSProperties {
  const isTop = pos === "top";
  return {
    position: "absolute",
    left: 14,
    ...(isTop ? { top: 14 } : { bottom: 14 }),
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: isTop ? "#5a5340" : "#1a1d2c",
    background: isTop ? "rgba(246,241,232,0.92)" : "rgba(246,241,232,0.94)",
    padding: "5px 11px",
    borderRadius: 9999,
    border: `1px solid rgba(176,138,74,${isTop ? 0.4 : 0.5})`,
  };
}
