"use client";

const TIPS = [
  "Fotografiază ziua, la lumină naturală — fără bliț.",
  "Prinde toată camera într-un cadru — stai într-un colț.",
  "Ține telefonul orizontal (landscape).",
  "Fără filtre, fără editare — pozele reale mă ajută cel mai mult.",
];

/** "Cum să fotografiez corect?" — the small helper modal inside step 1. */
export function PhotoTipsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(19,24,41,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 300,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cum să fotografiez corect"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--canvas)",
          borderRadius: "var(--radius-xl)",
          maxWidth: 460,
          width: "100%",
          padding: 34,
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-hover)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              fontSize: 26,
              color: "var(--ink)",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Cum să fotografiez corect?
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="hv-muted-hover"
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              lineHeight: 1,
              color: "var(--muted)",
              cursor: "pointer",
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            width: 48,
            height: 1,
            background: "var(--gold)",
            opacity: 0.6,
            margin: "18px 0 22px",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {TIPS.map((tip, i) => (
            <div key={tip} style={{ display: "flex", gap: 14 }}>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  color: "var(--gold)",
                  fontSize: 17,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p
                style={{
                  margin: 0,
                  color: "var(--body-strong)",
                  fontSize: 15,
                  lineHeight: 1.5,
                }}
              >
                {tip}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="hv-btn-navy"
          style={{
            marginTop: 26,
            width: "100%",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: 14,
            color: "var(--on-primary)",
            background: "var(--navy)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: 14,
            cursor: "pointer",
          }}
        >
          Am înțeles
        </button>
      </div>
    </div>
  );
}
