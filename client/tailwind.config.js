/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FFC107",
          hover: "#FFD54F",
          dark: "#D4A017",
        },
        accent: {
          gold: "#D4A017",
        },
        surface: {
          deep: "#121212",
          dark: "#1E1E1E",
          card: "#2C2C2E",
          elevated: "#3A3A3C",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1AA",
          muted: "#71717A",
        },
      },
      fontFamily: {
        display: ['"Made Tommy"', "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #FFC107 0%, #D4A017 100%)",
        "dark-gradient":
          "linear-gradient(180deg, #1E1E1E 0%, #121212 100%)",
      },
    },
  },
  plugins: [],
};
