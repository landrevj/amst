/* eslint global-require: off */
const colors = require('tailwindcss/colors');

module.exports = {
  purge: [
    './src/renderer/**/*.tsx'
  ],
  theme: {
    extend: {
      colors: {
        gray:   colors.trueGray,
      }
    }
  },
  variants: {
    extend: {
      borderWidth: ['focus'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ]
}
