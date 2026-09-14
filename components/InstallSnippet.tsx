"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

export default function InstallSnippet({ code, model }: { code: string; model: string }) {
  const [status, setStatus] = useState("");
  return <div className="mb-8">
    <button type="button" className="text-sm text-highlight mb-2 underline" onClick={async () => {
      try { await navigator.clipboard.writeText(code); setStatus("Copied"); track("install_copy", { model }); }
      catch { setStatus("Select and copy the code below."); }
    }}>Copy instructions</button>
    <span role="status" className="text-xs text-fg-muted ml-3">{status}</span>
    <pre className="bg-surface-2 border border-border rounded-xl p-4 text-sm font-mono overflow-x-auto"><code>{code}</code></pre>
  </div>;
}
