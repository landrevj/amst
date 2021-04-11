/* eslint global-require: off */
const colors = require('tailwindcss/colors');

module.exports = {
  purge: [
    './src/renderer/**/*.tsx'
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black:  colors.black,
      white:  colors.white,
      gray:   colors.trueGray,

      red:    colors.red,
      yellow: colors.amber,
      green:  colors.emerald,
      blue:   colors.blue,
      indigo: colors.indgo,
      purple: colors.purple,
      pink:   colors.pink,
    }
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms'),
  ]
}
