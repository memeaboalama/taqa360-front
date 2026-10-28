/** @type {import('tailwindcss').Config} */
export default {
  // Use class-based dark mode; default remains light unless 'dark' class is applied
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#306FAA',
        'brand-accent': '#EA993E',
        'brand-dark': '#042E44',
        'brand-light': '#ECECEA',
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        top: '0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1)',
        'glow-primary': '0 0 20px rgba(48, 111, 170, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};