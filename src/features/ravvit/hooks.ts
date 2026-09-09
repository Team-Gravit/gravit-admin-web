import { useEffect, useRef, useState } from 'react';

/** 한 프레임 주기. 너무 짧으면 마크다운 재파싱 비용이 커진다. */
const TICK_MS = 24;
/**
 * 답변 길이와 무관하게 이 시간 안에 끝낸다 — 긴 답변이 하염없이 흐르지 않도록.
 * **타이핑 속도는 이 값으로 조절한다**: 키우면 느려지고, 줄이면 빨라진다.
 */
const TARGET_DURATION_MS = 1600;

/**
 * 답변을 한 번에 띄우지 않고 점진적으로 드러낸다 (사용자 결정 2026-09-09, 결정 #11 대체).
 * 서버는 완성된 답변을 한 번에 주므로 이것은 표시 연출이며, 네트워크 스트리밍이 아니다.
 * `onTick` 은 노출량이 늘 때마다 호출된다 — 스크롤 추종에 쓴다.
 */
export function useTypewriter(
  text: string,
  enabled: boolean,
  onTick: () => void,
): { shown: string; done: boolean } {
  const [count, setCount] = useState(() => (enabled ? 0 : text.length));
  const tickRef = useRef(onTick);
  tickRef.current = onTick;

  useEffect(() => {
    if (!enabled) {
      setCount(text.length);
      return;
    }

    // 길수록 한 번에 더 많이 드러내 총 소요 시간을 일정하게 유지한다
    const step = Math.max(2, Math.ceil(text.length / (TARGET_DURATION_MS / TICK_MS)));
    let shownCount = 0;
    setCount(0);

    const timer = setInterval(() => {
      shownCount = Math.min(shownCount + step, text.length);
      setCount(shownCount);
      tickRef.current();
      if (shownCount >= text.length) clearInterval(timer);
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [text, enabled]);

  return { shown: text.slice(0, count), done: count >= text.length };
}
