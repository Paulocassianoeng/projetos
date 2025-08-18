/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f3fa', // azul bem claro
          100: '#c7e6f5',
          200: '#a3d8f0',
          300: '#7fc9eb',
          400: '#5bbbe6',
          500: '#3ba6d8', // azul médio
          600: '#2b7bb0', // azul escuro
          700: '#205c85',
          800: '#153d59',
          900: '#0a1e2c',
        },
        accent: {
          50: '#e6f8f3', // verde-água bem claro
          100: '#c7f1e6',
          200: '#a3e9d8',
          300: '#7fe1cb',
          400: '#5bd9be',
          500: '#3bcfae', // verde-água médio
          600: '#2ba184', // verde-água escuro
          700: '#206f5c',
          800: '#154034',
          900: '#0a201a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
