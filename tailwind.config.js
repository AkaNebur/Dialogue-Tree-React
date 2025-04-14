// tailwind.config.js
/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

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
  plugins: [
    typography, // Using imported plugin
  ],
}