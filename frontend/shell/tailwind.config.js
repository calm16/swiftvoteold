export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f9fc",
        ink: "#07111f",
        line: "#d6deeb",
        primary: { DEFAULT: "#0f4cdb", soft: "#e8f0ff", deep: "#092466" },
        accent: "#b40f17",
      },
      boxShadow: {
        card: "0 24px 60px rgba(5, 17, 34, 0.08)",
        soft: "0 18px 40px rgba(15, 76, 219, 0.12)",
      },
      fontFamily: {
        display: [
          '"Iowan Old Style"',
          '"Palatino Linotype"',
          '"Book Antiqua"',
          "Georgia",
          "serif",
        ],
        body: ['"Avenir Next"', "Avenir", '"Segoe UI"', "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
