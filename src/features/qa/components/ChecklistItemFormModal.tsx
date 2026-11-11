import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { FormField } from '@/shared/components/form/FormField';
import { QaConfirmModal } from '@/features/qa/components/QaConfirmModal';
import { UnsavedChangesModal } from '@/shared/components/modals/UnsavedChangesModal';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import { QaApiError } from '@/shared/api/qaClient';
import { useCreateChecklistItem, useUpdateChecklistItem } from '@/features/qa/mutations';
import { NOTICE_COPY } from '@/features/qa/copy';
import { CLASSIFICATION_LABELS, PART_LABELS, PART_ORDER } from '@/features/qa/labels';
import {
  checklistItemFormSchema,
  type ChecklistFeature,
  type ChecklistItem,
  type ChecklistItemFormValues,
  type Round,
} from '@/features/qa/schemas';
import type { ChecklistItemUpdateBody } from '@/features/qa/api';

function changedFields(
  item: ChecklistItem,
  values: ChecklistItemFormValues,
): Omit<ChecklistItemUpdateBody, 'version'> {
  return {
    ...(item.title !== values.title ? { title: values.title } : {}),
    ...(item.expected !== values.expected ? { expected: values.expected } : {}),
    ...([...item.parts].sort().join() !== [...values.parts].sort().join()
      ? { parts: values.parts }
      : {}),
    ...(item.classification !== values.classification
      ? { classification: values.classification }
      : {}),
  };
}
export function ChecklistItemFormModal({
  sprintId,
  feature,
  item,
  round,
  locked,
  onClose,
}: {
  sprintId: number;
  feature: ChecklistFeature;
  item?: ChecklistItem;
  round: Round;
  locked: boolean;
  onClose: () => void;
}) {
  const create = useCreateChecklistItem(sprintId);
  const update = useUpdateChecklistItem(sprintId);
  const pending = create.isPending || update.isPending;
  const disabled = locked || pending;
  const [confirmation, setConfirmation] = useState<ChecklistItemFormValues | null>(null);
  const [discard, setDiscard] = useState(false);
  const form = useForm<ChecklistItemFormValues>({
    resolver: zodResolver(checklistItemFormSchema),
    mode: 'onBlur',
    defaultValues: {
      title: item?.title ?? '',
      expected: item?.expected ?? '',
      parts: item?.parts ?? [],
      classification: item?.classification ?? (round === 1 ? 'AUTO' : 'MANUAL'),
    },
  });
  const blocker = useUnsavedChangesGuard(form.formState.isDirty && !pending);
  const requestClose = () => {
    if (pending) return;
    if (form.formState.isDirty) setDiscard(true);
    else onClose();
  };
  const onError = (error: unknown) => {
    if (error instanceof QaApiError && error.code === 'GLOBAL_4091') onClose();
  };
  const save = (values: ChecklistItemFormValues) => {
    if (disabled) return;
    if (item)
      update.mutate(
        { itemId: item.id, body: { ...changedFields(item, values), version: item.version } },
        { onSuccess: onClose, onError },
      );
    else
      create.mutate({ ...values, featureId: feature.featureId }, { onSuccess: onClose, onError });
  };
  const submit = form.handleSubmit(
    (values) => {
      if (disabled) return;
      if (item) {
        if (!Object.keys(changedFields(item, values)).length) return onClose();
        setConfirmation(values);
      } else save(values);
    },
    () => toast.error('필수 항목을 확인해주세요.'),
  );
  return (
    <>
      <Dialog open onOpenChange={(open) => !open && requestClose()}>
        <DialogContent className="max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{item ? '항목 수정' : '항목 추가'}</DialogTitle>
            <DialogDescription>
              {feature.screenId} · {feature.screenName}
            </DialogDescription>
          </DialogHeader>
          <form id="qa-item-form" className="flex flex-col gap-4" onSubmit={submit} noValidate>
            <FormField
              label="행위"
              htmlFor="qa-item-title"
              required
              error={form.formState.errors.title?.message}
            >
              <Input id="qa-item-title" disabled={disabled} {...form.register('title')} />
            </FormField>
            <FormField
              label="설명"
              htmlFor="qa-item-expected"
              required
              error={form.formState.errors.expected?.message}
            >
              <Textarea
                id="qa-item-expected"
                rows={4}
                disabled={disabled}
                {...form.register('expected')}
              />
            </FormField>
            <FormField label="관련 파트" required error={form.formState.errors.parts?.message}>
              <Controller
                name="parts"
                control={form.control}
                render={({ field }) => (
                  <div className="flex gap-4">
                    {PART_ORDER.map((part) => (
                      <label
                        key={part}
                        className="flex items-center gap-2 text-body text-foreground"
                      >
                        <Checkbox
                          disabled={disabled}
                          checked={field.value.includes(part)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked === true
                                ? [...field.value, part]
                                : field.value.filter((p) => p !== part),
                            )
                          }
                        />
                        {PART_LABELS[part]}
                      </label>
                    ))}
                  </div>
                )}
              />
            </FormField>
            <FormField label="분류" required>
              <Controller
                name="classification"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                    <SelectTrigger ref={field.ref} aria-label="분류">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['AUTO', 'MANUAL'] as const).map((value) => (
                        <SelectItem key={value} value={value}>
                          {CLASSIFICATION_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            {locked && (
              <p role="status" className="text-caption text-fg-muted">
                {NOTICE_COPY.RUNNING}
              </p>
            )}
          </form>
          <DialogFooter>
            <Button variant="outline" disabled={pending} onClick={requestClose}>
              취소
            </Button>
            <Button
              form="qa-item-form"
              type="submit"
              disabled={disabled || (item !== undefined && !form.formState.isDirty)}
              aria-busy={pending}
            >
              {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {item ? '저장' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <QaConfirmModal
        open={confirmation !== null}
        title="항목을 수정할까요?"
        description={NOTICE_COPY.RESET_RESULTS}
        confirmLabel="수정"
        pending={pending}
        disabled={locked}
        onClose={() => setConfirmation(null)}
        onConfirm={() => confirmation && !disabled && save(confirmation)}
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
