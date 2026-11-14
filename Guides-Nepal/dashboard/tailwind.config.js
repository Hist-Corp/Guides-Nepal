/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /*
         * Brand system ported from the reference design
         * (guides nepal dashboard design architect): soft SaaS look,
         * BLUE primary, sky data-viz, tangerine accent, mint success.
         */
        brand: {
          yellow: "#F4B400", // legacy token kept for backward compatibility
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        accent: {
          DEFAULT: "#ff8a5c",
          hover: "#f06f3d",
          foreground: "#ffffff",
          300: "#ffc79b",
          400: "#ffb27a",
          500: "#ff8a5c",
          600: "#f06f3d",
          700: "#d95a2b",
        },
        flame: {
          400: "#f9a8d4",
          500: "#f472b6",
          600: "#db2777",
        },
        leaf: {
          500: "#34d399",
          600: "#10b981",
        },
        darkBlue: "#213448",
        ink: {
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#0b1120",
        },
        peach: "#FFF0E6",
        lightBlue: "#E0F2FE",
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
          foreground: "#ffffff",
          light: "#93c5fd",
        },
        secondary: {
          DEFAULT: "#547792",
          hover: "#436178",
          foreground: "#ffffff",
          light: "#94B4C1",
        },
        surface: {
          DEFAULT: "#ffffff",
          paper: "#f6f9fc",
          dark: "#f0f5fa",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(30, 41, 59, 0.04), 0 12px 32px -16px rgba(37, 99, 235, 0.16)",
        "card-dark": "0 1px 2px rgba(0, 0, 0, 0.3), 0 12px 32px -16px rgba(37, 99, 235, 0.3)",
        "btn-blue": "0 8px 20px -8px rgba(37, 99, 235, 0.55)",
        "btn-yellow": "0 8px 20px -8px rgba(244, 180, 0, 0.55)",
      },
      fontFamily: {
        sans: ["Graphik", "Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "fade-up": "fade-up 0.45s ease both",
        "fade-in": "fade-in 0.3s ease both",
        "slide-in": "slide-in 0.3s ease both",
        pop: "pop 0.25s ease both",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        pop: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
}
