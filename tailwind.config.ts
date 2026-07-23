import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#29357E",
        red: "#CE363A",
        surface: "#F5F7FB",
        ink: "#171A24",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(23, 26, 36, 0.04), 0 12px 32px -12px rgba(41, 53, 126, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
