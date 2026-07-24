import type { CSSProperties } from "react";

/**
 * Shared type styles lifted from the design file. The design hard-codes large
 * display sizes (63–65px); here they're clamped so nothing overflows on a
 * 360px phone — the design's value stays the upper bound.
 */

export const section: CSSProperties = {
  maxWidth: "var(--container)",
  margin: "0 auto",
  padding: "clamp(28px,4vw,48px) clamp(22px,5vw,40px)",
};

/** Gold uppercase eyebrow above a section headline. */
export const overline: CSSProperties = {
  fontSize: "clamp(13px,1.6vw,17px)",
  letterSpacing: "var(--type-overline-tracking)",
  textTransform: "uppercase",
  color: "var(--gold)",
  fontWeight: 500,
};

/** Small caption eyebrow (Înainte / După labels). */
export const figLabel: CSSProperties = {
  fontSize: "clamp(11px,1.3vw,13px)",
  letterSpacing: "var(--type-overline-tracking)",
  textTransform: "uppercase",
  fontWeight: 500,
  marginBottom: 9,
};

/** Section headline — serif, tight, clamped. */
export const displayH2: CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontWeight: 500,
  fontSize: "clamp(32px,6.4vw,65px)",
  lineHeight: 1.08,
  letterSpacing: "-0.015em",
  color: "var(--ink)",
  margin: "16px 0 0",
  textWrap: "pretty",
};

/** Lead paragraph under a headline. */
export const lead: CSSProperties = {
  fontSize: "clamp(17px,2.2vw,22px)",
  lineHeight: 1.6,
  color: "var(--body-strong)",
};

/** Inline serif-italic gold emphasis used throughout the copy. */
export const goldEm: CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontStyle: "italic",
  fontWeight: 500,
  fontSize: "clamp(20px,2.6vw,27px)",
  color: "var(--gold)",
};

/** Primary navy button. */
export const btnNavy: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 1,
  color: "var(--on-primary)",
  background: "var(--navy)",
  border: "none",
  borderRadius: "var(--radius-md)",
  padding: "17px 28px",
  cursor: "pointer",
};

/** Cream button, used on navy surfaces. */
export const btnCream: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 1,
  color: "var(--navy)",
  background: "var(--on-primary)",
  border: "none",
  borderRadius: "var(--radius-md)",
  padding: "17px 28px",
  cursor: "pointer",
};

/** Outlined button on ivory. */
export const btnGhost: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 1,
  color: "var(--ink)",
  background: "transparent",
  border: "1px solid var(--ink)",
  borderRadius: "var(--radius-md)",
  padding: "16px 27px",
  cursor: "pointer",
};
