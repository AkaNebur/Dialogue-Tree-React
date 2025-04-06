/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        }
      }
    },
  },
  plugins: [],
}