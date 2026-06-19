import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { FormField } from '@/shared/components/form/FormField';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { UnsavedChangesModal } from '@/shared/components/modals/UnsavedChangesModal';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import { formatDateTime } from '@/shared/lib/formatDate';
import {
  useCreateInquiryAnswer,
  useDeleteInquiryAnswer,
  useUpdateInquiryAnswer,
} from '@/features/inquiries/mutations';
import {
  inquiryAnswerFormSchema,
  type InquiryAnswer,
  type InquiryAnswerFormValues,
} from '@/features/inquiries/schemas';

interface InquiryAnswerSectionProps {
  inquiryId: number;
  answer: InquiryAnswer | null;
}

export function InquiryAnswerSection({ inquiryId, answer }: InquiryAnswerSectionProps) {
  const hasAnswer = answer !== null;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const createAnswer = useCreateInquiryAnswer(inquiryId);
  const updateAnswer = useUpdateInquiryAnswer(inquiryId);
  const deleteAnswer = useDeleteInquiryAnswer(inquiryId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<InquiryAnswerFormValues>({
    resolver: zodResolver(inquiryAnswerFormSchema),
    defaultValues: { content: answer?.content ?? '' },
  });

  const isSaving = createAnswer.isPending || updateAnswer.isPending;
  const isBusy = isSaving || deleteAnswer.isPending;

  const answerContent = answer?.content ?? '';
  useEffect(() => {
    if (!isDirty) reset({ content: answerContent });
  }, [answerContent, isDirty, reset]);

  const blocker = useUnsavedChangesGuard(isDirty && !isBusy);

  const onSubmit = handleSubmit((values) => {
    if (hasAnswer) {
      updateAnswer.mutate(values.content, {
        onSuccess: (detail) => {
          toast.success('답변이 수정되었습니다.');
          reset({ content: detail.answer?.content ?? '' });
        },
      });
    } else {
      createAnswer.mutate(values.content, {
        onSuccess: (detail) => {
          toast.success('답변이 등록되었습니다.');
          reset({ content: detail.answer?.content ?? '' });
        },
      });
    }
  });

  const onDelete = () => {
    deleteAnswer.mutate(undefined, {
      onSuccess: () => {
        toast.success('답변이 삭제되었습니다.');
        setDeleteOpen(false);
        reset({ content: '' });
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-h3 text-foreground">답변</h3>
        {answer && (
          <span className="text-caption text-fg-muted">
            작성 {formatDateTime(answer.answeredAt)}
            {answer.updatedAt !== answer.answeredAt &&
              ` · 수정 ${formatDateTime(answer.updatedAt)}`}
          </span>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField error={errors.content?.message}>
          <Textarea
            rows={6}
            placeholder="답변 내용을 입력하세요."
            disabled={isBusy}
            {...register('content')}
          />
        </FormField>

        <div className="flex justify-end gap-2">
          {hasAnswer && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={isBusy}
              onClick={() => setDeleteOpen(true)}
            >
              삭제
            </Button>
          )}
          <Button type="submit" disabled={isBusy || !isDirty}>
            {hasAnswer ? '수정' : '등록'}
          </Button>
        </div>
      </form>

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="답변을 삭제하시겠습니까?"
        description="답변을 삭제하면 문의 상태가 '대기'로 돌아갑니다."
        confirmLabel="삭제"
        variant="destructive"
        loading={deleteAnswer.isPending}
        onConfirm={onDelete}
      />

      {blocker.state === 'blocked' && (
        <UnsavedChangesModal
          open
          message="저장하지 않은 답변이 있습니다. 페이지를 나가시겠습니까?"
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}
    </div>
  );
}
