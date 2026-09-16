/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      colors: {
        primary: {
          DEFAULT: '#213448', // Dark Blue/Slate
          hover: '#1a2a3a',
          foreground: '#ffffff',
          light: '#547792', // Medium Blue as light variant
        },
        secondary: {
          DEFAULT: '#547792', // Medium Blue
          hover: '#436178',
          foreground: '#ffffff',
          light: '#94B4C1', // Light Blue as light variant
        },
        accent: {
          DEFAULT: '#94B4C1', // Light Blue
          hover: '#7da0b0',
          foreground: '#213448',
        },
        'off-black': '#1A1A1A', // Off Black
        'off-white': '#F5F5F5', // Off White
        'brand-yellow': '#F4B400', // Brand Gold/Yellow
        peach: '#F9E6D6', // Hero Background
        background: {
          cream: '#FDF8F5', // Warm cream restored
          white: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Clean sans-serif
      }
    },
  },
  plugins: [],
};