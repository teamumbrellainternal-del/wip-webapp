const brandPreset = require('./brand/dist/tailwind.preset.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [brandPreset],
  content: [
    './src/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  plugins: [require("tailwindcss-animate")],
}
