import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * 도구 호출 로그 (RAVVIT_SPEC §B-3).
 * 대기 중에는 펼쳐 유일한 진행 신호로 쓰고, 종료 이벤트 수신 시 자동으로 접는다.
 * `message` 는 원문 그대로 노출한다 — 한국어 매핑은 도구가 늘 때마다 규칙 관리 비용이 든다.
 */
interface ToolLogBlockProps {
  logs: string[];
  pending: boolean;
}

export function ToolLogBlock({ logs, pending }: ToolLogBlockProps) {
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);

  if (logs.length === 0) return null; // 도구 호출 0회면 블록 자체를 렌더하지 않는다

  const open = manualOpen ?? pending; // 사용자가 한 번이라도 토글하면 그 선택이 이긴다
  const Icon = open ? ChevronDown : ChevronRight;

  return (
    <div className="mb-3 rounded-lg border border-border bg-surface p-3">
      <button
        type="button"
        onClick={() => setManualOpen(!open)}
        className="flex w-full items-center gap-1 text-caption tabular-nums text-muted-foreground"
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        도구 {logs.length}회 호출
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          {logs.map((log, index) => (
            <p
              // 로그는 append-only 라 인덱스가 안정적이다
              key={index}
              className="whitespace-pre-wrap break-all font-mono text-caption text-muted-foreground"
            >
              {log}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
