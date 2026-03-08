import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans:    ["'Cabinet Grotesk'", "'DM Sans'", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "Consolas", "monospace"],
      },
      colors: {
        ink:     "#070A12",
        paper:   "#0D1117",
        card:    "#121820",
        ridge:   "#181F2A",
        rule:    "#1E2736",
        mist:    "#263040",
        text:    "#E2E8F5",
        dim:     "#8897AE",
        sub:     "#4A5568",
        gold:    "#F0C060",
        "gold-dim": "#B8922A",
        teal:    "#38BDF8",
        emerald: "#4ADE80",
        rose:    "#F87171",
        violet:  "#A78BFA",
        amber:   "#FBBF24",
        cobalt:  "#60A5FA",
      },
      animation: {
        "fade-up":   "fadeUp 0.35s ease forwards",
        "fade-in":   "fadeIn 0.2s ease forwards",
        "pulse-dot": "pulseDot 2s infinite",
        "slide-in":  "slideIn 0.25s ease forwards",
        "glow":      "glow 3s ease-in-out infinite",
        "shimmer":   "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp:   { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "none" } },
        fadeIn:   { from: { opacity: "0" }, to: { opacity: "1" } },
        pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.15" } },
        slideIn:  { from: { opacity: "0", transform: "translateX(-8px)" }, to: { opacity: "1", transform: "none" } },
        glow:     { "0%,100%": { boxShadow: "0 0 8px rgba(240,192,96,0.1)" }, "50%": { boxShadow: "0 0 24px rgba(240,192,96,0.35)" } },
        shimmer:  { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
export default config;
