/* eslint global-require: off */
const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: [
    './src/renderer/**/*.tsx'
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1792px',
        '4xl': '2408px',
      },
      colors: {
        gray: colors.trueGray,
        cyan: colors.cyan,
        teal: colors.teal,
        rose: colors.rose,
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        'bg-gradient-shift': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        }
      },
      animation: {
        'bg-gradient-shift': 'bg-gradient-shift 30s ease infinite',
        'bg-gradient-shift-fast': 'bg-gradient-shift 10s ease-in-out infinite',
        'fade-in': 'fade-in 0.25s ease-in'
      },
      zIndex: {
        '-10': '-10',
      },
      height: {
        'screen-minus-titlebar': 'calc(100vh - 1.5rem)',
      },
      maxHeight: {
        'screen-minus-titlebar': 'calc(100vh - 1.5rem)',
        'unset': 'unset',
      },
      margin: {
        'screen-minus-titlebar': 'calc(100vh - 1.5rem)',
      },
      gridTemplateColumns: {
        'fill-48': 'repeat(auto-fill, minmax(12rem, 1fr))',
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ]
}
