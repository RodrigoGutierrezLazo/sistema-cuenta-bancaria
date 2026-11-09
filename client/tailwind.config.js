/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        banco: {
          50: '#f4f2ff',
          100: '#ece7fe',
          200: '#dad0fd',
          300: '#beacf9',
          400: '#9e7df4',
          500: '#7f4deb',
          600: '#6802c1',
          700: '#5a02a8',
          800: '#4c038c',
          900: '#3f0473',
          950: '#26004c',
        },
        institucional: {
          primary: '#6802c1',
          secondary: '#0202c6',
          accent: '#63aee6',
          dark: '#1e1b4b',
        }
      },
    },
  },
  plugins: [],
}
