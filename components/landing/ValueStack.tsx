"use client";

import { Reveal } from "../Reveal";
import { AssetImage } from "../AssetImage";
import { btnCream, figLabel } from "./styles";

const ITEMS = [
  {
    text: "Cele 4 camere transformate în stilul tău — concept vizual fotorealist",
    price: "400 lei",
  },
  {
    text: "Discuție live 1-la-1 cu designerul, unde îți explic fiecare alegere",
    price: "100 lei",
  },
  {
    text: "Direcția clară + recomandări de materiale și culori (paletă, atmosferă)",
    price: "100 lei",
  },
  {
    text: "Interior personalizat pentru tine — bazat pe răspunsurile date",
    price: "50 lei",
  },
];

/** The offer, itemised: 650 lei of value sold for 297. */
export function ValueStack({ onStart }: { onStart: () => void }) {
  return (
    <section style={{ background: "var(--navy)" }}>
      <Reveal
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "clamp(32px,4.5vw,56px) clamp(22px,5vw,40px)",
        }}
      >
        <div
          style={{
            fontSize: "clamp(13px,1.6vw,17px)",
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
            fontSize: "clamp(32px,6.4vw,65px)",
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            color: "var(--on-dark)",
            margin: "16px 0 0",
            textWrap: "pretty",
          }}
        >
          Vezi interiorul înainte să spargi un perete sau să comanzi materialul{" "}
          <i style={{ fontStyle: "italic", color: "var(--gold-300)" }}>greșit</i>
          .
        </h2>

        <div
          style={{
            marginTop: "clamp(28px,4vw,44px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "clamp(32px,5vw,64px)",
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                border: "1px solid var(--hairline-dark)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
              }}
            >
              {ITEMS.map((item, i) => (
                <div
                  key={item.text}
                  style={{
                    display: "flex",
                    gap: 20,
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    padding: "22px 26px",
                    borderTop:
                      i === 0 ? undefined : "1px solid var(--hairline-dark)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "var(--on-dark)",
                      fontSize: 17,
                      lineHeight: 1.5,
                    }}
                  >
                    {i + 1}. {item.text}
                  </p>
                  <span
                    style={{
                      flexShrink: 0,
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      color: "var(--gold-300)",
                      fontSize: 26,
                      lineHeight: 1,
                    }}
                  >
                    {item.price}
                  </span>
                </div>
              ))}

              <div
                style={{
                  padding: 26,
                  borderTop: "1px solid var(--hairline-dark)",
                  background: "var(--surface-dark-elevated)",
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    fontSize: 19,
                    color: "var(--on-dark-soft)",
                    textDecoration: "line-through",
                  }}
                >
                  Valoare totală: 650 lei
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    color: "var(--gold-300)",
                    fontSize: "clamp(38px,5vw,56px)",
                    lineHeight: 1.1,
                    margin: "8px 0 4px",
                  }}
                >
                  Azi: 297 lei
                </div>
                <div
                  style={{
                    fontSize: "clamp(18px,2.4vw,25px)",
                    letterSpacing: "0.02em",
                    color: "var(--on-dark)",
                  }}
                >
                  Economisești 353 lei
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <em
                style={{
                  fontSize: "clamp(18px,2.4vw,25px)",
                  lineHeight: 1.6,
                  fontStyle: "normal",
                  color: "var(--on-dark)",
                }}
              >
                Începe acum — cât timp prețul e încă 297 lei.
              </em>
              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  onClick={onStart}
                  className="hv-btn-cream"
                  style={btnCream}
                >
                  Vreau să-mi văd casa — 297 lei
                </button>
              </div>
            </div>
          </div>

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
