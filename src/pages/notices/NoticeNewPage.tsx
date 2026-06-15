import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { MarkdownEditor } from '@/shared/components/markdown/MarkdownEditor';
import { FormField } from '@/shared/components/form/FormField';
import { UnsavedChangesModal } from '@/shared/components/modals/UnsavedChangesModal';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import { useSetBreadcrumb } from '@/shared/hooks/useBreadcrumb';
import { noticeFormSchema, type NoticeFormValues } from '@/features/notices/schemas';
import { useCreateNotice } from '@/features/notices/mutations';

/**
 * NOTICE_NEW (DS-02 §4, 03 §9-3, 04 §9-2). Form Page: 제목/요약/본문/상단고정 + 취소·임시저장·게시.
 * RHF + zodResolver(onBlur, 제출 시 전체검증). 임시저장=DRAFT·게시=PUBLISHED. 입력 시 이탈 보호.
 */
export function NoticeNewPage() {
  const navigate = useNavigate();
  const createNotice = useCreateNotice();
  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    mode: 'onBlur',
    defaultValues: { title: '', summary: '', content: '', pinned: false },
  });
  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = form;

  const blocker = useUnsavedChangesGuard(isDirty && !isSubmitSuccessful);

  // breadcrumb (04 §8-3-1): 공지 관리 > 공지 작성.
  useSetBreadcrumb([{ label: '공지 관리', href: ROUTES.NOTICES }, { label: '공지 작성' }]);

  const submit = (status: 'DRAFT' | 'PUBLISHED') =>
    form.handleSubmit(
      (values) => {
        createNotice.mutate(
          { ...values, status },
          {
            onSuccess: () => {
              toast.success(
                status === 'PUBLISHED' ? '공지가 게시되었습니다.' : '임시 저장되었습니다.',
              );
              navigate(ROUTES.NOTICES);
            },
          },
        );
      },
      () => toast.error('필수 항목을 확인해주세요.'),
    );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-foreground">공지 작성</h1>

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
        <FormField label="제목" htmlFor="title" required error={errors.title?.message}>
          <Input id="title" {...register('title')} />
        </FormField>
        <FormField label="요약" htmlFor="summary" required error={errors.summary?.message}>
          <Input id="summary" {...register('summary')} />
        </FormField>
        <FormField
          label="본문 (마크다운 지원)"
          htmlFor="content"
          required
          error={errors.content?.message}
        >
          <MarkdownEditor
            id="content"
            className="min-h-60"
            registration={register('content')}
            value={watch('content')}
          />
        </FormField>
        <label className="flex w-fit items-center gap-2 text-body text-foreground">
          <Checkbox
            checked={watch('pinned')}
            onCheckedChange={(checked) => setValue('pinned', checked === true, { shouldDirty: true })}
          />
          상단 고정
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.NOTICES)}
          disabled={createNotice.isPending}
        >
          취소
        </Button>
        <Button variant="outline" onClick={submit('DRAFT')} disabled={createNotice.isPending}>
          임시저장
        </Button>
        <Button onClick={submit('PUBLISHED')} disabled={createNotice.isPending}>
          게시
        </Button>
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesModal open onConfirm={() => blocker.proceed()} onCancel={() => blocker.reset()} />
      )}
    </div>
  );
}
