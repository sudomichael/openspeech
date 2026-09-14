"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./Icons";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);

  const toggle = () => {
    const next = !isDark;
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-full border border-border hover:border-border-strong hover:bg-surface-2 transition-colors flex items-center justify-center text-fg-muted hover:text-fg"
      suppressHydrationWarning
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
