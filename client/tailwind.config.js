/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Archivo"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        navy: {
          800: '#152A47',
          900: '#0B192C',
          950: '#060F1B',
        },
        surface: {
          paper: '#F5F4F0',
          card: '#FFFFFF',
          muted: '#ECEAE2',
          border: '#DEDCD3',
        }
      },
    },
  },
  plugins: [],
}
