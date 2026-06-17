import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nomad Engineers brand system — non-negotiable
        nomad: {
          black: "#141414",
          cream: "#F5F0E8",
          green: "#27AE60",
          "green-bright": "#2ECC71",
          "green-dark": "#1E6B3C",
          "dark-gray": "#2B2B2B",
          "muted-gray": "#8A7F72",
          "mid-gray": "#555555",
          "light-gray": "#F0F0F0",
          gold: "#D4A857", // finance pillar only
        },
        // Pillar tag colors (Section 2 of spec)
        pillar: {
          build: "#27AE60",
          create: "#2ECC71",
          automate: "#1E6B3C",
          discover: "#8A7F72",
          admin: "#F5F0E8",
          finance: "#D4A857",
          brand: "#141414",
          hiring: "#2B2B2B",
        },
        // shadcn/ui semantic tokens, mapped to brand (dark-first)
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
      },
      fontFamily: {
        // Prompt ExtraBold for headlines, DM Mono for body/UI
        display: ["var(--font-prompt)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        // Brand: cards are sharp (0). Pills use 4px. Nothing more.
        none: "0",
        pill: "4px",
        DEFAULT: "0",
      },
      letterSpacing: {
        label: "0.1em",
        pill: "0.15em",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 300ms ease-out",
        "slide-in-left": "slide-in-left 400ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
