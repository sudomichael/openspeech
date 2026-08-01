"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { models } from "@/lib/data";

const STORAGE_KEY = "openspeech-compare";

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
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const knownIds = new Set(models.map((m) => m.id));
      const valid = parsed.filter(
        (id): id is string => typeof id === "string" && knownIds.has(id)
      );
      if (valid.length) setSelected(valid.slice(0, MAX_COMPARE));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {}
  }, [selected]);

  const toggle = useCallback((id: string) => {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX_COMPARE) return cur;
      return [...cur, id];
    });
  }, []);

  const clear = useCallback(() => setSelected([]), []);

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
