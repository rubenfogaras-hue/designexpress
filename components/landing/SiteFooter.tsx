"use client";

import { CompassGlyph } from "../CompassGlyph";
import { btnCream } from "./styles";

const INSTAGRAM_HANDLE = "ruben.fogaras";

/** Closing CTA + contact strip. */
export function SiteFooter({ onStart }: { onStart: () => void }) {
  return (
    <footer style={{ background: "var(--navy)", color: "var(--on-dark)" }}>
      <div
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "clamp(56px,8vw,96px) clamp(22px,5vw,40px) 40px",
        }}
      >
        <div style={{ maxWidth: 620 }}>
          <p
            style={{
              fontSize: "clamp(11px,1.3vw,13px)",
              letterSpacing: "var(--type-overline-tracking)",
              textTransform: "uppercase",
              color: "var(--on-dark-soft)",
              margin: "0 0 18px",
              fontWeight: 500,
            }}
          >
            Ești la o decizie de casa ta de vis.
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              fontSize: "clamp(35px,6.8vw,70px)",
              lineHeight: 1.04,
              letterSpacing: "-0.018em",
              color: "var(--on-dark)",
              margin: 0,
            }}
          >
            Construiește cu{" "}
            <i style={{ fontStyle: "italic", color: "var(--gold-300)" }}>stil</i>
            .
          </h2>
          <button
            type="button"
            onClick={onStart}
            className="hv-btn-cream"
            style={{ ...btnCream, marginTop: 30 }}
          >
            Vreau să-mi văd casa — 297 lei
          </button>
        </div>

        <div
          style={{
            height: 1,
            background: "var(--hairline-dark)",
            margin: "clamp(40px,6vw,64px) 0 28px",
          }}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 18px",
            alignItems: "center",
            fontSize: 13,
            color: "var(--on-dark-soft)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-serif)",
              fontSize: 16,
              color: "var(--on-dark)",
            }}
          >
            <CompassGlyph size={15} />
            Horizont&nbsp;<i style={{ fontStyle: "italic" }}>Visuals</i>
          </span>

          <span style={{ color: "var(--hairline-dark)" }}>·</span>
          <a
            href={`https://www.instagram.com/${INSTAGRAM_HANDLE}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="hv-link-on-dark"
            style={{ color: "var(--on-dark-soft)" }}
          >
            @{INSTAGRAM_HANDLE}
          </a>

          <span style={{ color: "var(--hairline-dark)" }}>·</span>
          <span>Târgu Mureș</span>

          <span style={{ color: "var(--hairline-dark)" }}>·</span>
          <a
            href="mailto:rubenfogaras@gmail.com"
            className="hv-link-on-dark"
            style={{ color: "var(--on-dark-soft)" }}
          >
            rubenfogaras@gmail.com
          </a>
          <span style={{ color: "var(--hairline-dark)" }}>·</span>
          <a
            href="tel:+40748569303"
            className="hv-link-on-dark"
            style={{ color: "var(--on-dark-soft)" }}
          >
            0748 569 303
          </a>
          <span style={{ color: "var(--hairline-dark)" }}>·</span>
          <span>Plată securizată prin Stripe</span>
        </div>
      </div>
    </footer>
  );
}
