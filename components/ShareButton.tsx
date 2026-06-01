"use client";

import { useState } from "react";

type Props = {
  url: string;
  label?: string;
  className?: string;
};

export default function ShareButton({ url, label = "Share", className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const full = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ url: full });
      } else {
        await navigator.clipboard.writeText(full);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(full);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {}
    }
  };

  return (
    <button
      onClick={share}
      className={`inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg transition-colors ${className}`}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <circle cx="12" cy="3.5" r="1.75" />
        <circle cx="4" cy="8" r="1.75" />
        <circle cx="12" cy="12.5" r="1.75" />
        <path d="M5.5 7.2L10.5 4.3M5.5 8.8L10.5 11.7" />
      </svg>
      {copied ? "Copied!" : label}
    </button>
  );
}
