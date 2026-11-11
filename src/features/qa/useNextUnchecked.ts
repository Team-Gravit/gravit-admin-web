import { useCallback, useEffect, useRef, useState } from 'react';
interface Entry {
  key: string;
  featureId: number;
  unchecked: boolean;
}
/** Unfold before focusing. A single document-order navigator is shared by all three review tabs. */
export function useNextUnchecked(entries: Entry[]) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<number>>(new Set());
  const [pending, setPending] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const last = useRef<string | null>(null);
  const focus = useCallback((key: string) => {
    const button = refs.current.get(key);
    if (!button) return;
    button.scrollIntoView({ block: 'center' });
    button.focus({ preventScroll: true });
    last.current = key;
  }, []);
  useEffect(() => {
    if (pending) {
      focus(pending);
      setPending(null);
    }
  }, [pending, focus]);
  return {
    collapsed,
    toggle: (id: number) =>
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    hasTarget: entries.some((e) => e.unchecked),
    register: (key: string, element: HTMLButtonElement | null) => {
      if (element) refs.current.set(key, element);
      else refs.current.delete(key);
    },
    onFocus: (key: string) => {
      last.current = key;
    },
    next: () => {
      const from = entries.findIndex((e) => e.key === last.current);
      const target =
        entries.slice(from + 1).find((e) => e.unchecked) ?? entries.find((e) => e.unchecked);
      if (!target) return;
      if (collapsed.has(target.featureId)) {
        setCollapsed((prev) => {
          const next = new Set(prev);
          next.delete(target.featureId);
          return next;
        });
        setPending(target.key);
      } else focus(target.key);
    },
  };
}
