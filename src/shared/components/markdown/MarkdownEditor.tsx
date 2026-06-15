import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { Textarea } from '@/shared/components/ui/textarea';
import { MarkdownViewer } from '@/shared/components/markdown/MarkdownViewer';

interface MarkdownEditorProps {
  /** {...register('content')} — RHF 배선을 내부 Textarea에 그대로 전달. */
  registration: UseFormRegisterReturn;
  /** watch('content') — 미리보기 렌더용 현재 값. */
  value: string;
  id?: string;
  /** 내부 Textarea로 전달(min-h, dirtyBorder, roClass 등). 미리보기 패널에도 동일 적용해 높이·표시 일관. */
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const TAB_BASE = 'inline-flex h-8 w-20 items-center justify-center transition-colors';
const TAB_ACTIVE = 'bg-primary-subtle text-primary';
const TAB_INACTIVE = 'text-fg-secondary hover:text-foreground';

/**
 * 마크다운 작성/미리보기 토글 에디터 (GitHub 이슈/PR 스타일).
 * 작성 탭 = Textarea(register 유지), 미리보기 탭 = MarkdownViewer 렌더.
 * Textarea 는 항상 mount(미리보기 시 hidden)해 RHF ref·입력값·포커스 보존.
 * 토글은 로컬 상태라 폼 dirty/이탈 가드를 건드리지 않는다.
 */
export function MarkdownEditor({
  registration,
  value,
  id,
  className,
  disabled,
  placeholder,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const hasContent = value.trim().length > 0;

  return (
    <div className="flex flex-col gap-2">
      {/* 세그먼트 토글: active 배경을 테두리에 flush로 채워(패딩 없음) 상·하 공백 비대칭 제거. */}
      <div className="inline-flex w-fit items-stretch overflow-hidden rounded-md border border-border bg-surface text-caption font-medium">
        <button
          type="button"
          aria-pressed={mode === 'write'}
          onClick={() => setMode('write')}
          className={cn(TAB_BASE, mode === 'write' ? TAB_ACTIVE : TAB_INACTIVE)}
        >
          작성
        </button>
        <button
          type="button"
          aria-pressed={mode === 'preview'}
          onClick={() => setMode('preview')}
          className={cn(TAB_BASE, 'border-l border-border', mode === 'preview' ? TAB_ACTIVE : TAB_INACTIVE)}
        >
          미리보기
        </button>
      </div>

      <Textarea
        id={id}
        className={cn(className, mode === 'preview' && 'hidden')}
        disabled={disabled}
        placeholder={placeholder}
        {...registration}
      />
      {mode === 'preview' &&
        (hasContent ? (
          <div
            className={cn(
              'w-full overflow-auto rounded-md border border-input bg-background px-3 py-2',
              className,
            )}
          >
            <MarkdownViewer content={value} />
          </div>
        ) : (
          <div
            className={cn(
              'w-full rounded-md border border-input bg-background px-3 py-2 text-body text-fg-muted',
              className,
            )}
          >
            표시할 내용이 없습니다.
          </div>
        ))}
    </div>
  );
}
