import type { Config } from "tailwindcss";

const config: Config = {
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
          500: "#6f56d9",
          700: "#4d33c4",
          900: "#2e1d7a"
        }
      }
    }
  },
  plugins: []
};

export default config;
