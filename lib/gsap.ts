"use client";

/**
 * Central GSAP setup for the site.
 *
 * Everything animation-related imports `gsap` and `ScrollTrigger` from here so
 * the plugin is registered exactly once, and so the house "feel" (a slow, eased,
 * never-bouncy motion — cubic-bezier(0.22, 0.36, 0, 1)) lives in one place.
 *
 * Keep animations restrained: soft 12px rise + fade only. The gold is a thread,
 * not a coat — and the motion should be the same.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// The Horizont Visuals easing, expressed for GSAP.
export const EDITORIAL_EASE = "power3.out";
export const REVEAL_DURATION = 0.7;
export const REVEAL_Y = 12;

export { gsap, ScrollTrigger, useGSAP };
