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
    extend: {
      colors: {
        node: {
          start: '#ffffff',
          hello: '#dbeafe',
          products: '#dcfce7',
          great: '#fef3c7',
          more: '#f3e8ff',
          later: '#fee2e2',
        },
        border: {
          start: '#d1d5db',
          hello: '#93c5fd',
          products: '#86efac',
          great: '#fcd34d',
          more: '#d8b4fe',
          later: '#fca5a5',
        },
        mono: {
          bg: '#121212',
          text: '#E0E0E0',
          secondaryText: '#B0B0B0',
          border: '#444444',
          accent: '#888888',
        },
        // New dark theme colors
        dark: {
          bg: '#1a1a1a',
          surface: '#2d2d2d',
          border: '#3d3d3d',
          text: '#e0e0e0',
          accent: '#3367d9',
          panel: 'rgba(45, 45, 45, 0.85)'
        }
      }
    },
  },
  plugins: [],
}