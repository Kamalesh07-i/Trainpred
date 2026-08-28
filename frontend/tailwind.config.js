/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          light: "#F5F5F7",
          dark: "#1D1D1F",
          card: "#18181A",
          surface: "#242426",
          elevated: "#2C2C2E",
          border: "rgba(170, 170, 170, 0.2)",
          borderHover: "rgba(0, 122, 255, 0.4)",
          grey: "#AAAAAA",
          blue: "#007AFF",
          blueHover: "#0062CC",
          blueGlow: "rgba(0, 122, 255, 0.25)"
        },
        rail: {
          dark: "#121214",
          card: "#1D1D1F",
          cardHover: "#242426",
          border: "#2C2C2E",
          cyan: "#007AFF",
          emerald: "#30D158",
          amber: "#FF9F0A",
          rose: "#FF453A",
          purple: "#BF5AF2",
          blue: "#007AFF"
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 122, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 122, 255, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
