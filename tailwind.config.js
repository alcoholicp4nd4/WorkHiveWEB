/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        blob: "blob 7s infinite",
        float: "float 6s ease-in-out infinite",
        fadeIn: "fadeIn 0.6s ease-out forwards",
        slideIn: "slideIn 0.5s ease-out forwards",
        pulse: "pulse 3s infinite",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '25%': { transform: 'translateY(-15px) rotate(-2deg)' },
          '75%': { transform: 'translateY(15px) rotate(2deg)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20px, -30px) scale(1.1)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '75%': { transform: 'translate(30px, 10px) scale(1.05)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      colors: {
        primary: {
          light: '#CB9DF0',
          DEFAULT: '#9B6FE0',
          dark: '#7B61FF',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15)',
        'hover': '0 10px 20px rgba(0, 0, 0, 0.1)',
      },
      zIndex: {
        '-10': '-10',
      },
    },
  },
  plugins: [],
}