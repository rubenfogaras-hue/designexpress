"use client";

import { useState } from "react";

/**
 * Before/after reveal slider — one frame instead of two photos side by side.
 *
 * The "after" photo is the base layer; the "before" photo sits on top, clipped
 * from the right so only the left `pos`% of it shows. Drag the divider and the
 * clip follows, wiping one image into the other.
 *
 * Interaction is a single transparent `<input type="range">` stretched over the
 * whole frame. That one element buys mouse drag, touch drag, click-to-jump,
 * arrow-key control and a screen-reader-friendly slider role for free — far
 * less code than hand-rolled pointer handlers, and better behaved.
 */
export function BeforeAfterSlider({
  before,
  after,
  caption,
  beforeAlt,
  afterAlt,
  onDark = false,
}: {
  before: string;
  after: string;
  caption: string;
  beforeAlt: string;
  afterAlt: string;
  /** Set on navy sections so the caption uses the lighter gold. */
  onDark?: boolean;
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 11",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background: "var(--surface-card)",
          userSelect: "none",
        }}
      >
        {/* after — the base layer */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={after}
          alt={afterAlt}
          loading="lazy"
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* before — clipped from the right, so it reveals from the left edge */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 ${100 - pos}% 0 0)`,
            transition: dragging ? "none" : "clip-path var(--dur-fast) var(--ease)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={before}
            alt={beforeAlt}
            loading="lazy"
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(0.72) brightness(0.98)",
            }}
          />
        </div>

        {/* the seam */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${pos}%`,
            width: 2,
            marginLeft: -1,
            background: "var(--canvas)",
            boxShadow: "0 0 12px rgba(19,24,41,0.35)",
            pointerEvents: "none",
            transition: dragging ? "none" : "left var(--dur-fast) var(--ease)",
          }}
        />

        {/* the grip — purely decorative; the range input below does the work */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: `${pos}%`,
            transform: "translate(-50%,-50%)",
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "var(--canvas)",
            border: "1px solid var(--gold)",
            boxShadow: "0 2px 14px rgba(19,24,41,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            pointerEvents: "none",
            transition: dragging ? "none" : "left var(--dur-fast) var(--ease)",
          }}
        >
          <Chevron dir="left" />
          <Chevron dir="right" />
        </div>

        <Tag side="left" tone="dark" text="Înainte" />
        <Tag side="right" tone="light" text="După" />

        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          aria-label={`${caption} — trage pentru a compara înainte și după`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            margin: 0,
            opacity: 0,
            cursor: "ew-resize",
            appearance: "none",
            WebkitAppearance: "none",
            background: "transparent",
            // Horizontal drags move the slider; vertical ones still scroll the
            // page, so the frame never traps a thumb mid-scroll on a phone.
            touchAction: "pan-y",
          }}
        />
      </div>

      <figcaption
        style={{
          marginTop: 14,
          textAlign: "center",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          color: onDark ? "var(--gold-300)" : "var(--gold)",
          fontSize: "clamp(17px,2.2vw,22px)",
          lineHeight: 1.3,
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}

/** Corner label. Sits above the images but never intercepts a drag. */
function Tag({
  side,
  tone,
  text,
}: {
  side: "left" | "right";
  tone: "dark" | "light";
  text: string;
}) {
  return (
    <span
      style={{
        position: "absolute",
        bottom: "clamp(12px,2.5vw,20px)",
        left: side === "left" ? "clamp(12px,2.5vw,20px)" : undefined,
        right: side === "right" ? "clamp(12px,2.5vw,20px)" : undefined,
        padding: "8px 15px",
        borderRadius: "var(--radius-sm)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        background: tone === "dark" ? "rgba(27,34,54,0.88)" : "var(--canvas)",
        color: tone === "dark" ? "var(--on-dark)" : "var(--ink)",
        pointerEvents: "none",
      }}
    >
      {text}
    </span>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--gold)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
