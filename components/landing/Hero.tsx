"use client";

import { Reveal } from "../Reveal";
import { AssetImage } from "../AssetImage";
import { btnGhost, btnNavy, figLabel, goldEm, lead, overline } from "./styles";

/**
 * Hero — the promise and the first before/after pair.
 *
 * Layout reflows via the `.hv-hero` grid (globals.css). Four blocks map to
 * grid areas: `lead` (eyebrow + headline), `sub` (rule + subheadline),
 * `media` (the two photos) and `cta` (buttons).
 *
 * On desktop the text sits left and the images right. On a phone the order is
 * headline → subheadline → images → buttons, so the whole pitch is read before
 * the proof, and the before/after starts inside the first screen (the header
 * already carries a CTA up top). Sizes are trimmed on mobile to fit the fold.
 */
export function Hero({ onStart }: { onStart: () => void }) {
  const scrollToProof = () => {
    document
      .getElementById("proof-anchor")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      style={{
        maxWidth: "var(--container)",
        margin: "0 auto",
        padding:
          "clamp(18px,3.5vw,44px) clamp(22px,5vw,40px) clamp(40px,6vw,72px)",
      }}
    >
      <div className="hv-hero">
        {/* lead — eyebrow + headline */}
        <Reveal style={{ gridArea: "lead" }}>
          <div style={overline}>Design Express · Vezi-ți casa transformată</div>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              fontSize: "clamp(31px,7vw,63px)",
              lineHeight: 1.05,
              letterSpacing: "-0.018em",
              color: "var(--ink)",
              margin: "14px 0 0",
              textWrap: "pretty",
            }}
          >
            Renovezi — și nu vrei{" "}
            <i style={{ fontStyle: "italic", color: "var(--gold)" }}>
              timp pierdut, bani irosiți, și materiale risipite?
            </i>
          </h1>
        </Reveal>

        {/* sub — rule (desktop only) + subheadline */}
        <Reveal style={{ gridArea: "sub" }}>
          <div
            className="hv-hero-rule"
            style={{
              width: 72,
              height: 1,
              background: "var(--gold)",
              opacity: 0.6,
              margin: "0 0 26px",
            }}
          />

          <p
            style={{
              ...lead,
              maxWidth: 540,
              margin: 0,
              fontSize: "clamp(15.5px,2.2vw,22px)",
              lineHeight: 1.5,
            }}
          >
            <strong
              style={{
                fontWeight: 700,
                color: "var(--ink)",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}
            >
              Înainte să spargi,
            </strong>{" "}
            trimite-mi pozele celor patru camere — living, bucătărie, dormitor,
            baie. Ți le transform în stil{" "}
            <em style={goldEm}>clasic-contemporan</em> și{" "}
            <strong style={{ fontWeight: 700 }}>te ajut,</strong>{" "}
            <em style={{ ...goldEm, fontWeight: 700 }}>live</em>
            <strong style={{ fontWeight: 700 }}>
              , să faci următorul pas, pentru interiorul dorit.
            </strong>
          </p>
        </Reveal>

        {/* media — before + after */}
        <Reveal style={{ gridArea: "media" }}>
          <figure style={{ margin: "0 0 14px" }}>
            <figcaption style={{ ...figLabel, color: "var(--muted)" }}>
              Înainte
            </figcaption>
            <AssetImage
              src="/assets/before-bedroom.jpg"
              alt="Dormitor înainte de transformare"
              muted
            />
          </figure>
          <figure style={{ margin: 0 }}>
            <figcaption style={{ ...figLabel, color: "var(--gold)" }}>După</figcaption>
            <AssetImage
              src="/assets/after-bedroom.jpg"
              alt="Dormitor după transformare"
            />
          </figure>
        </Reveal>

        {/* cta — primary + secondary */}
        <Reveal style={{ gridArea: "cta" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <button type="button" onClick={onStart} className="hv-btn-navy" style={btnNavy}>
              Vreau să-mi văd casa
            </button>
            <button
              type="button"
              onClick={scrollToProof}
              className="hv-btn-ghost"
              style={btnGhost}
            >
              Vezi transformările
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
