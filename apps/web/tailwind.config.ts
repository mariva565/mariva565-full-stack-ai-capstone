import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f8f6ff",
          100: "#ede8ff",
          200: "#ddd5ff",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#6f56d9",
          600: "#6366f1",
          700: "#4d33c4",
          800: "#3730a3",
          900: "#2e1d7a"
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4"
        }
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delay": "float 6s ease-in-out 2s infinite",
        "fade-in-up": "fadeInUp 0.8s ease forwards",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
      },
    }
  },
  plugins: []
};

export default config;
