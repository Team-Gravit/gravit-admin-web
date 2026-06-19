import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface Crumb {
  label: string;
  href?: string;
}

const serialize = (crumbs: Crumb[]) =>
  crumbs.map((c) => `${c.label}${c.href ?? ''}`).join('');

const CrumbsContext = createContext<Crumb[]>([]);
const SetCrumbsContext = createContext<(crumbs: Crumb[]) => void>(() => {});

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [crumbs, setState] = useState<Crumb[]>([]);
  const setCrumbs = useCallback((next: Crumb[]) => {
    setState((prev) => (serialize(prev) === serialize(next) ? prev : next));
  }, []);
  return (
    <SetCrumbsContext.Provider value={setCrumbs}>
      <CrumbsContext.Provider value={crumbs}>{children}</CrumbsContext.Provider>
    </SetCrumbsContext.Provider>
  );
}

export function useBreadcrumbCrumbs(): Crumb[] {
  return useContext(CrumbsContext);
}

export function useSetBreadcrumb(crumbs: Crumb[]) {
  const setCrumbs = useContext(SetCrumbsContext);
  const key = serialize(crumbs);
  useEffect(() => {
    setCrumbs(crumbs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCrumbs, key]);
  useEffect(() => () => setCrumbs([]), [setCrumbs]);
}
