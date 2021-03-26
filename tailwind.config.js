/* eslint global-require: off */
module.exports = {
  purge: [
    './src/renderer/**/*.tsx'
  ],
  theme: {},
  variants: {},
  plugins: [
    require('@tailwindcss/forms'),
  ]
}
