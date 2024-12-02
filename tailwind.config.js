/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all React components
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto': ['Roboto']
      },
      colors: {
        'material': {
          100: '#121212',
          200: '#1d1d1d',
          300: '#2d2d2d',
          400: '#373737',
        },
        'teal': {
          100: '#B2DFDB',
          200: '#80CBC4',
          300: '#4DB6AC',
          400: '#26A69A',
          500: '#009688',
          600: '#00897B',
          700: '#00796B',
          800: '#00695C',
          900: '#004D40',
        }
      }
    },
  },
  plugins: [],
}
