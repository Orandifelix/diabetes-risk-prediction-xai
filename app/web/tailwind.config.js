import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand ─────────────────────────────────
        primary: {
          DEFAULT: "#0EA5E9",
          50:  "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          900: "#0C4A6E",
        },
        health: {
          DEFAULT: "#10B981",
          50:  "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        // ── Risk levels ───────────────────────────
        risk: {
          low:      "#10B981",
          lowBg:    "#ECFDF5",
          moderate: "#F59E0B",
          modBg:    "#FFFBEB",
          high:     "#EF4444",
          highBg:   "#FEF2F2",
        },
        // ── Semantic ──────────────────────────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "gauge-sweep": {
          from: { strokeDashoffset: "251" },
          to:   { strokeDashoffset: "var(--gauge-offset)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.5" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "gauge-sweep": "gauge-sweep 1.2s ease-out forwards",
        "pulse-ring":  "pulse-ring 2s ease-in-out infinite",
        "fade-up":     "fade-up 0.4s ease-out",
        "slide-in":    "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
