/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "framed-black": "#272727",
        "framed-white": "#DBDFD8",
        "framed-gray": "#333333",
        "framed-legacy": "#8A8A8A",
      },
    },
  },
  plugins: [],
};
