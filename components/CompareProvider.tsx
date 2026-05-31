"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
    try {
      const raw = sessionStorage.getItem("compare");
      if (raw) setSelected(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("compare", JSON.stringify(selected));
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
