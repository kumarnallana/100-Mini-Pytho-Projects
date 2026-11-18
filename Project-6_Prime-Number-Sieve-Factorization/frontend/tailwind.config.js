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
        prime: {
          dark: "#080c14",
          card: "#101726",
          border: "#1e293b",
          emerald: "#10b981",
          amber: "#f59e0b",
          violet: "#8b5cf6",
          cyan: "#06b6d4",
          rose: "#f43f5e",
        },
      },
    },
  },
  plugins: [],
};
