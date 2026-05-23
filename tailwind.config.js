/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables dark mode using the class 'dark' on the html element
  theme: {
    extend: {
      colors: {
        accent: {
          saffron: '#f97316',
          indigo: '#4f46e5',
          deep: '#1e1b4b',
          emerald: '#10b981',
          saffronGlow: 'rgba(249, 115, 22, 0.15)',
        },
        darkBg: '#080c14',
        darkCard: 'rgba(15, 23, 42, 0.45)',
        lightBg: '#f8fafc',
        lightCard: 'rgba(255, 255, 255, 0.7)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        glassLight: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        glow: '0 0 15px rgba(249, 115, 22, 0.4)',
      },
      backdropBlur: {
        glass: '12px',
      }
    },
  },
  plugins: [],
}
