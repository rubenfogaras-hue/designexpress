"use client";

import { Reveal } from "../Reveal";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { btnNavy, goldEm, lead, overline } from "./styles";

/**
 * Hero — the promise and the first transformation.
 *
 * Layout reflows via the `.hv-hero` grid (globals.css). Four blocks map to
 * grid areas: `lead` (eyebrow + headline), `sub` (rule + subheadline),
 * `media` (the before/after slider) and `cta` (buttons).
 *
 * On desktop the text sits left and the slider right. On a phone the order is
 * headline → subheadline → slider → buttons, so the whole pitch is read before
 * the proof. The slider replaced a stacked pair of photos, which halved the
 * media height — worth a lot here, since almost all traffic is mobile.
 */
export function Hero({ onStart }: { onStart: () => void }) {
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
              fontSize: "clamp(34px,7.4vw,68px)",
              lineHeight: 1.05,
              letterSpacing: "-0.018em",
              color: "var(--ink)",
              margin: "14px 0 0",
              textWrap: "pretty",
            }}
          >
            Vrei să renovezi și vrei să-ți vezi ideile,{" "}
            <i style={{ fontStyle: "italic", color: "var(--gold)" }}>
              înainte să iei decizii?
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
              fontSize: "clamp(13.5px,1.8vw,17px)",
              lineHeight: 1.45,
            }}
          >
            Îți arătăm ideile tale prin transformarea camerelor în{" "}
            <em style={{ ...goldEm, fontSize: "clamp(15px,1.9vw,21px)" }}>
              casa ta de vis
            </em>
            , în stilul dorit și atmosfera visată.
          </p>
        </Reveal>

        {/* media — the before/after slider */}
        <Reveal style={{ gridArea: "media" }}>
          <BeforeAfterSlider
            before="/assets/before-bedroom.jpg"
            after="/assets/after-bedroom.jpg"
            caption="Dormitor"
            beforeAlt="Dormitor înainte de transformare"
            afterAlt="Dormitor după transformare"
          />
        </Reveal>

        {/* cta — a single, undivided call to action */}
        <Reveal style={{ gridArea: "cta" }}>
          <button
            type="button"
            onClick={onStart}
            className="hv-btn-navy"
            style={btnNavy}
          >
            Vreau să-mi văd casa
          </button>
        </Reveal>
      </div>
    </section>
  );
}
