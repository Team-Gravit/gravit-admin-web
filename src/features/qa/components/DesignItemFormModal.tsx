import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { FormField } from '@/shared/components/form/FormField';
import { UnsavedChangesModal } from '@/shared/components/modals/UnsavedChangesModal';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import { QaApiError } from '@/shared/api/qaClient';
import { QaConfirmModal } from '@/features/qa/components/QaConfirmModal';
import { useEditDesignItem } from '@/features/qa/mutations';
import { NOTICE_COPY } from '@/features/qa/copy';
import {
  designItemFormSchema,
  type DesignItem,
  type DesignItemFormValues,
} from '@/features/qa/schemas';

export function DesignItemFormModal({
  sprintId,
  item,
  locked,
  onClose,
}: {
  sprintId: number;
  item: DesignItem;
  locked: boolean;
  onClose: () => void;
}) {
  const update = useEditDesignItem(sprintId);
  const [confirm, setConfirm] = useState<DesignItemFormValues | null>(null);
  const [discard, setDiscard] = useState(false);
  const form = useForm<DesignItemFormValues>({
    resolver: zodResolver(designItemFormSchema),
    defaultValues: { title: item.title, expected: item.expected },
  });
  const blocker = useUnsavedChangesGuard(form.formState.isDirty && !update.isPending);
  const requestClose = () => {
    if (update.isPending) return;
    if (form.formState.isDirty) setDiscard(true);
    else onClose();
  };
  const disabled = locked || update.isPending;
  const save = () => {
    if (!confirm || disabled) return;
    update.mutate(
      {
        itemId: item.id,
        body: {
          ...(item.title !== confirm.title ? { title: confirm.title } : {}),
          ...(item.expected !== confirm.expected ? { expected: confirm.expected } : {}),
          version: item.version,
        },
      },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (error instanceof QaApiError && error.code === 'GLOBAL_4091') onClose();
        },
      },
    );
  };
  return (
    <>
      <Dialog open onOpenChange={(open) => !open && requestClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>디자인 항목 수정</DialogTitle>
            <DialogDescription>
              {item.platform} · {item.title}
            </DialogDescription>
          </DialogHeader>
          <form
            id="qa-design-item-form"
            className="flex flex-col gap-4"
            noValidate
            onSubmit={form.handleSubmit((values) => {
              if (disabled) return;
              if (values.title === item.title && values.expected === item.expected) onClose();
              else setConfirm(values);
            })}
          >
            <FormField
              label="행위"
              htmlFor="qa-design-title"
              required
              error={form.formState.errors.title?.message}
            >
              <Input id="qa-design-title" disabled={disabled} {...form.register('title')} />
            </FormField>
            <FormField
              label="설명"
              htmlFor="qa-design-expected"
              required
              error={form.formState.errors.expected?.message}
            >
              <Textarea
                id="qa-design-expected"
                rows={5}
                disabled={disabled}
                {...form.register('expected')}
              />
            </FormField>
          </form>
          <DialogFooter>
            <Button variant="outline" disabled={update.isPending} onClick={requestClose}>
              닫기
            </Button>
            <Button
              type="submit"
              form="qa-design-item-form"
              disabled={disabled || !form.formState.isDirty}
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <QaConfirmModal
        open={confirm !== null}
        title="디자인 항목을 수정할까요?"
        description={NOTICE_COPY.RESET_RESULTS}
        confirmLabel="수정"
        pending={update.isPending}
        disabled={locked}
        error={update.isError ? update.error.message : undefined}
        onClose={() => setConfirm(null)}
        onConfirm={save}
      />
      <UnsavedChangesModal
        open={discard || blocker.state === 'blocked'}
        onCancel={() => {
          setDiscard(false);
          if (blocker.state === 'blocked') blocker.reset();
        }}
        onConfirm={() => {
          if (blocker.state === 'blocked') blocker.proceed();
          else onClose();
        }}
      />
    </>
  );
}
