/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        // ── Brand palette (single source of truth — see design reference) ──
        primary: {
          DEFAULT: "#FFC107", // Primary Yellow — brand, CTAs, highlights
          hover: "#D4A017", // Accent Gold — hover / pressed
          dark: "#D4A017",
        },
        accent: {
          gold: "#D4A017", // Accent Gold — hover states, icons, accents
        },
        surface: {
          deep: "#121212", // Deep Black — app background
          dark: "#1E1E1E", // Dark Gray — sidebar, topbar, panels
          card: "#2C2C2E", // Card Gray — cards, elevated surfaces
          elevated: "#3A3A3C", // Borders, inputs, tracks
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1AA",
          muted: "#71717A",
        },
        hairline: "rgba(255,255,255,0.07)",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        lg: "0.625rem", // 10px — buttons, small controls
        xl: "0.875rem", // 14px — cards, posters, tiles
        "2xl": "1.125rem", // 18px — section panels
        "3xl": "1.5rem", // 24px — hero / modal
      },
      spacing: {
        18: "4.5rem",
        sidebar: "16rem",
        "sidebar-sm": "4.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.35)",
        panel: "0 10px 34px -12px rgba(0,0,0,0.65)",
        pop: "0 18px 44px -16px rgba(0,0,0,0.8)",
        glow: "0 10px 26px -10px rgba(255,193,7,0.45)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #FFC107 0%, #D4A017 100%)",
        "dark-gradient": "linear-gradient(180deg, #1E1E1E 0%, #121212 100%)",
        "hero-scrim":
          "linear-gradient(90deg, #121212 0%, rgba(18,18,18,0.94) 32%, rgba(18,18,18,0.55) 62%, rgba(18,18,18,0.15) 100%)",
        "card-scrim":
          "linear-gradient(180deg, rgba(18,18,18,0) 35%, rgba(18,18,18,0.85) 100%)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.35s cubic-bezier(0.4,0,0.2,1) both",
        "slide-up": "slideUp 0.4s cubic-bezier(0.4,0,0.2,1) both",
        "scale-in": "scaleIn 0.22s cubic-bezier(0.4,0,0.2,1) both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
