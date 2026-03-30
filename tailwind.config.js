/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // SHU QATOR BORLIGINI TEKSHIRING
  ],
  theme: {
    extend: {
      colors: {
        brand: "#FF9800", // O'zimizning fast-food rangimiz
      },
    },
  },
  plugins: [],
};
