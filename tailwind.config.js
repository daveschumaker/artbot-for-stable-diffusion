/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}'
  ],
  daisyui: {
    themes: [
      {
        light: {
          'background-color': '#f2f2f2',
          accent: '#7e5a6c',
          'base-100': 'white',
          error: '#D14D3D',
          info: '#00c9ff',
          neutral: '#0c0700',
          primary: '#6AB7C6',
          secondary: '#8697BE',
          success: '#00946b',
          warning: '#E5963B'
        },
        dark: {
          'background-color': '#222222',
          accent: '#7e5a6c',
          'base-100': 'white',
          error: '#D14D3D',
          info: '#00c9ff',
          neutral: '#0c0700',
          primary: '#6AB7C6',
          secondary: '#8697BE',
          success: '#00946b',
          warning: '#E5963B'
        }
      }
    ],
    darkTheme: 'dark'
  },
  theme: {
    extend: {
      colors: {
        'body-color': 'var(--body-color)',
        'body-solid-color': 'var(--body-solid-color)',
        highlight: 'var(--highlight)',
        'input-color': 'var(--input-text)',
        main: 'var(--main-color)',
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
        adCol: '900px',
        tablet: '640px',
        '2xl': '1440px',
        '3xl': '1536px',
        '4xl': '1920px'
      }
    }
  },
  plugins: [require('daisyui')]
}
