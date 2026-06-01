"use client";

import { useEffect, useState } from "react";

export default function SearchTrigger() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes("mac"));
  }, []);

  const open = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        ctrlKey: !isMac,
        bubbles: true,
      })
    );
  };

  return (
    <button
      onClick={open}
      aria-label="Search"
      className="hidden md:inline-flex items-center gap-2 bg-surface-2 hover:bg-border border border-border hover:border-border-strong rounded-md pl-2.5 pr-2 py-1.5 text-xs text-fg-subtle transition-colors"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11l3 3" />
      </svg>
      <span>Search…</span>
      <kbd className="font-mono text-[10px] bg-surface border border-border rounded px-1 py-0.5">
        {isMac ? "⌘K" : "Ctrl+K"}
      </kbd>
    </button>
  );
}
