import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/shared/components/form/FormField';
import { UnsavedChangesModal } from '@/shared/components/modals/UnsavedChangesModal';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import {
  lessonEditFormSchema,
  type LessonDetail,
  type LessonEditFormValues,
} from '@/features/lessons/schemas';
import { useUpdateLesson } from '@/features/lessons/mutations';

interface LessonEditFormProps {
  lesson: LessonDetail;
  onCancel: () => void;
  onSaved: () => void;
}

/**
 * LESSON_DETAIL 편집 모드 (01 §6-5-4, DS-02 §13, 03 §7-10).
 * B 패턴: 정보 카드만 편집 폼으로 전환(문제 목록은 유지). 제목만 수정(레슨은 description 없음) + 이탈 보호.
 */
export function LessonEditForm({ lesson, onCancel, onSaved }: LessonEditFormProps) {
  const updateLesson = useUpdateLesson(lesson.lessonId);
  const form = useForm<LessonEditFormValues>({
    resolver: zodResolver(lessonEditFormSchema),
    mode: 'onBlur',
    defaultValues: { title: lesson.title },
  });
  const {
    register,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = form;

  const blocker = useUnsavedChangesGuard(isDirty && !isSubmitSuccessful);

  const onSubmit = form.handleSubmit(
    (values) => {
      updateLesson.mutate(values, {
        onSuccess: () => {
          toast.success('저장되었습니다.');
          onSaved();
        },
      });
    },
    () => toast.error('필수 항목을 확인해주세요.'),
  );

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
      <FormField label="제목" htmlFor="title" required error={errors.title?.message}>
        <Input id="title" {...register('title')} />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={updateLesson.isPending}>
          취소
        </Button>
        <Button onClick={onSubmit} disabled={updateLesson.isPending}>
          저장
        </Button>
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesModal open onConfirm={() => blocker.proceed()} onCancel={() => blocker.reset()} />
      )}
    </div>
  );
}
