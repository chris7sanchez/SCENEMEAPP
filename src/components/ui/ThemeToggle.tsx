"use client";

import { useTheme } from "@/theme/useTheme";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={`Cambiar a modo ${theme === "dark" ? "día" : "noche"}`}
      className="sm-press inline-flex items-center justify-center w-10 h-10 rounded-full
                 bg-white/10 border border-white/10 hover:border-white/20
                 text-white/80 hover:text-white transition-all duration-200"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
