/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'text-dark': '#f3f3ef',
        'text-light': '#344c50'
      },
      keyframes: {
        fill: {
          '0%': { width: `0%` },
          '100%': { width: '100%' }
        }
      },
      screens: {
        adCol: '1400px',
        tablet: '640px'
      }
    }
  },
  plugins: []
}
