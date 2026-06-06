import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/shared/components/form/FormField';
import {
  stagingLessonFormSchema,
  type StagingLesson,
  type StagingLessonFormValues,
} from '@/features/staging/schemas';
import { useUpdateStagingLesson } from '@/features/staging/mutations';

interface StagingLessonFormProps {
  lesson: StagingLesson;
  label: string;
  /** 비활성 항목은 unmount 대신 hidden — 미저장 입력 보존(04 §10-2-3). */
  hidden?: boolean;
  /** dirty 변화를 좌측 리스트(●)로 lift-up (04 §10-2-4). */
  onDirtyChange?: (dirty: boolean) => void;
}

/**
 * 스테이징 레슨 폼 (DS-02 §16-4-1, 03 §8-3). 제목 단일 input + [저장](변경 없을 때 비활성).
 * 저장 = PATCH /staging/lessons/{id} 단일 호출. 변경 표시(●/4px)는 6-5, COMPLETED disable 은 6-8.
 */
export function StagingLessonForm({ lesson, label, hidden, onDirtyChange }: StagingLessonFormProps) {
  const updateLesson = useUpdateStagingLesson(lesson.lessonId, label);
  const form = useForm<StagingLessonFormValues>({
    resolver: zodResolver(stagingLessonFormSchema),
    mode: 'onBlur',
    defaultValues: { title: lesson.title },
  });
  const {
    register,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = form;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const onSubmit = form.handleSubmit(
    (values) => {
      updateLesson.mutate(values, {
        onSuccess: () => {
          toast.success('저장되었습니다.');
          reset(values); // baseline 갱신 → isDirty 리셋 → [저장] 비활성
        },
      });
    },
    () => toast.error('필수 항목을 확인해주세요.'),
  );

  return (
    <div className={cn('flex flex-col gap-5', hidden && 'hidden')}>
      <div className="flex flex-col gap-1">
        <h3 className="text-h3 text-foreground">레슨</h3>
        <p className="text-caption text-fg-muted">ID: {lesson.lessonId}</p>
      </div>

      <FormField label="제목" htmlFor="lesson-title" required error={errors.title?.message}>
        <Input
          id="lesson-title"
          className={cn(dirtyFields.title && 'border-l-4 border-l-primary')}
          disabled={updateLesson.isPending}
          {...register('title')}
        />
      </FormField>

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={!isDirty || updateLesson.isPending}>
          {updateLesson.isPending && <Loader2 className="animate-spin" />}
          저장
        </Button>
      </div>
    </div>
  );
}
