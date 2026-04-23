/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        'accent-brown': '#4F3A2D',
        'paper-bg': '#FBF9F4',
        'paper-card': '#FFFFFF',
        'paper-border': '#EAE6DF',
        'taupe': {
          100: '#F3F1EF',
          200: '#EAE6DF',
          500: '#786F66',
          900: '#2D2621',
        },
      },
    },
  },
  plugins: [],
}
