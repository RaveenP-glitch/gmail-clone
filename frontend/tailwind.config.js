/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gmail: {
          red: '#EA4335',
          blue: '#4285F4',
          green: '#34A853',
          yellow: '#FBBC04',
        },
      },
      fontFamily: {
        'google-sans': ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} 