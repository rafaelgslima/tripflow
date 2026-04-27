import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        "tf-bg":           "var(--tf-bg)",
        "tf-bg-2":         "var(--tf-bg-2)",
        "tf-bg-3":         "var(--tf-bg-3)",
        "tf-card":         "var(--tf-bg-card)",
        "tf-border":       "var(--tf-border)",
        "tf-border-amber": "var(--tf-border-amber)",
        "tf-text":         "var(--tf-text)",
        "tf-muted":        "var(--tf-muted)",
        "tf-amber":        "var(--tf-amber)",
        "tf-amber-soft":   "var(--tf-amber-soft)",
        "tf-amber-glow":   "var(--tf-amber-glow)",
      },
      fontFamily: {
        poppins:      ["var(--font-poppins)", "sans-serif"],
        display:      ["var(--font-cormorant)", "Georgia", "serif"],
        sans:         ["var(--font-outfit)", "system-ui", "sans-serif"],
        outfit:       ["var(--font-outfit)", "system-ui", "sans-serif"],
        cormorant:    ["var(--font-cormorant)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
