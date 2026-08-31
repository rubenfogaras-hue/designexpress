"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { PhotoTipsModal } from "./PhotoTipsModal";

/* ────────────────────────────────────────────────────────────────────────
   The three-step order wizard.

   1. All four room photos (every one required).
   2. Three qualifying questions, asked one at a time, plus an optional note.
   3. Name, email, phone, consent — then pay.

   On submit it POSTs the order to /api/submit-order, uploads the four photos
   straight to Supabase Storage with the signed URLs it gets back, and only
   then hands off to the Stripe Payment Link. Uploads must finish first:
   navigating away cancels anything still in flight.
──────────────────────────────────────────────────────────────────────── */

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/6oU5kw5HhbnEakT5Pl3F602";
const BUCKET = "design-express-photos";
const NOTE_LIMIT = 300;

/* Deliberately generic. The slots used to be Living / Bucătărie / Dormitor /
   Baie, which turned people away when the rooms they wanted redesigned were a
   dining room, an office or two bedrooms. Four slots, any four rooms. */
const ROOMS = [
  { key: "camera1", label: "Camera 1" },
  { key: "camera2", label: "Camera 2" },
  { key: "camera3", label: "Camera 3" },
  { key: "camera4", label: "Camera 4" },
] as const;
type RoomKey = (typeof ROOMS)[number]["key"];

/** Matches ANSWER_LIMIT in /api/submit-order, which truncates at 200. */
const ANSWER_LIMIT = 200;

type Question =
  | {
      id: string;
      num: string;
      label: string;
      kind: "choice";
      opts: readonly string[];
    }
  | { id: string; num: string; label: string; kind: "text"; placeholder: string };

const QUESTIONS: readonly Question[] = [
  {
    id: "q1",
    num: "01",
    kind: "choice",
    label: "În ce etapă sunteți?",
    opts: [
      "Căutăm încă locuința potrivită",
      "Am cumpărat. Acum facem planuri",
      "Începem lucrările în 1–3 luni",
      "Suntem deja la jumătatea șantierului — și e haos",
    ],
  },
  {
    // Free text: the answers here are too varied to put in a list, and what
    // people write in their own words is more useful on the call.
    id: "q2",
    num: "02",
    kind: "text",
    label: "V-ați gândit la un stil anume sau o atmosferă pentru noul interior?",
    placeholder: "Ex: minimalist cald, mult lemn și tonuri naturale.",
  },
  {
    id: "q3",
    num: "03",
    kind: "choice",
    label: "Ce regret vreți să evitați cel mai mult?",
    opts: [
      "Să cheltui de două ori",
      "Să întârzii mutarea",
      "Să arate demodat după 3 ani",
      "Să mă cert cu partenerul",
    ],
  },
];

const STEP_TITLES: Record<number, string> = {
  1: "Cele patru camere",
  2: "Câteva întrebări",
  3: "Date & plată",
};

const labelCaps: CSSProperties = {
  display: "block",
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 8,
  fontWeight: 500,
};

const inputBase: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "var(--font-sans)",
  fontSize: 15,
  color: "var(--ink)",
  padding: "13px 15px",
  borderRadius: "var(--radius-md)",
  background: "var(--canvas)",
  outline: "none",
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneDigits = (v: string) => v.replace(/[^0-9]/g, "");

type Picked = { file: File; url: string };

export function Wizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<Partial<Record<RoomKey, Picked>>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [qIndex, setQIndex] = useState(0);
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Object URLs are revoked on unmount; a ref keeps the latest set reachable
  // from the cleanup without re-running it on every pick.
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(
    () => () =>
      Object.values(photosRef.current).forEach(
        (p) => p && URL.revokeObjectURL(p.url)
      ),
    []
  );

  // Escape closes the wizard; body scroll is locked while it's open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const photoCount = ROOMS.filter((r) => photos[r.key]).length;
  const allPhotos = photoCount === ROOMS.length;
  const allAnswered = qIndex >= QUESTIONS.length;

  const emailInvalid = email.length > 0 && !isEmail(email);
  const phoneInvalid = phone.length > 0 && phoneDigits(phone).length < 9;
  const canPay =
    name.trim().length > 0 &&
    isEmail(email) &&
    phoneDigits(phone).length >= 9 &&
    consent;

  const pickPhoto = (room: RoomKey, file: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Sunt acceptate doar imagini JPG sau PNG.");
      return;
    }
    setError(null);
    setPhotos((prev) => {
      prev[room] && URL.revokeObjectURL(prev[room]!.url);
      return { ...prev, [room]: { file, url: URL.createObjectURL(file) } };
    });
  };

  const answer = (id: string, value: string, index: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setQIndex((i) => (index === i ? i + 1 : i));
  };

  /** Free-text answers are typed, so they are stored without advancing. */
  const typeAnswer = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value.slice(0, ANSWER_LIMIT) }));

  const back = () => {
    if (step === 2) {
      if (qIndex > 0) setQIndex((i) => i - 1);
      else setStep(1);
      return;
    }
    if (step === 3) setStep(2);
  };

  const submit = async () => {
    if (!canPay || submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const selected = ROOMS.filter((r) => photos[r.key]).map((r) => ({
        room: r.key,
        file: photos[r.key]!.file,
      }));

      // The green/red split was derived from the old budget question (q4),
      // which the questionnaire no longer asks. Nothing is sent, so the API
      // falls back to its "red" default until a new signal replaces it.
      const res = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          note,
          consent,
          answers,
          photos: selected.map(({ room, file }) => ({ room, type: file.type })),
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


      const supabase = getSupabaseBrowser();
      const results = await Promise.all(
        selected.map(({ file }, i) => {
          const upload = uploads?.[i];
          if (!upload) return Promise.resolve({ error: null });
          return supabase.storage
            .from(BUCKET)
            .uploadToSignedUrl(upload.path, upload.token, file);
        })
      );
      // Never send someone to pay for an order whose photos didn't land.
      if (results.some((r) => r?.error)) {
        throw new Error(
          "Pozele nu au putut fi încărcate. Verifică semnalul și încearcă din nou."
        );
      }


      const payUrl = new URL(STRIPE_PAYMENT_LINK);
      payUrl.searchParams.set("client_reference_id", orderId);
      payUrl.searchParams.set("prefilled_email", email);
      window.location.href = payUrl.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setSubmitting(false);
    }
  };

  const current = QUESTIONS[Math.min(qIndex, QUESTIONS.length - 1)];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(19,24,41,0.55)",
          overflowY: "auto",
          padding: "clamp(16px,4vw,56px)",
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Comandă Design Express"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: 640, margin: "0 auto" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                color: "var(--on-dark)",
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              <span style={{ color: "var(--gold-300)" }}>Începe acum</span> — 297
              lei.
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Închide"
              className="hv-dark-hover"
              style={{
                background: "none",
                border: "none",
                fontSize: 30,
                lineHeight: 1,
                color: "var(--on-dark-soft)",
                cursor: "pointer",
                padding: 0,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              border: "1px solid var(--hairline)",
              borderRadius: "var(--radius-xl)",
              background: "var(--canvas)",
              overflow: "hidden",
            }}
          >
            {/* progress */}
            <div style={{ padding: "22px clamp(20px,4vw,36px) 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: "var(--type-overline-size)",
                    letterSpacing: "var(--type-overline-tracking)",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    fontWeight: 500,
                  }}
                >
                  Pasul {step} din 3
                </span>
                <span
                  style={{
                    fontSize: "var(--type-overline-size)",
                    letterSpacing: "var(--type-overline-tracking)",
                    textTransform: "uppercase",
                    color: "var(--muted-soft)",
                    fontWeight: 500,
                  }}
                >
                  {STEP_TITLES[step]}
                </span>
              </div>
              <div
                style={{
                  height: 2,
                  background: "var(--hairline)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(step / 3) * 100}%`,
                    height: "100%",
                    background: "var(--gold)",
                    transition: "width var(--dur-base) var(--ease)",
                  }}
                />
              </div>
            </div>

            <div style={{ padding: "clamp(24px,4vw,40px)" }}>
              {/* ── STEP 1 · photos ─────────────────────────────────── */}
              {step === 1 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontWeight: 500,
                        fontSize: 26,
                        color: "var(--ink)",
                        margin: 0,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Cele patru camere
                    </h3>
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        fontFamily: "var(--font-serif)",
                        fontStyle: "italic",
                      }}
                    >
                      {photoCount}/4 incluse
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "var(--body)",
                      fontSize: 15,
                      lineHeight: 1.55,
                    }}
                  >
                    Orice patru camere vrei — living, dining, dormitor,
                    birou, baie. Toate patru sunt necesare.{" "}
                    <button
                      type="button"
                      onClick={() => setTipsOpen(true)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        font: "inherit",
                        color: "var(--ink)",
                        borderBottom: "1px solid var(--gold)",
                        cursor: "pointer",
                      }}
                    >
                      Cum să fotografiez corect?
                    </button>
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 14,
                      marginTop: 24,
                    }}
                  >
                    {ROOMS.map((room) => {
                      const picked = photos[room.key];
                      return (
                        <label
                          key={room.key}
                          className="hv-tile"
                          style={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            aspectRatio: "4 / 3",
                            border: "1px solid var(--hairline)",
                            borderRadius: "var(--radius-lg)",
                            background: "var(--surface-soft)",
                            cursor: "pointer",
                            overflow: "hidden",
                          }}
                        >
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            aria-label={`Adaugă poza pentru ${room.label}`}
                            onChange={(e) => {
                              pickPhoto(room.key, e.target.files?.[0] ?? null);
                              e.target.value = "";
                            }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              opacity: 0,
                              cursor: "pointer",
                            }}
                          />
                          {picked ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={picked.url}
                                alt={room.label}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  top: 9,
                                  right: 9,
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: "var(--navy)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="var(--gold-300)"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M5 12l5 5 9-11" />
                                </svg>
                              </div>
                              <div
                                style={{
                                  position: "absolute",
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  padding: "7px 12px",
                                  background: "rgba(27,34,54,0.86)",
                                  color: "var(--on-dark)",
                                  fontSize: 12,
                                  letterSpacing: "0.02em",
                                }}
                              >
                                {room.label}
                              </div>
                            </>
                          ) : (
                            <>
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--gold)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                aria-hidden="true"
                              >
                                <path d="M12 5v14" />
                                <path d="M5 12h14" />
                              </svg>
                              <span
                                style={{
                                  fontFamily: "var(--font-serif)",
                                  fontSize: 17,
                                  color: "var(--ink)",
                                }}
                              >
                                {room.label}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  color: "var(--muted-soft)",
                                }}
                              >
                                Adaugă foto
                              </span>
                            </>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {error && <ErrorLine text={error} />}

                  <div
                    style={{
                      marginTop: 28,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!allPhotos}
                      className="hv-btn-navy"
                      style={primaryBtn}
                    >
                      Continuă →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2 · questions ──────────────────────────────── */}
              {step === 2 && (
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 500,
                      fontSize: 26,
                      color: "var(--ink)",
                      margin: "0 0 4px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Câteva întrebări scurte
                  </h3>
                  <p
                    style={{
                      margin: "0 0 24px",
                      color: "var(--muted)",
                      fontSize: 14,
                    }}
                  >
                    Ca să înțeleg proiectul înainte să încep.
                  </p>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 30 }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 2,
                          background: "var(--hairline)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${
                              (Math.min(qIndex, QUESTIONS.length) /
                                QUESTIONS.length) *
                              100
                            }%`,
                            height: "100%",
                            background: "var(--gold)",
                            transition: "width var(--dur-base) var(--ease)",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--muted)",
                          fontFamily: "var(--font-serif)",
                          fontStyle: "italic",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Întrebarea {Math.min(qIndex + 1, QUESTIONS.length)} din{" "}
                        {QUESTIONS.length}
                      </span>
                    </div>

                    {!allAnswered && (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 12,
                            marginBottom: 14,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontStyle: "italic",
                              color: "var(--gold)",
                              fontSize: 20,
                              lineHeight: 1,
                            }}
                          >
                            {current.num}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: 20,
                              color: "var(--ink)",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {current.label}
                          </span>
                        </div>

                        {current.kind === "text" && (
                          <div>
                            <textarea
                              autoFocus
                              maxLength={ANSWER_LIMIT}
                              value={answers[current.id] ?? ""}
                              onChange={(e) =>
                                typeAnswer(current.id, e.target.value)
                              }
                              placeholder={current.placeholder}
                              rows={3}
                              className="hv-input"
                              style={{
                                ...inputBase,
                                padding: "14px 16px",
                                lineHeight: 1.5,
                                border: "1px solid var(--hairline)",
                                resize: "vertical",
                              }}
                            />
                            <div
                              style={{
                                marginTop: 8,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "var(--muted-soft)",
                                }}
                              >
                                {(answers[current.id] ?? "").length}/
                                {ANSWER_LIMIT}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQIndex((i) => i + 1)}
                                disabled={
                                  !(answers[current.id] ?? "").trim()
                                }
                                className="hv-btn-navy"
                                style={{
                                  ...primaryBtn,
                                  opacity: (answers[current.id] ?? "").trim()
                                    ? 1
                                    : 0.45,
                                  cursor: (answers[current.id] ?? "").trim()
                                    ? "pointer"
                                    : "not-allowed",
                                }}
                              >
                                Continuă →
                              </button>
                            </div>
                          </div>
                        )}

                        {current.kind === "choice" && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {current.opts.map((opt) => {
                            const selected = answers[current.id] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => answer(current.id, opt, qIndex)}
                                className={`hv-opt${selected ? " is-selected" : ""}`}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 14,
                                  width: "100%",
                                  textAlign: "left",
                                  fontFamily: "var(--font-sans)",
                                  fontSize: 15,
                                  color: "var(--body-strong)",
                                  padding: "14px 16px",
                                  borderRadius: "var(--radius-md)",
                                  cursor: "pointer",
                                  background: selected
                                    ? "var(--surface-soft)"
                                    : "transparent",
                                  border: `1px solid ${
                                    selected ? "var(--gold)" : "var(--hairline)"
                                  }`,
                                }}
                              >
                                <span
                                  style={{
                                    width: 15,
                                    height: 15,
                                    borderRadius: "50%",
                                    flexShrink: 0,
                                    boxSizing: "border-box",
                                    border: `1px solid ${
                                      selected ? "var(--gold)" : "var(--hairline)"
                                    }`,
                                    background: selected
                                      ? "var(--gold)"
                                      : "transparent",
                                    boxShadow: selected
                                      ? "inset 0 0 0 3px var(--surface-soft)"
                                      : "none",
                                  }}
                                />
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                        )}
                      </div>
                    )}

                    {allAnswered && (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            marginBottom: 10,
                            gap: 12,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "var(--type-overline-size)",
                              letterSpacing: "var(--type-overline-tracking)",
                              textTransform: "uppercase",
                              color: "var(--muted)",
                              fontWeight: 500,
                            }}
                          >
                            Menționați dacă aveți elemente care neapărat vă plac
                            sau vă displac
                          </span>
                          <span
                            style={{ fontSize: 12, color: "var(--muted-soft)" }}
                          >
                            {note.length}/{NOTE_LIMIT}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "0 0 10px",
                            fontFamily: "var(--font-serif)",
                            fontStyle: "italic",
                            fontSize: 15,
                            lineHeight: 1.45,
                            color: "var(--muted)",
                          }}
                        >
                          ex: urăsc culoarea gri, vreau blat din marmură, etc.
                        </p>
                        <textarea
                          maxLength={NOTE_LIMIT}
                          value={note}
                          onChange={(e) =>
                            setNote(e.target.value.slice(0, NOTE_LIMIT))
                          }
                          rows={3}
                          className="hv-input"
                          style={{
                            ...inputBase,
                            padding: "14px 16px",
                            lineHeight: 1.5,
                            border: "1px solid var(--hairline)",
                            resize: "vertical",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 30,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <BackButton onClick={back} />
                    {allAnswered && (
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="hv-btn-navy"
                        style={primaryBtn}
                      >
                        Continuă →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 3 · details & payment ──────────────────────── */}
              {step === 3 && (
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 500,
                      fontSize: 26,
                      color: "var(--ink)",
                      margin: "0 0 10px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Date &amp; plată
                  </h3>
                  <p
                    style={{
                      margin: "0 0 24px",
                      fontSize: 16,
                      lineHeight: 1.55,
                      color: "var(--body-strong)",
                    }}
                  >
                    Te sunăm cât mai repede posibil ca să stabilim împreună ziua
                    și ora discuției.
                  </p>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 20 }}
                  >
                    <label style={{ display: "block" }}>
                      <span style={labelCaps}>Nume</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Numele tău"
                        autoComplete="name"
                        className="hv-input"
                        style={{
                          ...inputBase,
                          border: "1px solid var(--hairline)",
                        }}
                      />
                    </label>

                    <label style={{ display: "block" }}>
                      <span style={labelCaps}>Email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="adresa@email.ro"
                        autoComplete="email"
                        className="hv-input"
                        style={{
                          ...inputBase,
                          border: `1px solid ${
                            emailInvalid ? "var(--error)" : "var(--hairline)"
                          }`,
                        }}
                      />
                      {emailInvalid && (
                        <span style={fieldError}>
                          Introdu o adresă de email validă.
                        </span>
                      )}
                    </label>

                    <label style={{ display: "block" }}>
                      <span style={labelCaps}>Telefon</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XX XXX XXX"
                        autoComplete="tel"
                        className="hv-input"
                        style={{
                          ...inputBase,
                          border: `1px solid ${
                            phoneInvalid ? "var(--error)" : "var(--hairline)"
                          }`,
                        }}
                      />
                      {phoneInvalid && (
                        <span style={fieldError}>
                          Introdu un număr de telefon valid.
                        </span>
                      )}
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        style={{
                          width: 18,
                          height: 18,
                          marginTop: 2,
                          accentColor: "var(--navy)",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 14.5,
                          color: "var(--body)",
                          lineHeight: 1.5,
                        }}
                      >
                        Sunt de acord să fiu contactat în legătură cu designul
                        meu.
                      </span>
                    </label>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 0 6px",
                        borderTop: "1px solid var(--hairline-soft)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          letterSpacing: "0.02em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          fontWeight: 500,
                        }}
                      >
                        Total
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontStyle: "italic",
                          color: "var(--ink)",
                          fontSize: 26,
                        }}
                      >
                        297 lei
                      </span>
                    </div>

                    {error && <ErrorLine text={error} />}

                    <button
                      type="button"
                      onClick={submit}
                      disabled={!canPay || submitting}
                      className="hv-btn-navy"
                      style={{
                        ...primaryBtn,
                        width: "100%",
                        padding: 17,
                        marginTop: 4,
                      }}
                    >
                      {submitting
                        ? "Se redirecționează către plată…"
                        : "Vreau să-mi văd casa — 297 lei"}
                    </button>
                    <p
                      style={{
                        textAlign: "center",
                        fontSize: 13,
                        color: "var(--muted)",
                        margin: "2px 0 0",
                      }}
                    >
                      Plată securizată · Stripe · Fără abonament
                    </p>
                  </div>

                  <div style={{ marginTop: 22 }}>
                    <BackButton onClick={back} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {tipsOpen && <PhotoTipsModal onClose={() => setTipsOpen(false)} />}
    </>
  );
}

const primaryBtn: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 1,
  color: "var(--on-primary)",
  background: "var(--navy)",
  border: "none",
  borderRadius: "var(--radius-md)",
  padding: "15px 28px",
  cursor: "pointer",
};

const fieldError: CSSProperties = {
  display: "block",
  marginTop: 7,
  fontSize: 12.5,
  color: "var(--error)",
};

function ErrorLine({ text }: { text: string }) {
  return (
    <p
      role="alert"
      style={{
        margin: "18px 0 0",
        fontSize: 14,
        lineHeight: 1.5,
        color: "var(--error)",
      }}
    >
      {text}
    </p>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hv-muted-hover"
      style={{
        background: "none",
        border: "none",
        padding: "8px 0",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        color: "var(--muted)",
        cursor: "pointer",
      }}
    >
      ← Înapoi
    </button>
  );
}
