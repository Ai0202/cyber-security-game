import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0a0a1a",
          card: "#1a1a2e",
          green: "#00ff88",
          magenta: "#ff00ff",
          cyan: "#00d4ff",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
