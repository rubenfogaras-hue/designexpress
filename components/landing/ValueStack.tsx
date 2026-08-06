"use client";

import { Reveal } from "../Reveal";
import { AssetImage } from "../AssetImage";
import { figLabel } from "./styles";

/* What's included in the 297 lei. The struck-through "valoare totală" below is
   the sum of these prices — 1.250 lei — so keep the two in step when editing. */
const ITEMS = [
  {
    text: "Cele 4 camere transformate în stilul tău — concept vizual fotorealist",
    price: "400 lei",
  },
  {
    text: "Discuție live 1-la-1 cu designerul, unde îți explic fiecare alegere",
    price: "500 lei",
  },
  {
    text: "Moodboard — paletar de culori și materiale folosite în design",
    price: "200 lei",
  },
  {
    text: "Harta luminii — lista cu website-urile folosite de designer pentru a cumpăra iluminat",
    price: "100 lei",
  },
  {
    text: "Interior personalizat pentru tine — bazat pe răspunsurile date",
    price: "50 lei",
  },
];

/* Sold separately, on top of the 297 lei — deliberately excluded from the
   total above so the savings figure only ever counts what's actually included. */
const OPTIONAL = {
  text: "Lista achiziții — obiectele și iluminatul folosit în design",
  price: "200 lei",
};

/** Hollow plus — marks the add-on, so it never reads as one of the included items. */
function Plus() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: 1 }}
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="none"
        stroke="var(--on-dark-soft)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <path
        d="M12 7.5v9M7.5 12h9"
        stroke="var(--on-dark-soft)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Small gold check that marks each included item. */
function Check() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: 1 }}
    >
      <circle cx="12" cy="12" r="11" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
      <path
        d="M7 12.5l3 3 7-8"
        stroke="var(--gold-300)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The offer — a self-contained "value stack" card (Russell-style): each
 * included item with a checkmark and its standalone value, then the total
 * struck through, the today price, a savings badge, and the CTA — all inside
 * one gold-bordered card that stands apart from the editorial sections and
 * fits with its button on a phone.
 */
export function ValueStack({ onStart }: { onStart: () => void }) {
  return (
    <section style={{ background: "var(--navy)" }}>
      <Reveal
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "clamp(30px,4.5vw,56px) clamp(18px,5vw,40px)",
        }}
      >
        <div
          style={{
            fontSize: "clamp(11px,1.3vw,13px)",
            letterSpacing: "var(--type-overline-tracking)",
            textTransform: "uppercase",
            color: "var(--gold-300)",
            fontWeight: 500,
          }}
        >
          Ce primești
        </div>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: "clamp(27px,6vw,70px)",
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            color: "var(--on-dark)",
            margin: "12px 0 0",
            textWrap: "pretty",
          }}
        >
          Vezi interiorul{" "}
          <i style={{ fontStyle: "italic", color: "var(--gold-300)" }}>
            înainte să spargi
          </i>{" "}
          un perete sau să comanzi materialul greșit.
        </h2>

        <div
          style={{
            marginTop: "clamp(18px,3.5vw,44px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(24px,5vw,64px)",
            alignItems: "start",
          }}
        >
          {/* ── the offer card ─────────────────────────────────────────── */}
          <div
            style={{
              border: "1.5px solid var(--gold)",
              borderRadius: "var(--radius-xl)",
              background: "var(--surface-dark-elevated)",
              overflow: "hidden",
              boxShadow: "0 12px 44px rgba(0,0,0,0.28)",
            }}
          >
            <div
              style={{
                padding: "11px 22px",
                borderBottom: "1px solid var(--hairline-dark)",
                textAlign: "center",
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--gold-300)",
                fontWeight: 600,
              }}
            >
              Pachetul complet · o singură plată
            </div>

            {ITEMS.map((item, i) => (
              <div
                key={item.text}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "clamp(10px,2.6vw,15px) clamp(15px,4vw,24px)",
                  borderTop: i === 0 ? undefined : "1px solid var(--hairline-dark)",
                }}
              >
                <span style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <Check />
                  <span
                    style={{
                      color: "var(--on-dark)",
                      fontSize: "clamp(13px,1.5vw,15.5px)",
                      lineHeight: 1.35,
                    }}
                  >
                    {item.text}
                  </span>
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    color: "var(--gold-300)",
                    fontSize: "clamp(17px,2.2vw,23px)",
                    lineHeight: 1.2,
                  }}
                >
                  {item.price}
                </span>
              </div>
            ))}

            {/* price block */}
            <div
              style={{
                padding: "clamp(14px,3.5vw,24px)",
                borderTop: "1px solid var(--hairline-dark)",
                background: "var(--navy-900)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(13.5px,1.6vw,17px)",
                  color: "var(--on-dark-soft)",
                }}
              >
                Valoare totală:{" "}
                <span style={{ textDecoration: "line-through" }}>1.250 lei</span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--gold-300)",
                  fontWeight: 600,
                  margin: "9px 0 2px",
                }}
              >
                Azi doar
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  color: "var(--gold-300)",
                  fontSize: "clamp(36px,7.2vw,54px)",
                  lineHeight: 1,
                }}
              >
                297 lei
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "6px 16px",
                  border: "1px solid var(--gold)",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "clamp(13px,1.6vw,15px)",
                  letterSpacing: "0.02em",
                  color: "var(--on-dark)",
                }}
              >
                Economisești 953 lei
              </div>
            </div>

            {/* ── optional add-on, priced separately ──────────────────── */}
            <div
              style={{
                padding: "clamp(12px,3vw,18px) clamp(15px,4vw,24px)",
                borderTop: "1px solid var(--hairline-dark)",
              }}
            >
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--on-dark-soft)",
                  fontWeight: 600,
                  marginBottom: 9,
                }}
              >
                Opțional · se adaugă separat
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <Plus />
                  <span
                    style={{
                      color: "var(--on-dark-soft)",
                      fontSize: "clamp(13px,1.5vw,15.5px)",
                      lineHeight: 1.35,
                    }}
                  >
                    {OPTIONAL.text}
                  </span>
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    color: "var(--on-dark-soft)",
                    fontSize: "clamp(17px,2.2vw,23px)",
                    lineHeight: 1.2,
                  }}
                >
                  +{OPTIONAL.price}
                </span>
              </div>
            </div>

            {/* CTA inside the card */}
            <div
              style={{
                padding: "clamp(13px,3.5vw,22px)",
                borderTop: "1px solid var(--hairline-dark)",
              }}
            >
              <button
                type="button"
                onClick={onStart}
                className="hv-btn-cream"
                style={{
                  width: "100%",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "clamp(15px,1.8vw,17px)",
                  lineHeight: 1.1,
                  color: "var(--navy)",
                  background: "var(--on-primary)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 20px",
                  cursor: "pointer",
                }}
              >
                Vreau să-mi văd casa — 297 lei
              </button>
              <p
                style={{
                  margin: "10px 0 0",
                  textAlign: "center",
                  fontSize: "clamp(12px,1.5vw,13.5px)",
                  color: "var(--on-dark-soft)",
                }}
              >
                Începe acum — cât timp prețul e încă 297 lei.
              </p>
            </div>
          </div>

          {/* ── proof beside the offer ─────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <figure style={{ margin: 0 }}>
              <figcaption style={{ ...figLabel, color: "var(--gold-300)" }}>
                Înainte
              </figcaption>
              <AssetImage
                src="/assets/before-bathroom.jpg"
                alt="Baie înainte"
                muted
              />
            </figure>
            <figure style={{ margin: 0 }}>
              <figcaption style={{ ...figLabel, color: "var(--gold-300)" }}>
                După
              </figcaption>
              <AssetImage src="/assets/after-bathroom.jpg" alt="Baie după" />
            </figure>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
