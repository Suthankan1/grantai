import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian Precision design system
        obsidian: "#080810",
        surface: "#0F0F1A",
        primary: {
          DEFAULT: "#6C47FF",
          hover: "#7C5AFF",
          glow: "rgba(108, 71, 255, 0.35)",
        },
        accent: {
          DEFAULT: "#00D4AA",
          hover: "#00EEC0",
          glow: "rgba(0, 212, 170, 0.3)",
        },
        text: {
          DEFAULT: "#F0F0FF",
          muted: "#6B7280",
          subtle: "#9CA3AF",
        },
        border: {
          DEFAULT: "rgba(240, 240, 255, 0.08)",
          strong: "rgba(240, 240, 255, 0.15)",
          glow: "rgba(108, 71, 255, 0.4)",
        },
        // Semantic aliases mapping to CSS vars
        background: "var(--bg-obsidian)",
        foreground: "var(--color-text)",
      },
      fontFamily: {
        display: ["var(--font-clash)", "system-ui", "sans-serif"],
        sans: ["var(--font-satoshi)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(108,71,255,0.15) 50%, transparent 100%)",
        "primary-gradient":
          "linear-gradient(135deg, #6C47FF 0%, #9B73FF 100%)",
        "accent-gradient":
          "linear-gradient(135deg, #00D4AA 0%, #00FFD1 100%)",
        "surface-gradient":
          "linear-gradient(180deg, #0F0F1A 0%, #080810 100%)",
        "hero-glow":
          "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(108,71,255,0.25) 0%, transparent 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(108, 71, 255, 0.35), 0 0 40px rgba(108, 71, 255, 0.15)",
        "glow-sm": "0 0 10px rgba(108, 71, 255, 0.3)",
        "glow-accent": "0 0 20px rgba(0, 212, 170, 0.35), 0 0 40px rgba(0, 212, 170, 0.15)",
        "glow-accent-sm": "0 0 10px rgba(0, 212, 170, 0.3)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.07)",
        card: "0 4px 24px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(108, 71, 255, 0.2)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(108, 71, 255, 0.3)",
            opacity: "1",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(108, 71, 255, 0.6), 0 0 60px rgba(108, 71, 255, 0.3)",
            opacity: "0.85",
          },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(80px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(80px) rotate(-360deg)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        orbit: "orbit 8s linear infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "20px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
