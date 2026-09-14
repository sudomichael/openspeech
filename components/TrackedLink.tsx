"use client";

import { track } from "@/lib/analytics";
import type { ComponentProps } from "react";

export default function TrackedLink({ event = "cloud_click", model, children, ...props }: ComponentProps<"a"> & { event?: string; model?: string }) {
  return <a {...props} onClick={() => track(event, { model: model ?? "all" })}>{children}</a>;
}
