"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("sceneme-theme") as Theme) || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    // Keep shadcn/Tailwind (.dark class) in sync with the --sm-* tokens (data-theme).
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("sceneme-theme", theme);
  }, [theme]);

  return {
    theme,
    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    set: setTheme,
  };
}
