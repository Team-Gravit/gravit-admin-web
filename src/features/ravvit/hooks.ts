import { useEffect, useMemo, useRef, useState } from 'react';

/** 점진 렌더 전체 소요 상한. **속도 조절은 이 값으로 한다**(키우면 느려진다). */
const TOTAL_DURATION_MS = 5000;
/** 한 덩어리가 머무는 시간의 하한·상한. 블록 수가 많거나 적어도 리듬이 무너지지 않게. */
const MIN_STEP_MS = 500;
const MAX_STEP_MS = 1000;
/** 이보다 긴 문단은 문장 단위로 더 쪼갠다 — 긴 문단이 통째로 튀어나오지 않도록. */
const MAX_CHUNK = 220;
/** 너무 잘게 쪼개지 않기 위한 하한. */
const MIN_CHUNK = 60;

/**
 * 답변을 **블록 단위**로 끊어 드러낼 지점(문자 오프셋)을 구한다.
 * 코드 펜스 안의 빈 줄은 경계로 보지 않는다 — 펜스가 열린 채 렌더되면
 * ``` 가 그대로 보였다가 코드 블록으로 바뀌는 깜빡임이 생긴다.
 */
function revealOffsets(text: string): number[] {
  const offsets: number[] = [];
  let position = 0;
  let inFence = false;
  let blockStart = 0;

  for (const line of text.split('\n')) {
    position += line.length + 1; // +1 = 개행

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence || line.trim() !== '') continue;

    const cut = Math.min(position, text.length);
    refineLongBlock(text, blockStart, cut, offsets);
    offsets.push(cut);
    blockStart = cut;
  }

  refineLongBlock(text, blockStart, text.length, offsets);
  offsets.push(text.length);

  return [...new Set(offsets)].filter((offset) => offset > 0).sort((a, b) => a - b);
}

/** 긴 문단을 문장 끝(., !, ?, …) 뒤에서 추가로 끊는다. */
function refineLongBlock(text: string, start: number, end: number, out: number[]): void {
  if (end - start <= MAX_CHUNK) return;

  const segment = text.slice(start, end);
  const sentenceEnd = /[.!?…]\s+/g;
  let last = start;

  for (let match = sentenceEnd.exec(segment); match !== null; match = sentenceEnd.exec(segment)) {
    const cut = start + match.index + match[0].length;
    if (cut - last >= MIN_CHUNK && end - cut >= MIN_CHUNK) {
      out.push(cut);
      last = cut;
    }
  }
}

/**
 * 답변을 블록 단위로 점진 렌더한다 (decisions D8-8).
 * 글자 단위 타자기가 아니다 — 덩어리로 붙고, 새 블록에만 CSS 페이드가 걸린다.
 * 서버는 완성 답변을 한 번에 주므로 이것은 **표시 연출이지 네트워크 스트리밍이 아니다.**
 * `onTick` 은 노출량이 늘 때마다 호출된다(스크롤 추종용).
 */
export function useProgressiveReveal(
  text: string,
  enabled: boolean,
  onTick: () => void,
): { shown: string; done: boolean } {
  const offsets = useMemo(() => revealOffsets(text), [text]);
  const [step, setStep] = useState(() => (enabled ? 1 : offsets.length));
  const tickRef = useRef(onTick);
  tickRef.current = onTick;

  useEffect(() => {
    if (!enabled) {
      setStep(offsets.length);
      return;
    }

    const interval = Math.min(
      MAX_STEP_MS,
      Math.max(MIN_STEP_MS, Math.round(TOTAL_DURATION_MS / Math.max(offsets.length, 1))),
    );

    let current = 1; // 첫 블록은 기다리지 않고 바로 보여준다
    setStep(current);

    const timer = setInterval(() => {
      current += 1;
      setStep(current);
      tickRef.current();
      if (current >= offsets.length) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [offsets, enabled]);

  const done = step >= offsets.length;
  return { shown: done ? text : text.slice(0, offsets[step - 1] ?? 0), done };
}
