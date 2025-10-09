/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode via class
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        card: '#1E1E1E',
        'text-main': '#E0E0E0',
        accent: '#00FFFF',
        'glow-start': 'rgba(0, 255, 255, 0)',
        'glow-end': 'rgba(0, 255, 255, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Nunito Sans', 'sans-serif'],
      },
      boxShadow: {
        'aqua-glow': '0 0 15px 5px rgba(0, 255, 255, 0.2)',
        'aqua-glow-strong': '0 0 25px 10px rgba(0, 255, 255, 0.3)',
      },
    },
  },
  plugins: [],
};
