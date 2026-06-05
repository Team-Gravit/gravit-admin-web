import { useEffect } from 'react';
import { useBlocker } from 'react-router';

/**
 * 페이지 이탈 보호 (04 §8-4). 이중 보호:
 *  (1) beforeunload — 브라우저 닫기/새로고침
 *  (2) useBlocker — 라우터 내부 이동
 * 반환된 blocker.state === 'blocked' 일 때 UnsavedChangesModal 노출.
 */
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  return useBlocker(hasUnsavedChanges);
}
