/** @type {import('tailwindcss').Config} */
module.exports = {
  // Importante: Note que incluímos "./app/**/*.{...}" para pegar tudo dentro de app
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        blue: {
          600: '#2563eb', // Azul da sua marca
        }
      }
    },
  },
  plugins: [],
}