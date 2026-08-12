/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E3A5F",
          dark: "#022448",
          light: "#2A4D7A",
          container: "#e5eeff"
        },
        surface: {
          DEFAULT: "#f8f9ff",
          container: "#eff4ff",
          white: "#ffffff",
          dim: "#e2e8f0"
        },
        border: {
          DEFAULT: "rgba(30, 58, 95, 0.15)",
          dark: "rgba(30, 58, 95, 0.3)"
        }
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "4px",
        lg: "6px"
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
