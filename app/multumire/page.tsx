import Link from "next/link";
import type { Metadata } from "next";
import { CompassGlyph } from "@/components/CompassGlyph";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Gata. Designul tău e pe drum. · Horizont Visuals",
  robots: { index: false },
};

/**
 * Thank-you page. Not part of the paid flow: the Stripe Payment Link is set to
 * `hosted_confirmation`, so Stripe shows its own confirmation after payment and
 * never redirects here. Kept as a plain, unindexed page in case we later point
 * the link's "after payment" redirect at it.
 */
export default function ThankYou() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 32px",
      }}
    >
      <Reveal style={{ maxWidth: 620, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <CompassGlyph size={34} />
        </div>

        <p
          style={{
            margin: "0 0 18px",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#9a8a64",
          }}
        >
          Comandă primită
        </p>

        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-cormorant)",
            fontWeight: 500,
            color: "#1a1d2c",
            fontSize: "clamp(38px,6vw,60px)",
            lineHeight: 1.04,
            letterSpacing: "-0.018em",
          }}
        >
          Gata. Designul tău e pe{" "}
          <span style={{ fontStyle: "italic", color: "#b08a4a" }}>drum</span>.
        </h1>

        <div
          style={{
            width: 64,
            height: 1,
            background: "rgba(176,138,74,0.55)",
            margin: "28px auto",
          }}
        />

        <p
          style={{
            margin: "0 auto",
            maxWidth: "34em",
            fontSize: 17,
            lineHeight: 1.62,
            color: "#3d4255",
          }}
        >
          Am primit comanda și pozele tale. Vei primi renderul fotorealist + nota
          de designer în 1–2 zile lucrătoare, pe email.
        </p>

        <div
          style={{
            margin: "34px auto 0",
            maxWidth: 460,
            background: "#f0eadc",
            border: "1px solid rgba(176,138,74,0.45)",
            borderRadius: 10,
            padding: "22px 26px",
          }}
        >
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: "#3d4255" }}>
            Ți-a plăcut? Cei{" "}
            <span
              style={{
                fontFamily: "var(--font-cormorant)",
                fontStyle: "italic",
                color: "#b08a4a",
                fontSize: 16,
              }}
            >
              297 lei
            </span>{" "}
            se scad din proiectul complet — răspunde la email și discutăm.
          </p>
        </div>

        <p
          style={{
            margin: "34px 0 0",
            fontFamily: "var(--font-cormorant)",
            fontSize: 19,
            color: "#1a1d2c",
          }}
        >
          Ruben Fogaras <span style={{ color: "#b08a4a" }}>·</span> Horizont{" "}
          <span style={{ fontStyle: "italic" }}>Visuals</span>
        </p>

        <Link
          href="/"
          className="hv-link"
          style={{
            display: "inline-block",
            marginTop: 30,
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            fontWeight: 500,
            color: "#7a7460",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            padding: 6,
          }}
        >
          ← Înapoi la pagină
        </Link>
      </Reveal>
    </main>
  );
}
