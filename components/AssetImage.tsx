"use client";

import { useState, type CSSProperties } from "react";
import { CompassGlyph } from "./CompassGlyph";

/**
 * A 16:9 photo in the house frame. If the file isn't in /public/assets yet the
 * page shows a warm placeholder instead of a broken image — drop the file in
 * with the expected name and it appears automatically, no code change.
 *
 * `muted` applies the design's desaturation used on every "before" photo.
 */
export function AssetImage({
  src,
  alt,
  muted = false,
  style,
}: {
  src: string;
  alt: string;
  muted?: boolean;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState(false);

  const frame: CSSProperties = {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: "var(--radius-lg)",
    display: "block",
    ...style,
  };

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{
          ...frame,
          background: "var(--surface-card)",
          border: "1px solid var(--hairline)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <CompassGlyph size={26} />
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 14,
            color: "var(--muted)",
            padding: "0 16px",
            textAlign: "center",
          }}
        >
          {alt}
        </span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        ...frame,
        objectFit: "cover",
        filter: muted ? "saturate(0.72) brightness(0.98)" : undefined,
      }}
    />
  );
}
