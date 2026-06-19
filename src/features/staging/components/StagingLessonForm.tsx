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
  hidden?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  readOnly?: boolean;
}

export function StagingLessonForm({
  lesson,
  label,
  hidden,
  onDirtyChange,
  readOnly,
}: StagingLessonFormProps) {
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
          reset(values);
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
          className={cn(
            dirtyFields.title && 'border-l-4 border-l-primary',
            readOnly && 'bg-hover text-fg-secondary',
          )}
          disabled={readOnly || updateLesson.isPending}
          {...register('title')}
        />
      </FormField>

      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={!isDirty || updateLesson.isPending}>
            {updateLesson.isPending && <Loader2 className="animate-spin" />}
            저장
          </Button>
        </div>
      )}
    </div>
  );
}
