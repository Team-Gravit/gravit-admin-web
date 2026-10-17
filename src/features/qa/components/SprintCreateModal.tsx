import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { FormField } from '@/shared/components/form/FormField';
import { showErrorToast } from '@/shared/api/errorHandler';
import { QA_ERROR_MESSAGES, QaApiError } from '@/shared/api/qaClient';
import { useCreateSprint } from '@/features/qa/mutations';
import { ERROR_COPY, NOTICE_COPY } from '@/features/qa/copy';
import {
  sprintCreateFormSchema,
  type Sprint,
  type SprintCreateFormValues,
} from '@/features/qa/schemas';

interface SprintCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (sprint: Sprint) => void;
}

/**
 * 스프린트 등록 모달 (QA_SPEC B-0, A-3 #2).
 * 404·409·400 은 모달을 유지한 채 입력 아래에 표시하고, 그 밖의 실패는 토스트로 알린다.
 */
export function SprintCreateModal({ open, onOpenChange, onCreated }: SprintCreateModalProps) {
  const createSprint = useCreateSprint();
  const form = useForm<SprintCreateFormValues>({
    resolver: zodResolver(sprintCreateFormSchema),
    mode: 'onBlur',
    defaultValues: { notionPageUrl: '' },
  });
  const { reset } = form;

  useEffect(() => {
    if (open) reset({ notionPageUrl: '' });
  }, [open, reset]);

  const showFieldError = (message: string) =>
    form.setError('notionPageUrl', { type: 'server', message }, { shouldFocus: true });

  const onSubmit = form.handleSubmit(
    (values) => {
      createSprint.mutate(values.notionPageUrl, {
        onSuccess: (sprint) => {
          onOpenChange(false);
          onCreated(sprint);
        },
        onError: (error) => {
          if (error instanceof QaApiError) {
            // 재발급 실패 = 강제 로그아웃이 이미 안내했다(D9-3).
            if (error.sessionEnded) return;
            if (error.status === 404) return showFieldError(ERROR_COPY.NOTION_NOT_FOUND);
            if (error.status === 409) return showFieldError(ERROR_COPY.SPRINT_DUPLICATED);
            if (error.status === 400)
              return showFieldError(error.serverMessage ?? QA_ERROR_MESSAGES.DEFAULT);
          }
          showErrorToast(error);
        },
      });
    },
    () => toast.error('필수 항목을 확인해주세요.'),
  );

  const isPending = createSprint.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>스프린트 등록</DialogTitle>
          <DialogDescription>{NOTICE_COPY.REGISTER_HINT}</DialogDescription>
        </DialogHeader>

        <form id="qa-sprint-create" onSubmit={onSubmit} noValidate>
          <FormField
            label="Notion 스프린트 페이지 URL"
            htmlFor="qa-notion-page-url"
            required
            error={form.formState.errors.notionPageUrl?.message}
          >
            <Input
              id="qa-notion-page-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://www.notion.so/..."
              disabled={isPending}
              aria-invalid={Boolean(form.formState.errors.notionPageUrl)}
              {...form.register('notionPageUrl')}
            />
          </FormField>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            취소
          </Button>
          <Button type="submit" form="qa-sprint-create" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            등록
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
