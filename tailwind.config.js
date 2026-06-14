/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50:'#fff5f5', 100:'#ffe0e0', 200:'#ffc0c0', 300:'#ff9090',
          400:'#ff5555', 500:'#e63030', 600:'#c41c1c', 700:'#a01515',
          800:'#7d1010', 900:'#5c0a0a',
        }
      }
    },
  },
  plugins: [],
}
