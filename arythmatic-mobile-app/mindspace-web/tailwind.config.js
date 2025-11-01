/**************************
 * Tailwind config
 *************************/
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B1422",
        panel: "#0E1726",
        text: "#E7E9EF",
        sub: "#A7AEC0",
        border: "#0A1220",
        primary: "#6B5CE7",
        good: "#31C76A",
        warn: "#F0B429",
        bad: "#F16364",
      },
    },
  },
  plugins: [],
};
