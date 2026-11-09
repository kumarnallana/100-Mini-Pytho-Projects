/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rps: {
          dark: "#0b0f19",
          card: "#111827",
          border: "#1f293d",
          accent: "#6366f1",
          rock: "#f97316",
          paper: "#3b82f6",
          scissors: "#10b981",
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slight": "bounceSlight 1s infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: 1, filter: "drop-shadow(0 0 15px rgba(99, 102, 241, 0.6))" },
          "50%": { opacity: 0.7, filter: "drop-shadow(0 0 5px rgba(99, 102, 241, 0.2))" },
        },
        bounceSlight: {
          "0%, 100%": { transform: "translateY(-4%)" },
          "50%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

