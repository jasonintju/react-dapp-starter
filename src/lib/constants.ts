/**
 * Project-wide constants. Each constant is defined exactly once here
 * (or in config/ if environment-dependent) — search this file before
 * adding a new one elsewhere.
 */

/**
 * Responsive breakpoints based on the design system.
 * Mobile design: 390px, Desktop design: 1440px, Tablet: 768px (industry standard).
 * Keep in sync with Tailwind breakpoints used in className prefixes.
 */
export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1440,
  largeDesktop: 2560,
} as const;
