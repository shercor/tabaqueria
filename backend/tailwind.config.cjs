/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.pug'], // Se van a escanear unicamente las clases utilizadas en estas rutas para generar un arhivo css con el menor contenido de tailwind posible, esto significa lo mas liviano posible
  theme: {
    extend: {},
  },
  plugins: [],
}

