import type { ReactNode } from 'react';

/** 파트·페르소나 칩 — 한곳에서 스타일을 관리한다(반경은 DS-01 radius-input = rounded-md). */
export function QaChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-border px-1.5 text-caption leading-5 text-fg-secondary">
      {children}
    </span>
  );
}
