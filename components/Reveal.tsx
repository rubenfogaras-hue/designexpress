"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import {
  gsap,
  useGSAP,
  EDITORIAL_EASE,
  REVEAL_DURATION,
  REVEAL_Y,
} from "@/lib/gsap";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  /** Extra delay in milliseconds, staggering siblings. */
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  // Any extra attributes (e.g. `onSubmit`/`noValidate` on `as="form"`) are
  // forwarded to the rendered element.
  [prop: string]: unknown;
};

/**
 * Soft reveal-on-scroll powered by GSAP ScrollTrigger — a 12px rise + fade,
 * eased with the house "power3.out". Content is in the DOM from the start
 * (SEO / no-JS friendly); GSAP layers the entrance on after hydration and
 * holds below-the-fold elements at their "from" state until scrolled into view.
 *
 * Respects `prefers-reduced-motion`: motion is skipped and content stays visible.
 * Any extra props (e.g. `onSubmit` on `as="form"`) are forwarded to the element.
 */
export function Reveal({
  as,
  children,
  delay = 0,
  className = "",
  style,
  ...rest
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return; // leave content in its natural, visible state

      gsap.from(el, {
        opacity: 0,
        y: REVEAL_Y,
        duration: REVEAL_DURATION,
        delay: delay / 1000,
        ease: EDITORIAL_EASE,
        scrollTrigger: {
          trigger: el,
          start: "top 92%",
          once: true,
        },
      });
    },
    { scope: ref, dependencies: [delay] }
  );

  return (
    <Tag ref={ref} className={className} style={style} {...rest}>
      {children}
    </Tag>
  );
}
