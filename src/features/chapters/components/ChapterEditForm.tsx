import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { FormField } from '@/shared/components/form/FormField';
import { UnsavedChangesModal } from '@/shared/components/modals/UnsavedChangesModal';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import {
  chapterEditFormSchema,
  type ChapterDetail,
  type ChapterEditFormValues,
} from '@/features/chapters/schemas';
import { useUpdateChapter } from '@/features/chapters/mutations';

interface ChapterEditFormProps {
  chapter: ChapterDetail;
  onCancel: () => void;
  onSaved: () => void;
}

/**
 * CHAPTER_DETAIL 편집 모드 (01 §6-5-2, DS-02 §11, 03 §7-4).
 * B 패턴: 정보 카드만 편집 폼으로 전환(풀이현황·유닛 목록은 유지). 제목 필수·설명 선택 + 이탈 보호.
 */
export function ChapterEditForm({ chapter, onCancel, onSaved }: ChapterEditFormProps) {
  const updateChapter = useUpdateChapter(chapter.chapterId);
  const form = useForm<ChapterEditFormValues>({
    resolver: zodResolver(chapterEditFormSchema),
    mode: 'onBlur',
    defaultValues: { title: chapter.title, description: chapter.description },
  });
  const {
    register,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = form;

  const blocker = useUnsavedChangesGuard(isDirty && !isSubmitSuccessful);

  const onSubmit = form.handleSubmit(
    (values) => {
      updateChapter.mutate(values, {
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
      <FormField label="설명" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" className="min-h-24" {...register('description')} />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={updateChapter.isPending}>
          취소
        </Button>
        <Button onClick={onSubmit} disabled={updateChapter.isPending}>
          저장
        </Button>
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesModal open onConfirm={() => blocker.proceed()} onCancel={() => blocker.reset()} />
      )}
    </div>
  );
}
