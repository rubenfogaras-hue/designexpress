"use client";

import { Reveal } from "../Reveal";
import { displayH2, goldEm, overline, section } from "./styles";

const STEPS = [
  {
    num: "01",
    title: "Trimiți pozele",
    before: "Cele două camere, ",
    em: "direct de pe telefon",
    after: ".",
  },
  {
    num: "02",
    title: "Răspunzi la câteva întrebări scurte",
    before: "Ca să înțeleg proiectul și ",
    em: "ce-ți dorești",
    after: ".",
  },
  {
    num: "03",
    title: "Ți le arăt live",
    before: "Te sun și stabilim împreună ",
    em: "data și ora întâlnirii",
    after: ".",
  },
];

/** The three-step explainer. */
export function HowItWorks() {
  return (
    <Reveal as="section" style={section}>
      <div style={overline}>Cum funcționează</div>
      <h2 style={displayH2}>
        Trei pași pentru o{" "}
        <i style={{ fontStyle: "italic", color: "var(--gold)" }}>
          renovare fără regrete
        </i>
        .
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "clamp(28px,4vw,56px)",
          marginTop: 44,
        }}
      >
        {STEPS.map((step) => (
          <div key={step.num}>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                color: "var(--gold)",
                fontSize: 44,
                lineHeight: 1,
              }}
            >
              {step.num}
            </div>
            <div
              style={{
                width: 40,
                height: 1,
                background: "var(--hairline)",
                margin: "18px 0",
              }}
            />
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
                fontSize: "clamp(24px,3.4vw,35px)",
                color: "var(--ink)",
                margin: "0 0 10px",
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                margin: 0,
                color: "var(--body)",
                fontSize: 17,
                lineHeight: 1.6,
              }}
            >
              {step.before}
              <em style={goldEm}>{step.em}</em>
              {step.after}
            </p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
