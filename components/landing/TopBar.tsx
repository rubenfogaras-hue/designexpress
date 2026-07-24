"use client";

import { CompassGlyph } from "../CompassGlyph";

/**
 * Slim navy bar: brand on the left, a CTA that opens the wizard on the right.
 * Kept to a single line (no wrap) on every width so it stays thin.
 */
export function TopBar({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ background: "var(--navy)" }}>
      <div
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "8px clamp(22px,5vw,40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            fontFamily: "var(--font-serif)",
            fontSize: 16,
            color: "var(--on-dark)",
          }}
        >
          <CompassGlyph size={16} />
          Horizont&nbsp;<i style={{ fontStyle: "italic" }}>Visuals</i>
        </span>

        <button
          type="button"
          onClick={onStart}
          className="hv-btn-cream"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: 12.5,
            lineHeight: 1,
            color: "var(--navy)",
            background: "var(--on-primary)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "8px 16px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Vreau să-mi văd casa
        </button>
      </div>
    </div>
  );
}
