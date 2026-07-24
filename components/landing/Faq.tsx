"use client";

import { useState } from "react";
import { Reveal } from "../Reveal";
import { section } from "./styles";

/**
 * Four questions. The design's fifth item — a 197 lei money-back promise —
 * was deliberately dropped before launch.
 */
const FAQ = [
  {
    q: "Ce primesc, mai exact?",
    a: "Cele patru camere ale tale — living, bucătărie, dormitor, baie — transformate în stil clasic-contemporan, pe care ți le prezint live (sau pe email, în funcție de proiect).",
  },
  {
    q: "Este un plan de execuție?",
    a: "Nu — este un concept vizual care îți arată direcția și atmosfera. Planurile tehnice fac parte din proiectul complet, despre care vorbim în consultație.",
  },
  {
    q: "Câte camere trimit?",
    a: "Toate patru: living, bucătărie, dormitor, baie.",
  },
  {
    q: "Ce se întâmplă după?",
    a: "Îți arăt camerele live și îți spun cum ar arăta proiectul complet — dacă vrei să mergem mai departe.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(-1);

  return (
    <Reveal
      as="section"
      style={{
        ...section,
        paddingBottom: "clamp(32px,4.5vw,56px)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 500,
          fontSize: "clamp(35px,6.8vw,70px)",
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
          color: "var(--ink)",
          margin: 0,
          textWrap: "pretty",
        }}
      >
        Răspunsuri simple. Înainte să{" "}
        <i style={{ fontStyle: "italic", color: "var(--gold)" }}>întrebați</i>.
      </h2>

      <div style={{ marginTop: 20, borderTop: "1px solid var(--hairline)" }}>
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} style={{ borderBottom: "1px solid var(--hairline)" }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: "22px 4px",
                  cursor: "pointer",
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(18px,2.4vw,21px)",
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                <span>{item.q}</span>
                <span
                  style={{
                    display: "inline-flex",
                    flexShrink: 0,
                    transition: "transform var(--dur-base) var(--ease)",
                    transform: isOpen ? "rotate(180deg)" : "none",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <p
                  style={{
                    margin: 0,
                    padding: "0 4px 24px",
                    color: "var(--body)",
                    fontSize: 16,
                    lineHeight: 1.65,
                    maxWidth: 640,
                  }}
                >
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
