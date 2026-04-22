import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        success: "hsl(var(--success))",
        danger: "hsl(var(--danger))"
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(77, 255, 166, 0.12), 0 20px 50px rgba(0, 0, 0, 0.35)",
        panel: "0 24px 60px rgba(3, 11, 19, 0.42)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(113, 255, 214, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113, 255, 214, 0.08) 1px, transparent 1px)",
        glow: "radial-gradient(circle at top, rgba(77, 255, 166, 0.18), transparent 35%), radial-gradient(circle at right, rgba(52, 211, 255, 0.14), transparent 30%)"
      },
      animation: {
        "pulse-soft": "pulse-soft 2.8s ease-in-out infinite",
        float: "float 8s ease-in-out infinite"
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      }
    }
  },
  plugins: [animate]
};

export default config;
