/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#197ca8',
          dark: '#156088',
          light: '#e6f3f8',
          hover: '#1e90c3'
        },
        background: {
          DEFAULT: '#ffffff',
          dark: '#1a1a1a'
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#2d2d2d'
        },
        border: {
          DEFAULT: '#e5e7eb',
          dark: '#404040'
        }
      }
    },
  },
  plugins: [],
};