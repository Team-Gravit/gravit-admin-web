import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { Textarea } from '@/shared/components/ui/textarea';
import { MarkdownViewer } from '@/shared/components/markdown/MarkdownViewer';

interface MarkdownEditorProps {
  registration: UseFormRegisterReturn;
  value: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const TAB_BASE = 'inline-flex h-8 w-20 items-center justify-center transition-colors';
const TAB_ACTIVE = 'bg-primary-subtle text-primary';
const TAB_INACTIVE = 'text-fg-secondary hover:text-foreground';

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
