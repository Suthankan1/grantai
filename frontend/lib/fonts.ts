/**
 * Font Configuration — Obsidian Precision Design System
 *
 * Font loading strategy:
 * - Clash Display: via Fontshare CDN (in layout.tsx <head>) → CSS var set in globals.css
 * - Satoshi: via Fontshare CDN (in layout.tsx <head>) → CSS var set in globals.css
 * - JetBrains Mono: via next/font/google → CSS var --font-jetbrains
 *
 * All three fonts are mapped to Tailwind's fontFamily via CSS custom properties.
 */

import { JetBrains_Mono } from "next/font/google";

/**
 * JetBrains Mono — monospace for code, data, statistics
 * Available via Google Fonts
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700"],
});

/**
 * fontVariables — CSS custom property class names to spread on <body>
 *
 * Clash Display and Satoshi are loaded via Fontshare CDN stylesheet.
 * Their CSS variable names (--font-clash, --font-satoshi) are declared
 * in globals.css under the Fontshare @font-face definitions.
 */
export const fontVariables = jetbrainsMono.variable;
