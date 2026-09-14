"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { track } from "@/lib/analytics";
import { models } from "@/lib/data";

const STORAGE_KEY = "openspeech-compare";
const CHANGE_EVENT = "openspeech-selection";
function readSelection() { try { return sessionStorage.getItem(STORAGE_KEY) ?? "[]"; } catch { return "[]"; } }
function subscribe(callback: () => void) { window.addEventListener(CHANGE_EVENT, callback); return () => window.removeEventListener(CHANGE_EVENT, callback); }
function saveSelection(value: string[]) { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch {} window.dispatchEvent(new Event(CHANGE_EVENT)); }

type Ctx = {
  selected: string[];
  toggle: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  canAdd: boolean;
  maxItems: number;
};

const CompareContext = createContext<Ctx | null>(null);

export const MAX_COMPARE = 5;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readSelection, () => "[]");
  const selected = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? Array.from(new Set(parsed.filter((id): id is string => typeof id === "string" && models.some((m) => m.id === id)))).slice(0, MAX_COMPARE) : [];
    } catch { return []; }
  }, [raw]);
  const toggle = useCallback((id: string) => {
    if (!models.some((m) => m.id === id)) return;
    let current: string[] = [];
    try { const parsed = JSON.parse(readSelection()); if (Array.isArray(parsed)) current = parsed; } catch {}
    const next = current.includes(id) ? current.filter((x) => x !== id) : current.length < MAX_COMPARE ? [...current, id] : current;
    saveSelection(next);
    track("comparison_select", { model: id });
  }, []);
  const clear = useCallback(() => saveSelection([]), []);

  const value = useMemo<Ctx>(
    () => ({
      selected,
      toggle,
      clear,
      isSelected: (id) => selected.includes(id),
      canAdd: selected.length < MAX_COMPARE,
      maxItems: MAX_COMPARE,
    }),
    [selected, toggle, clear]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): Ctx {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}
