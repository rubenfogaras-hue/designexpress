import { CompassGlyph } from "../CompassGlyph";

/** Slim navy status bar above the hero. */
export function TopBar() {
  return (
    <div style={{ background: "var(--navy)", color: "var(--gold-300)" }}>
      <div
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "9px clamp(22px,5vw,40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          fontSize: 12,
          letterSpacing: "0.02em",
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

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
            color: "var(--gold-300)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--success)",
              }}
            />
            Acum primim proiecte
          </span>
          <span style={{ color: "var(--hairline-dark)" }}>·</span>
          <span style={{ color: "var(--on-dark-soft)" }}>
            Design Express — livrare în câteva zile
          </span>
        </span>
      </div>
    </div>
  );
}
