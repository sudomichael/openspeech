"use client";

import { useId, useState } from "react";
import { track } from "@/lib/analytics";

export default function WaitlistForm({ model }: { model?: string }) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState("");
  if (status === "success") return <p role="status" className="text-sm text-fg">You’re on the list. We’ll let you know when hosted access is ready.</p>;
  return <form className="space-y-2" onSubmit={async (event) => {
    event.preventDefault();
    setStatus("sending"); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), model }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Please try again.");
      setStatus("success"); track("waitlist_signup", { model: model ?? "all" });
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); setStatus("idle"); }
  }}>
    <label htmlFor={id} className="block text-xs text-fg-muted">Email for launch updates</label>
    <input id={id} name="email" type="email" required maxLength={200} autoComplete="email" className="w-full rounded-lg bg-canvas border border-border px-3 py-2 text-sm" placeholder="you@example.com" />
    <button disabled={status === "sending"} className="w-full rounded-lg bg-fg text-canvas px-3 py-2.5 text-sm font-medium disabled:opacity-50">{status === "sending" ? "Joining…" : "Join the Cloud waitlist"}</button>
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    <p className="text-[11px] text-fg-muted">Your email is used for OpenSpeech launch updates.</p>
  </form>;
}
