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
        // Couleurs de fond cohérentes pour light et dark mode
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f3f4f6',
          tertiary: '#e5e7eb',
          // Dark mode backgrounds
          'dark-primary': '#1a1b1e',
          'dark-secondary': '#25262b',
          'dark-tertiary': '#2c2e33',
          'dark-elevated': '#3b3d42'
        },
        surface: {
          DEFAULT: '#ffffff',
          hover: '#f9fafb',
          // Dark mode surfaces
          dark: '#25262b',
          'dark-hover': '#2c2e33',
          'dark-elevated': '#3b3d42'
        },
        border: {
          DEFAULT: '#e5e7eb',
          light: '#f3f4f6',
          // Dark mode borders
          dark: '#3b3d42',
          'dark-light': '#4b4d52'
        },
        // Textes cohérents
        content: {
          primary: '#111827',
          secondary: '#4b5563',
          tertiary: '#9ca3af',
          // Dark mode text
          'dark-primary': '#f3f4f6',
          'dark-secondary': '#d1d5db',
          'dark-tertiary': '#9ca3af'
        },
        // Classes gray pour compatibilité
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
          900: '#111827',
          950: '#0a0a0b'
        },
        // Dark mode specific grays (pour remplacer les gray-X en dark)
        dark: {
          50: '#3b3d42',
          100: '#2c2e33',
          200: '#25262b',
          300: '#1f2023',
          400: '#1a1b1e',
          500: '#151617',
          600: '#111213',
          700: '#0d0e0f',
          800: '#090a0a',
          900: '#050505'
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
      },
      shimmer: {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' }
      },
      slideUp: {
        '0%': { opacity: '0', transform: 'translateY(20px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' }
      },
      scaleIn: {
        '0%': { opacity: '0', transform: 'scale(0.95)' },
        '100%': { opacity: '1', transform: 'scale(1)' }
      }
    },
    animation: {
      fadeIn: 'fadeIn 0.3s ease-out forwards',
      pulse: 'pulse 1.5s ease-in-out infinite',
      shimmer: 'shimmer 2s infinite linear',
      slideUp: 'slideUp 0.4s ease-out forwards',
      scaleIn: 'scaleIn 0.3s ease-out forwards'
    }
  },
  plugins: [],
};