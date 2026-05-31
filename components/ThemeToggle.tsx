"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-full border border-border hover:border-border-strong hover:bg-surface-2 transition-colors flex items-center justify-center text-fg-muted hover:text-fg"
      suppressHydrationWarning
    >
      {mounted && (isDark ? <SunIcon /> : <MoonIcon />)}
    </button>
  );
}
