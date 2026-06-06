import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

/** breadcrumb 한 조각 (04 §8-3). href 없으면 비링크(현재 페이지). */
export interface Crumb {
  label: string;
  href?: string;
}

const serialize = (crumbs: Crumb[]) =>
  crumbs.map((c) => `${c.label}${c.href ?? ''}`).join('');

/** 값/세터 분리 — 세터 context 는 안정 참조라 페이지의 발행 effect 가 churn 하지 않음. */
const CrumbsContext = createContext<Crumb[]>([]);
const SetCrumbsContext = createContext<(crumbs: Crumb[]) => void>(() => {});

/**
 * 전역 breadcrumb 상태 (04 §8-3). 상세 페이지가 trail 을 발행하고 Header <Breadcrumb/> 가 구독한다.
 * loader 기반 handle 대신 — 본 프로젝트는 TanStack Query(페이지 fetch) 아키텍처라 §8-3-3 의 query 훅 연쇄와 정합.
 */
export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [crumbs, setState] = useState<Crumb[]>([]);
  // 동일 내용이면 이전 참조 유지 → 발행 루프 방지.
  const setCrumbs = useCallback((next: Crumb[]) => {
    setState((prev) => (serialize(prev) === serialize(next) ? prev : next));
  }, []);
  return (
    <SetCrumbsContext.Provider value={setCrumbs}>
      <CrumbsContext.Provider value={crumbs}>{children}</CrumbsContext.Provider>
    </SetCrumbsContext.Provider>
  );
}

/** Header <Breadcrumb/> 가 구독. */
export function useBreadcrumbCrumbs(): Crumb[] {
  return useContext(CrumbsContext);
}

/** 상세 페이지가 자신의 breadcrumb 경로를 발행. 언마운트 시 초기화(목록 화면은 미표시). */
export function useSetBreadcrumb(crumbs: Crumb[]) {
  const setCrumbs = useContext(SetCrumbsContext);
  const key = serialize(crumbs);
  useEffect(() => {
    setCrumbs(crumbs);
    // key 가 crumbs 내용을 인코딩하므로 deps 로 사용(crumbs 참조는 매 렌더 변경).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCrumbs, key]);
  useEffect(() => () => setCrumbs([]), [setCrumbs]);
}
