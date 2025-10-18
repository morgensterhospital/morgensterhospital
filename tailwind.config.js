/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'background-dark': '#0D1117', // Darker, cleaner background
        'surface-dark': '#161B22',   // Slightly lighter surface
        'primary': '#58A6FF',       // A brighter, more vibrant blue
        'primary-hover': '#79B8FF',  // Lighter blue for hover
        'accent': '#F778BA',         // A futuristic pink/magenta accent
        'text-light': '#C9D1D9',     // Softer white for text
        'text-muted': '#8B949E',      // Muted grey for secondary text
        'border-futuristic': 'rgba(255, 255, 255, 0.1)', // For glassmorphism border
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'futuristic': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
};
