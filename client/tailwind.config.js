/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Urbanist"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        display: ['"Urbanist"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['"Urbanist"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
