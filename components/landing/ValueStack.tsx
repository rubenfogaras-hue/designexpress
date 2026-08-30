"use client";

import { Reveal } from "../Reveal";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

/* What's included in the 297 lei. "Dacă le-ai cumpăra separat" below is the sum
   of these prices — 1.250 lei — so keep the two in step when editing. */
const ITEMS = [
  {
    title: "Cele 4 camere transformate",
    desc: "Concept vizual fotorealist, în stilul tău — camerele tale, nu o poză de pe Pinterest.",
    price: "400 lei",
  },
  {
    title: "Discuție live 1-la-1 cu designerul",
    desc: "Îți explic fiecare alegere, în direct, și răspund la orice întrebare.",
    price: "500 lei",
    highlight: true,
  },
  {
    title: "Moodboard",
    desc: "Paletarul de culori și materialele folosite în design.",
    price: "200 lei",
  },
  {
    title: "Harta luminii",
    desc: "Website-urile de unde cumpăr eu iluminatul pentru proiecte.",
    price: "100 lei",
  },
  {
    title: "Interior personalizat",
    desc: "Bazat pe răspunsurile tale, nu pe un șablon.",
    price: "50 lei",
  },
];

/* Sold separately, on top of the 297 lei — deliberately excluded from the total
   so the price only ever counts what is actually included. */
/**
 * The paid add-on, sold separately. It mirrors the cross-sell attached to the
 * Stripe Payment Link — if one changes, change the other, or the page and the
 * checkout disagree in front of the customer.
 */
const OPTIONAL = {
  title: "Ideile Tale pe Plan",
  desc: "Planul ideilor tale cu organizare și cote.",
  price: "97 lei",
};

const TOTAL = "1.250 lei";
const TODAY = "297";

/** Numbered badge — navy for what's included, gold for the add-on. */
function Badge({ n, tone }: { n: number | string; tone: "navy" | "gold" }) {
  return (
    <span
      style={{
        flexShrink: 0,
        width: 27,
        height: 27,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12.5,
        fontWeight: 600,
        marginTop: 1,
        background: tone === "navy" ? "var(--navy)" : "var(--gold)",
        color: tone === "navy" ? "var(--on-dark)" : "var(--navy)",
      }}
    >
      {n}
    </span>
  );
}

/** One line of the stack: badge, title + description, and its standalone value. */
function Row({
  n,
  tone,
  title,
  desc,
  price,
  strike,
  highlight,
  first,
}: {
  n: number | string;
  tone: "navy" | "gold";
  title: string;
  desc: string;
  price: string;
  strike: boolean;
  highlight?: boolean;
  first?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "clamp(10px,2.5vw,13px)",
        padding: "clamp(8px,1.9vw,11px) clamp(12px,3vw,18px)",
        borderTop: first ? undefined : "1px solid var(--hairline-soft)",
        background: highlight ? "var(--surface-cream-strong)" : undefined,
      }}
    >
      <Badge n={n} tone={tone} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: "clamp(14px,1.7vw,16.5px)",
            lineHeight: 1.3,
            color: "var(--ink)",
            letterSpacing: "-0.005em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: "clamp(12.5px,1.45vw,14px)",
            lineHeight: 1.38,
            color: "var(--muted)",
          }}
        >
          {desc}
        </div>
      </div>

      <span
        style={{
          flexShrink: 0,
          alignSelf: "center",
          fontSize: "clamp(12.5px,1.4vw,14px)",
          color: "var(--muted-soft)",
          textDecoration: strike ? "line-through" : "none",
          whiteSpace: "nowrap",
        }}
      >
        {price}
      </span>
    </div>
  );
}

/**
 * The offer — a numbered value stack on ivory: every included item with its
 * standalone value struck through, what the lot would cost separately, then a
 * navy block with today's price and the CTA. The one add-on that is *not* part
 * of the 297 lei sits below that block, clearly fenced off, and is excluded
 * from both the total and the savings figure.
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
          Vezi interiorul înainte să spargi un perete —{" "}
          <i
            style={{
              fontStyle: "italic",
              color: "var(--gold-300)",
              textDecoration: "underline",
              textUnderlineOffset: "0.12em",
              textDecorationThickness: "from-font",
            }}
          >
            prin imagini 95% reale în mai puțin de 48 de ore
          </i>
          .
        </h2>

        <div
          style={{
            marginTop: "clamp(18px,3.5vw,44px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "clamp(24px,5vw,64px)",
            alignItems: "start",
          }}
        >
          {/* ── the offer card ─────────────────────────────────────────── */}
          <div
            style={{
              background: "var(--canvas)",
              border: "1px solid var(--hairline)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              boxShadow: "0 12px 44px rgba(0,0,0,0.28)",
            }}
          >
            {/* header */}
            <div
              style={{ padding: "clamp(15px,3vw,22px) clamp(12px,3vw,18px) 0" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 500,
                  fontSize: "clamp(32px,6.5vw,46px)",
                  lineHeight: 1.05,
                  textAlign: "center",
                  color: "var(--gold)",
                  letterSpacing: "-0.015em",
                }}
              >
                Design Express
              </div>
              <p
                style={{
                  margin: "clamp(6px,1.3vw,10px) 0 0",
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(16px,2.2vw,21px)",
                  lineHeight: 1.25,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                Tot ce-ți trebuie pentru{" "}
                <span style={{ textTransform: "uppercase" }}>
                  deciziile corecte
                </span>
              </p>
              <div
                style={{
                  width: 68,
                  height: 2,
                  background: "var(--gold)",
                  opacity: 0.75,
                  margin: "clamp(8px,1.6vw,12px) 0 clamp(1px,0.4vw,3px)",
                }}
              />
            </div>

            {/* included */}
            {ITEMS.map((item, i) => (
              <Row
                key={item.title}
                n={i + 1}
                tone="navy"
                title={item.title}
                desc={item.desc}
                price={item.price}
                strike
                highlight={item.highlight}
                first={i === 0}
              />
            ))}

            {/* what the lot would cost separately */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
                padding: "clamp(10px,2.2vw,14px) clamp(12px,3vw,18px)",
                borderTop: "1px solid var(--hairline)",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(13.5px,1.6vw,16px)",
                  color: "var(--body)",
                }}
              >
                Dacă le-ai cumpăra separat
              </span>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: "clamp(14px,1.7vw,17px)",
                  color: "var(--muted-soft)",
                  textDecoration: "line-through",
                  whiteSpace: "nowrap",
                }}
              >
                {TOTAL}
              </span>
            </div>

            {/* today's price + CTA */}
            <div
              style={{
                padding: "0 clamp(12px,3vw,18px) clamp(12px,3vw,18px)",
              }}
            >
              <div
                style={{
                  background: "var(--navy)",
                  borderRadius: "var(--radius-lg)",
                  padding: "clamp(13px,2.5vw,18px) clamp(13px,2.6vw,18px)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--gold-300)",
                    fontWeight: 600,
                  }}
                >
                  Prețul tău azi
                </div>

                <div
                  style={{
                    margin: "clamp(4px,1vw,7px) 0 0",
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "clamp(34px,7vw,48px)",
                      lineHeight: 1,
                      color: "var(--on-dark)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {TODAY}
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(13px,1.7vw,16px)",
                      color: "var(--on-dark-soft)",
                    }}
                  >
                    lei
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onStart}
                  className="hv-btn-gold"
                  style={{
                    width: "100%",
                    marginTop: "clamp(11px,2vw,15px)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "clamp(14px,1.7vw,16px)",
                    lineHeight: 1.1,
                    color: "var(--navy)",
                    background: "var(--gold)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    padding: "13px 18px",
                    cursor: "pointer",
                  }}
                >
                  Vreau să-mi văd casa →
                </button>

                {/* Capacity, sitting under the CTA as its own red block. The
                    cap is real — the 48-hour promise only holds because intake
                    is limited — so it reads as a reason, not a countdown. */}
                <div
                  style={{
                    marginTop: "clamp(8px,1.6vw,11px)",
                    background: "#c0392b",
                    borderRadius: "var(--radius-md)",
                    padding: "11px 14px",
                    textAlign: "center",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "clamp(12px,1.45vw,13.5px)",
                    lineHeight: 1.4,
                    color: "#ffffff",
                    textWrap: "pretty",
                  }}
                >
                  Iau 5 proiecte pe săptămână.
                  <span style={{ display: "block", fontWeight: 500 }}>
                    Ca să livrez în 48 de ore, nu pot mai multe.
                  </span>
                </div>
              </div>
            </div>

            {/* the one thing that is not included */}
            <div
              style={{
                padding:
                  "clamp(9px,2vw,12px) clamp(12px,3vw,18px) clamp(11px,2.2vw,14px)",
                borderTop: "1px solid var(--hairline-soft)",
                background: "var(--surface-soft)",
              }}
            >
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Opțional · nu e inclus în preț
              </div>
              <Row
                n="+"
                tone="gold"
                title={OPTIONAL.title}
                desc={OPTIONAL.desc}
                price={`+${OPTIONAL.price}`}
                strike={false}
                first
              />
            </div>
          </div>

          {/* ── proof beside the offer ─────────────────────────────────── */}
          <BeforeAfterSlider
            before="/assets/before-bathroom.jpg"
            after="/assets/after-bathroom.jpg"
            caption="Baie"
            beforeAlt="Baie înainte de transformare"
            afterAlt="Baie după transformare"
            onDark
          />
        </div>
      </Reveal>
    </section>
  );
}
