import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#120F20",
          s100: "#1A1728",
          s200: "#241F38",
          s300: "#302A48",
        },
        brand: {
          DEFAULT: "#6C4EF2",
          light: "#8B6FF5",
          deep: "#2D1F5E",
          hero: "#0F0A20",
        },
        personal: {
          cover: "#1A0E38",
          surface: "#2D1F5E",
          accent: "#6C4EF2",
          "accent-end": "#8B6FF5",
          text: "#C4B5FD",
          hero: "#0F0A20",
          tab: "#1A1430",
          dim: "#6B5FA0",
        },
        group: {
          cover: "#0A2A1A",
          surface: "#064E35",
          accent: "#0EC97F",
          "accent-end": "#34D399",
          text: "#A7F3D0",
          hero: "#091A12",
          tab: "#0E2018",
          dim: "#3D7A5C",
        },
        business: {
          cover: "#1A1200",
          surface: "#2E2000",
          accent: "#D4880A",
          "accent-end": "#F5A623",
          text: "#FDE68A",
          hero: "#0D0900",
          tab: "#1A1000",
          dim: "#7A5010",
        },
        circle: {
          cover: "#1A0828",
          surface: "#4A1060",
          accent: "#D946EF",
          "accent-end": "#E879F9",
          text: "#F5D0FE",
          hero: "#100520",
          tab: "#1E0E30",
          dim: "#7A3A90",
        },
        urgency: {
          high: "#E24B4A",
          "high-text": "#FCA5A5",
          "high-surface": "#450A0A",
          medium: "#F59E0B",
          "medium-text": "#FDE68A",
          "medium-surface": "#451A00",
          clear: "#10B981",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "DM Sans", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out infinite 2s",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "slide-up": "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2.5s linear infinite",
        "orb-float": "orbFloat 8s ease-in-out infinite",
        "orb-float-reverse": "orbFloat 10s ease-in-out infinite reverse",
        "card-lift": "cardLift 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(2deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(50px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        orbFloat: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(20px, -30px) scale(1.05)" },
          "66%": { transform: "translate(-15px, 15px) scale(0.95)" },
        },
        cardLift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
