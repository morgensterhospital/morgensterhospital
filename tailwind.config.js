/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'background-dark': '#0f172a',
        'surface-dark': '#1e293b',
        'primary': '#2dd4bf',
        'primary-hover': '#5eead4',
        'accent': '#38bdf8',
        'text-light': '#e2e8f0',
        'text-muted': '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
