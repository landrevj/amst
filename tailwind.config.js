/* eslint global-require: off */
const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: [
    './src/renderer/**/*.tsx'
  ],
  theme: {
    extend: {
      colors: {
        gray: colors.trueGray,
        cyan: colors.cyan,
        teal: colors.teal,
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
      },
      animation: {
        'bg-gradient-shift': 'bg-gradient-shift 30s ease infinite',
        'bg-gradient-shift-fast': 'bg-gradient-shift 10s ease-in-out infinite',
      },
      zIndex: {
        '-10': '-10',
      },
      height: {
        'screen-minus-titlebar': 'calc(100vh - 1.5rem)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ]
}
