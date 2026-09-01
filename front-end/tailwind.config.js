/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#d4af37",
        dark: "#1a1a1a",
        light: "#f7f6f3",
      },
    },
  },
  plugins: [],
}
