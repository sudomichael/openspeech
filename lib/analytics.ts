type Properties = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gizmo?: ((event: string, properties?: Properties) => void) & { q?: unknown[][] };
  }
}

// Never send email addresses, submitted text, or audio URLs to analytics.
export function track(event: string, properties: Properties = {}) {
  if (typeof window === "undefined") return;
  try {
    if (!window.gizmo) {
      const queued = Object.assign((...args: unknown[]) => { queued.q.push(args); }, { q: [] as unknown[][] });
      window.gizmo = queued;
    }
    window.gizmo(event, properties);
  } catch { /* Analytics must never interrupt a visitor's task. */ }
}

export function sampleProperties(src: string): Properties {
  const parts = src.split("/");
  return { model: parts[2] ?? "unknown", voice: parts[3] ?? "unknown", script: (parts[4] ?? "custom").split(".")[0] };
}
