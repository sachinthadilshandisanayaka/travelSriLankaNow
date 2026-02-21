/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#4300FF',
          blue: '#0065F8',
          cyan: '#00CAFF',
          teal: '#00FFDE',
          // Light variants
          'purple-light': '#E8E0FF',
          'blue-light': '#E0EFFE',
          'cyan-light': '#E0F9FF',
          'teal-light': '#E0FFFA',
        },
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c2d6ff',
          300: '#94b8ff',
          400: '#5c8fff',
          500: '#0065F8',
          600: '#4300FF',
          700: '#3600cc',
          800: '#2d00a6',
          900: '#250085',
        },
        secondary: {
          50: '#e6fbff',
          100: '#ccf7ff',
          200: '#99efff',
          300: '#66e7ff',
          400: '#00CAFF',
          500: '#00b8e6',
          600: '#0099bf',
          700: '#007a99',
          800: '#005c73',
          900: '#003d4d',
        },
        accent: {
          50: '#e6fffa',
          100: '#ccfff5',
          200: '#99ffeb',
          300: '#66ffe1',
          400: '#00FFDE',
          500: '#00e6c8',
          600: '#00bfa5',
          700: '#009982',
          800: '#00735f',
          900: '#004d3f',
        }
      }
    },
  },
  plugins: [],
}
