/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 60px rgba(17, 29, 36, 0.12)",
      },
      colors: {
        sand: "#f6ecdd",
        coral: "#cf6330",
        tide: "#1b6977",
        ink: "#12222b",
      },
    },
  },
  plugins: [],
};
