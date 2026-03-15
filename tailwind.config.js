/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        abyss: "#04111d",
        steel: "#0e2235",
        ember: "#ff6b2c",
        signal: "#ffb36a",
        mist: "#93a4b8",
        card: "#0a1828",
        line: "#17314a",
        success: "#2dd4bf"
      }
    }
  },
  plugins: []
};
