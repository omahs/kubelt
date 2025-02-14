/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,jsx,js,mdx}',
    '../../packages/design-system/src/**/*.{ts,tsx,jsx,js}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin')],
}
