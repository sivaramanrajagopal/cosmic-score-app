/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',  // Add this line here
  theme: {
    extend: {
      colors: {
        'cosmic-indigo': '#4338ca',
        'cosmic-purple': '#7e22ce',
      }
    },
  },
  plugins: [],
}