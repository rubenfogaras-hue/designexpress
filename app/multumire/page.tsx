import Link from "next/link";
import type { Metadata } from "next";
import { CompassGlyph } from "@/components/CompassGlyph";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Comandă primită · Horizont Visuals",
  robots: { index: false },
};

/**
 * Thank-you page. Not part of the paid flow: the Stripe Payment Link is set to
 * `hosted_confirmation`, so Stripe shows its own confirmation after payment and
 * never redirects here. Kept as a plain, unindexed page in case we later point
 * the link's "after payment" redirect at it.
 *
 * Its promise must stay identical to the confirmation email (lib/email.ts) and
 * to step 3 of the wizard: we phone the customer to schedule the live
 * presentation. Nothing here may promise delivery by email.
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
          Gata. Urmează{" "}
          <span style={{ fontStyle: "italic", color: "#b08a4a" }}>discuția</span>{" "}
          ta.
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
          Am primit comanda și pozele tale. Îți pregătesc cele două camere în
          stil clasic-contemporan și te sun cât mai curând posibil, într-o zi
          lucrătoare (luni–vineri), ca să stabilim împreună ziua și ora
          discuției live de 20 de minute.
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
            Nu trebuie să faci nimic acum — doar ține telefonul aproape. Dacă
            mergem mai departe, cei{" "}
            <span
              style={{
                fontFamily: "var(--font-cormorant)",
                fontStyle: "italic",
                color: "#b08a4a",
                fontSize: 16,
              }}
            >
              497 lei
            </span>{" "}
            se scad din proiectul complet — vorbim despre asta în discuția live.
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
