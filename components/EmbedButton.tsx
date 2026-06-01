"use client";

import { useState } from "react";

export default function EmbedButton({ modelId }: { modelId: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const snippet = `<iframe src="https://www.openspeech.dev/embed/${modelId}" width="100%" height="320" frameborder="0" style="border-radius:12px;border:1px solid #e8e4dc;" loading="lazy" title="OpenSpeech sample: ${modelId}"></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg transition-colors"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M5.5 4L2 8l3.5 4M10.5 4L14 8l-3.5 4" />
        </svg>
        Embed
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold tracking-tight mb-2">Embed this model</h3>
            <p className="text-sm text-fg-muted mb-4">
              Drop this iframe into any blog post or page.
            </p>
            <pre className="bg-surface-2 border border-border rounded-lg p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {snippet}
            </pre>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-sm text-fg-muted hover:text-fg transition-colors"
              >
                Close
              </button>
              <button
                onClick={copy}
                className="px-4 py-1.5 bg-accent text-accent-fg rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {copied ? "Copied!" : "Copy snippet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
