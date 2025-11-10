/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F5F7F5',
        secondary: '#5B9F5A',
        tertiary: '#2D5F2E',
      },
      spacing: {
        'sidebar': '250px',
        'sidebar-collapsed': '64px',
      },
      boxShadow: {
        'inset-border': 'inset 1px 0 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}