// const brandPreset = require('./brand/dist/tailwind.preset.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  // presets: [brandPreset],
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './index.html',
  ],
  plugins: [require("tailwindcss-animate")],
}
