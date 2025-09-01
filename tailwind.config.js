/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./pages/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        goldSheen: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
         shimmerSweep: {
      '0%': { transform: 'translateX(-150%) skewX(-10deg)' },
      '100%': { transform: 'translateX(150%) skewX(-10deg)' },
    },
        focusPulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(201,162,63,0.28)" },
          "70%": { boxShadow: "0 0 0 10px rgba(201,162,63,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(201,162,63,0)" },
        },
      },
      animation: {
        goldSheen: "goldSheen 4s linear infinite",
        shimmerSweep: "shimmerSweep 2.4s ease-in-out infinite",
        focusPulse: "focusPulse 1.1s ease-out",
      },
      colors: {
        aca: {
          gold:  "#C9A23F",
          green: "#006A4E",
          red:   "#B22222",
          gray:  "#2F2F2F",
          dark:  "#1C1C1C",
          light: "#F5F7FA",
          beige: "#F4EDDF",
        },
      },
      boxShadow: {
        lgx: "0 24px 64px -24px rgba(0,0,0,.30)",
        card: "0 20px 60px -30px rgba(0,0,0,.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        diwani: ["Diwani", "sans-serif"],
      },
    },
  },
  plugins: [],
};
