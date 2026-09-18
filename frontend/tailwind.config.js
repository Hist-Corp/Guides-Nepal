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
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-28px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(28px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.82)' },
          '60%': { opacity: '1', transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.06)' },
        },
        'spin-slow': {
          '100%': { transform: 'rotate(360deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'draw-line': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        // `both` fill mode keeps delayed elements hidden until their turn.
        'fade-in-up': 'fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-up-slow': 'fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'fade-in-down': 'fade-in-down 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-left': 'fade-in-left 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-right': 'fade-in-right 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'zoom-in': 'zoom-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pop-in': 'pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        marquee: 'marquee 30s linear infinite',
        'gradient-x': 'gradient-x 9s ease infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'spin-slow': 'spin-slow 14s linear infinite',
        wiggle: 'wiggle 0.6s ease-in-out infinite',
        'draw-line': 'draw-line 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
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