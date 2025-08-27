import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}', './node_modules/@tremor/**/*.{js,ts,jsx,tsx}'],
  theme: {
    transparent: 'transparent',
    current: 'currentColor',
    extend: {
      screens: {
        ssm: '450px',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        s0: 'linear-gradient(90deg, #C2B7FD 0%, #423C5E 100%)',
        s1: 'radial-gradient(97.67% 126.32% at 50% 0%, #010214 25.78%, #7A61BC 99.83%)',
        s2: 'linear-gradient(90deg, #C2B7FD 0%, #9580F7 100%)',

        btndark:
          'radial-gradient(76.25% 76.25% at 50.3% 23.75%, #204C33 0%, #3E5232 100%),radial-gradient(122.5% 122.5% at 52.9% 16.25%, #15D264 0%, #2CBD35 36.26%, #DCF45D 92.54%)',
        btn: 'radial-gradient(76.25% 76.25% at 50.3% 23.75%, #D1F5DE 0%, #F0FADD 100%),radial-gradient(122.5% 122.5% at 52.9% 16.25%, #15D264 0%, #2CBD35 36.26%, #DCF45D 92.54%)',
        btndis: 'linear-gradient(180deg, rgba(159, 179, 159, 0.2) 0%, rgba(190, 255, 186, 0.2) 100%)',
      },
      animation: {
        'spin-slow': 'spin 2s cubic-bezier(1, 0, 0, 1) infinite',
      },

      colors: {
        // light mode
        primary: {
          DEFAULT: 'var(--primary)', // '#5A3FFF'
        },
        border: {
          DEFAULT: '#4A5546',
        },
      },
    },
  },
  darkMode: 'class',
}
