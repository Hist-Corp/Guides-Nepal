/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
            colors: {
        brand: {
          yellow: "#F4B400"
        },
        darkBlue: "#213448",
        peach: "#FFF0E6",
        lightBlue: "#E0F2FE",
        primary: {
          DEFAULT: "#213448",
          hover: "#1a2a3a",
          foreground: "#ffffff",
          light: "#547792"
        },
        secondary: {
          DEFAULT: "#547792",
          hover: "#436178",
          foreground: "#ffffff",
          light: "#94B4C1"
        },
        accent: {
          DEFAULT: "#F4B400",
          hover: "#E5A800",
          foreground: "#213448"
        },
        surface: {
          DEFAULT: "#ffffff",
          paper: "#f5f7fa",
          dark: "#f0f4f8"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
}
