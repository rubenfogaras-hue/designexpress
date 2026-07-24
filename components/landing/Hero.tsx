"use client";

import { Reveal } from "../Reveal";
import { AssetImage } from "../AssetImage";
import { btnGhost, btnNavy, figLabel, goldEm, lead, overline } from "./styles";

/** Hero — the promise, the two CTAs, and the first before/after pair. */
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
          "clamp(24px,3.5vw,44px) clamp(22px,5vw,40px) clamp(48px,6vw,72px)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(40px,6vw,80px)",
          alignItems: "center",
        }}
      >
        <Reveal style={{ flex: "1.05 1 380px" }}>
          <div style={overline}>Design Express · Vezi-ți casa transformată</div>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              fontSize: "clamp(36px,7.4vw,63px)",
              lineHeight: 1.05,
              letterSpacing: "-0.018em",
              color: "var(--ink)",
              margin: "22px 0 0",
              textWrap: "pretty",
            }}
          >
            Renovezi — și nu vrei{" "}
            <i style={{ fontStyle: "italic", color: "var(--gold)" }}>
              timp pierdut, bani irosiți, și materiale risipite?
            </i>
          </h1>

          <div
            style={{
              width: 72,
              height: 1,
              background: "var(--gold)",
              opacity: 0.6,
              margin: "30px 0 26px",
            }}
          />

          <p style={{ ...lead, maxWidth: 540, margin: 0 }}>
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
              marginTop: 34,
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

        <Reveal style={{ flex: "0.95 1 360px" }}>
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
      </div>
    </section>
  );
}
