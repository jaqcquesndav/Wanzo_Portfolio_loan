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
        },
        // Ajout des classes gray pour une meilleure compatibilité avec le mode sombre
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        }
      }
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0', transform: 'translateY(10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' }
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.7' }
      }
    },
    animation: {
      fadeIn: 'fadeIn 0.3s ease-out forwards',
      pulse: 'pulse 1.5s ease-in-out infinite'
    }
  },
  plugins: [],
};