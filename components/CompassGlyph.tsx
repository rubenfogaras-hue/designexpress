/**
 * The Horizont Visuals signature — a custom 4-point "compass" glyph.
 * `detailed` draws the filled gold blades (used for the lockup / thank-you mark);
 * the plain variant is a simple cross for small inline accents.
 */
export function CompassGlyph({
  size = 20,
  detailed = true,
  className,
}: {
  size?: number;
  detailed?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <g stroke="#b08a4a" strokeWidth={detailed ? 1.25 : 1.6} strokeLinecap="round">
        <path d="M16 2 L16 30" />
        <path d="M2 16 L30 16" />
        {detailed && (
          <>
            <path d="M16 16 L16 2 L17.4 14.6 Z" fill="#b08a4a" stroke="none" />
            <path d="M16 16 L16 30 L14.6 17.4 Z" fill="#b08a4a" stroke="none" />
            <path d="M16 16 L30 16 L17.4 14.6 Z" fill="#b08a4a" stroke="none" />
            <path d="M16 16 L2 16 L14.6 17.4 Z" fill="#b08a4a" stroke="none" />
          </>
        )}
      </g>
      <circle cx="16" cy="16" r={detailed ? 1.4 : 1.6} fill="#b08a4a" />
    </svg>
  );
}
