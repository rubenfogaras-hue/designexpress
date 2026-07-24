"use client";

import { Reveal } from "../Reveal";
import { AssetImage } from "../AssetImage";
import { displayH2, figLabel, goldEm, lead, overline } from "./styles";

const PAIRS = [
  {
    before: "/assets/before-living.jpg",
    after: "/assets/after-living.jpg",
    label: "Living",
  },
  {
    before: "/assets/before-kitchen.jpg",
    after: "/assets/after-kitchen.jpg",
    label: "Bucătărie",
  },
];

/** Proof section — two real transformations, before beside after. */
export function BeforeAfter() {
  return (
    <section
      id="proof-anchor"
      style={{
        background: "var(--surface-card)",
        borderTop: "1px solid var(--hairline-soft)",
        borderBottom: "1px solid var(--hairline-soft)",
      }}
    >
      <Reveal
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "clamp(32px,4.5vw,56px) clamp(22px,5vw,40px)",
        }}
      >
        <div style={overline}>Înainte · După</div>
        <h2 style={displayH2}>
          Aceleași camere.
          <i style={{ fontStyle: "italic", color: "var(--gold)" }}>
            {" "}
            Altă atmosferă
          </i>
          .
        </h2>
        <p style={{ ...lead, margin: "20px 0 0", maxWidth: 580 }}>
          Două transformări reale —{" "}
          <em style={goldEm}>stânga înainte, dreapta după</em>. Cât costă o
          greșeală de renovare, sute sau mii de euro?
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(28px,4vw,44px)",
            marginTop: 40,
          }}
        >
          {PAIRS.map((pair) => (
            <div
              key={pair.label}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 14,
              }}
            >
              <figure style={{ margin: 0 }}>
                <figcaption style={{ ...figLabel, color: "var(--muted)" }}>
                  Înainte
                </figcaption>
                <AssetImage
                  src={pair.before}
                  alt={`${pair.label} înainte`}
                  muted
                />
              </figure>
              <figure style={{ margin: 0 }}>
                <figcaption style={{ ...figLabel, color: "var(--gold)" }}>
                  După
                </figcaption>
                <AssetImage src={pair.after} alt={`${pair.label} după`} />
              </figure>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
