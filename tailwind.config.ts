import type { Config } from "tailwindcss";

/**
 * Horizont Visuals — editorial-luxury design system.
 * Warm, low-contrast, ivory-based. One warm-neutral family + navy + a thread of gold.
 * No gradients, no bright colors — the gold is a thread, not a coat.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#f6f1e8", // canvas — never pure white
        cream: "#f0eadc", // layered surface for cards / bands
        "cream-2": "#ebe3d1", // deeper cream band
        field: "#faf6ee", // input fill
        ink: "#1a1d2c", // near-black navy (headings)
        slate: "#3d4255", // soft slate body text
        navy: "#1b2236", // primary fill (buttons, offer/footer)
        "navy-hover": "#283250",
        "navy-active": "#12182a",
        gold: "#b08a4a", // brushed antique gold — hairlines, numerals, glyph
        muted: "#9a8a64", // muted gold-brown for overlines
        "muted-2": "#8a8474",
        "label-ink": "#7a7460",
        danger: "#b0492f",
      },
      fontFamily: {
        // Loaded via next/font in app/layout.tsx and exposed as CSS variables.
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        display: "-0.018em",
        overline: "0.16em",
      },
      transitionTimingFunction: {
        // Slow, eased — calm, never bouncy.
        editorial: "cubic-bezier(0.22, 0.36, 0, 1)",
      },
      keyframes: {
        // Soft reveal-on-scroll: 12px rise + fade.
        rise: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(0.22, 0.36, 0, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
