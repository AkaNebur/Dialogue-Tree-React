// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  important: true, // Makes Tailwind styles override React Flow defaults
  theme: {
    extend: {}
  },
  plugins: [],
}