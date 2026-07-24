import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#29357E",
        "navy-800": "#1D2657",
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
        "card-lg":
          "0 2px 4px rgba(23, 26, 36, 0.05), 0 40px 80px -32px rgba(41, 53, 126, 0.28)",
        logo: "0 10px 30px -10px rgba(41, 53, 126, 0.28), 0 2px 6px rgba(23, 26, 36, 0.06)",
        btn: "0 10px 24px -10px rgba(41, 53, 126, 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
