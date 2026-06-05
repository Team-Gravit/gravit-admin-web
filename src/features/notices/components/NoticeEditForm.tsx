import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { FormField } from '@/shared/components/form/FormField';
import { UnsavedChangesModal } from '@/shared/components/modals/UnsavedChangesModal';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import { noticeStatusLabels } from '@/shared/constants/labels';
import type { NoticeStatus } from '@/shared/constants/enums';
import {
  noticeEditFormSchema,
  type NoticeDetail,
  type NoticeEditFormValues,
} from '@/features/notices/schemas';
import { useUpdateNotice } from '@/features/notices/mutations';

/** 상태 전이 허용 옵션 (03 §9-4): UI 차단(옵션 제한) + 백엔드 409 검증. */
const STATUS_TRANSITIONS: Record<NoticeStatus, NoticeStatus[]> = {
  DRAFT: ['DRAFT', 'PUBLISHED'],
  PUBLISHED: ['PUBLISHED', 'ARCHIVED'],
  ARCHIVED: ['ARCHIVED'],
};

interface NoticeEditFormProps {
  notice: NoticeDetail;
  onCancel: () => void;
  onSaved: () => void;
}

/** NOTICE_DETAIL 편집 모드 (DS-02 §5-2). 작성 폼 + 상태 Select(전이 제한) + 저장. 이탈 보호. */
export function NoticeEditForm({ notice, onCancel, onSaved }: NoticeEditFormProps) {
  const updateNotice = useUpdateNotice(notice.noticeId);
  const form = useForm<NoticeEditFormValues>({
    resolver: zodResolver(noticeEditFormSchema),
    mode: 'onBlur',
    defaultValues: {
      title: notice.title,
      summary: notice.summary,
      content: notice.content,
      pinned: notice.pinned,
      status: notice.status,
    },
  });
  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = form;

  const blocker = useUnsavedChangesGuard(isDirty && !isSubmitSuccessful);
  const allowedStatuses = STATUS_TRANSITIONS[notice.status];

  const onSubmit = form.handleSubmit(
    (values) => {
      updateNotice.mutate(values, {
        onSuccess: () => {
          toast.success('저장되었습니다.');
          onSaved();
        },
      });
    },
    () => toast.error('필수 항목을 확인해주세요.'),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-foreground">공지 편집</h1>

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
          <Textarea id="content" className="min-h-60" {...register('content')} />
        </FormField>
        <FormField label="상태" required error={errors.status?.message}>
          <Select
            value={watch('status')}
            onValueChange={(value) => setValue('status', value as NoticeStatus, { shouldDirty: true })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {noticeStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <Button variant="outline" onClick={onCancel} disabled={updateNotice.isPending}>
          취소
        </Button>
        <Button onClick={onSubmit} disabled={updateNotice.isPending}>
          저장
        </Button>
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesModal open onConfirm={() => blocker.proceed()} onCancel={() => blocker.reset()} />
      )}
    </div>
  );
}
