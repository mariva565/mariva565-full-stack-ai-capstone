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
      fontFamily: {
        rubik: ["var(--font-rubik)", "sans-serif"],
        poppins: ["var(--font-rubik)", "sans-serif"],
        shantell: ["var(--font-shantell)", "Caveat", "cursive"],
        handwritten: ["var(--font-shantell)", "Caveat", "cursive"],
      },
      colors: {
        brand: {
          50: "#f8f6ff",
          100: "#ede8ff",
          200: "#ddd5ff",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#6366f1", // v1 Indigo (Primary)
          600: "#8B5CF6", // v1 Purple
          700: "#4d33c4",
          800: "#3730a3",
          900: "#0F172A"  // v1 Navy Dark
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4" // v1 Cyan
        },
        "v1-blue": "#6366F1",
        "v1-purple": "#8B5CF6",
        "v1-cyan": "#06B6D4"
      },
      backgroundImage: {
        'v1-gradient': "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)",
        'glass-gradient': "linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
        'glass-light': "rgba(255, 255, 255, 0.15)",
      },
      borderRadius: {
        'pill': '50rem',
      },
      boxShadow: {
        'v1-soft': "0 10px 30px rgba(139, 92, 246, 0.1)",
        'v1-glow': "0 0 20px rgba(139, 92, 246, 0.3)",
        'glass': "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delay": "float 6s ease-in-out 2s infinite",
        "fade-in-up": "fadeInUp 0.8s ease forwards",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        "mascot-float": "mascot-float 3s ease-in-out infinite",
        "text-shimmer": "textShimmer 3s ease-in-out infinite",
        "logo-spotlight": "logoSpotlight 2s ease-in-out infinite",
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
        textShimmer: {
          "0%": { backgroundPosition: "100% 50%" },
          "50%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        logoSpotlight: {
          "0%": { opacity: "0.3", transform: "scale(0.8) translateX(-10px)" },
          "50%": { opacity: "1", transform: "scale(1.1) translateX(5px)" },
          "100%": { opacity: "0.3", transform: "scale(0.8) translateX(-10px)" },
        },
      },
    }
  },
  plugins: []
};

export default config;
