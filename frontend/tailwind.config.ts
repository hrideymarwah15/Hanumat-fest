import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors from UI.md
        primary: {
          DEFAULT: "#b20e38",
          50: "#fef2f4",
          100: "#fde6eb",
          200: "#fbd0db",
          300: "#f8a9bc",
          400: "#f27597",
          500: "#e94874",
          600: "#d42a5c",
          700: "#b20e38",
          800: "#951235",
          900: "#801333",
          950: "#470518",
        },
        secondary: {
          DEFAULT: "#ffe5cd",
          50: "#fff9f3",
          100: "#fff3e6",
          200: "#ffe5cd",
          300: "#ffd4a8",
          400: "#ffb970",
          500: "#ff9838",
          600: "#f07d12",
          700: "#c76309",
          800: "#9e4f0f",
          900: "#804310",
          950: "#451f05",
        },
        // Sport-specific colors
        cricket: {
          green: "#27ae60",
          light: "#2ecc71",
        },
        football: {
          green: "#00b894",
          light: "#55efc4",
        },
        volleyball: {
          orange: "#ff6348",
          light: "#ff7f50",
        },
        basketball: {
          orange: "#ff6b35",
          light: "#ff8c5a",
        },
        badminton: {
          red: "#b20e38",
          light: "#d42a5c",
        },
        tabletennis: {
          blue: "#2c3e50",
          light: "#34495e",
        },
        chess: {
          dark: "#2c3e50",
          light: "#95a5a6",
        },
        tennis: {
          green: "#26de81",
          light: "#20bf6b",
        },
        // Status Colors
        status: {
          pending: "#94a3b8",
          payment: "#eab308",
          confirmed: "#22c55e",
          waitlist: "#3b82f6",
          cancelled: "#ef4444",
          withdrawn: "#6b7280",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        heading: ["var(--font-bebas)", "var(--font-montserrat)", "sans-serif"],
        accent: ["var(--font-righteous)", "cursive"],
        mono: ["var(--font-orbitron)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(178, 14, 56, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(178, 14, 56, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #b20e38 0%, #ffe5cd 100%)",
        "cricket-gradient": "linear-gradient(135deg, #27ae60 0%, #b20e38 100%)",
        "football-gradient": "linear-gradient(135deg, #00b894 0%, #ffe5cd 100%)",
        "volleyball-gradient": "linear-gradient(135deg, #ff6348 0%, #b20e38 100%)",
        "basketball-gradient": "linear-gradient(135deg, #ff6b35 0%, #ffe5cd 100%)",
        "badminton-gradient": "linear-gradient(135deg, #b20e38 0%, #ffe5cd 100%)",
        "tabletennis-gradient": "linear-gradient(135deg, #ffe5cd 0%, #b20e38 100%)",
        "chess-gradient": "linear-gradient(135deg, #2c3e50 0%, #ffe5cd 100%)",
        "tennis-gradient": "linear-gradient(135deg, #26de81 0%, #20bf6b 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))",
      },
      boxShadow: {
        glow: "0 0 20px rgba(178, 14, 56, 0.3)",
        "glow-lg": "0 0 40px rgba(178, 14, 56, 0.4)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "card-hover": "0 20px 40px -15px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
