"use client";

import { track } from "@/lib/analytics";
import { CLOUD_URL } from "@/lib/site";
import type { ComponentProps } from "react";

export default function TrackedLink({ event = "cloud_click", model, children, href, onClick, ...props }: ComponentProps<"a"> & { event?: string; model?: string }) {
  let destination = href;
  try {
    const url = new URL(href ?? "");
    if (url.origin === new URL(CLOUD_URL).origin) {
      for (const [key, value] of Object.entries({ utm_source: "directory", utm_medium: "referral", utm_campaign: "paid_cloud", utm_content: model ?? "all" })) {
        if (!url.searchParams.has(key)) url.searchParams.set(key, value);
      }
      destination = url.href;
    }
  } catch { /* Relative links need no cross-site attribution. */ }
  return <a {...props} href={destination} onClick={(e) => {
    onClick?.(e);
    if (!e.defaultPrevented) track(event, { model: model ?? "all" });
  }}>{children}</a>;
}
