/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0b1220',
        darkCard: '#111d33',
        darkSurface: '#0f172a',
      }
    },
  },
  plugins: [],
}
