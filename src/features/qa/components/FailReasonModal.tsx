import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { FormField } from '@/shared/components/form/FormField';
import { FieldError } from '@/shared/components/form/FieldError';
import { FIELD_LIMITS } from '@/shared/constants/fieldLimits';
import { failReasonFormSchema, type FailReasonFormValues } from '@/features/qa/schemas';
import { NOTICE_COPY } from '@/features/qa/copy';

export function FailReasonModal({
  initialReason,
  editingReason,
  pending,
  locked,
  error,
  onClose,
  onConfirm,
  restoreFocus,
}: {
  initialReason: string;
  editingReason: boolean;
  pending: boolean;
  locked: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  restoreFocus: () => void;
}) {
  const id = useId();
  const form = useForm<FailReasonFormValues>({
    resolver: zodResolver(failReasonFormSchema),
    defaultValues: { reason: initialReason },
    mode: 'onBlur',
  });
  const reason = form.watch('reason');
  const reasonError = form.formState.errors.reason?.message;
  const blocked = pending || locked;
  const blockedMessage = pending ? NOTICE_COPY.FAIL_REASON_PENDING : NOTICE_COPY.FAIL_REASON_LOCKED;
  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          restoreFocus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{NOTICE_COPY.FAIL_REASON_TITLE}</DialogTitle>
          <DialogDescription>
            {editingReason ? NOTICE_COPY.FAIL_REASON_EDIT_HINT : NOTICE_COPY.FAIL_REASON_HINT}
          </DialogDescription>
        </DialogHeader>
        <form
          id={id}
          noValidate
          onSubmit={form.handleSubmit(({ reason: value }) => {
            if (!blocked) onConfirm(value);
          })}
        >
          <FormField label={NOTICE_COPY.FAIL_REASON_LABEL} htmlFor={`${id}-reason`}>
            <Textarea
              id={`${id}-reason`}
              rows={5}
              disabled={blocked}
              aria-invalid={!!reasonError}
              aria-describedby={`${id}-count${reasonError ? ` ${id}-error` : ''}`}
              className={
                reasonError ? 'border-danger-text focus-visible:ring-danger-text' : undefined
              }
              {...form.register('reason')}
            />
            <p id={`${id}-count`} className="text-right text-caption text-fg-muted">
              {reason.trim().length}/{FIELD_LIMITS.qa.reason}
            </p>
            {reasonError && (
              <div id={`${id}-error`} role="alert">
                <FieldError message={reasonError} />
              </div>
            )}
          </FormField>
        </form>
        {error && (
          <p role="alert" className="text-body text-danger-text">
            {error}
          </p>
        )}
        <DialogFooter>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                aria-disabled={pending}
                className="aria-disabled:opacity-50"
                onClick={() => !pending && onClose()}
              >
                취소
              </Button>
            </TooltipTrigger>
            {pending && <TooltipContent>{NOTICE_COPY.FAIL_REASON_PENDING}</TooltipContent>}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                form={id}
                type="submit"
                aria-disabled={blocked}
                aria-busy={pending}
                className="aria-disabled:opacity-50"
              >
                {NOTICE_COPY.FAIL_REASON_CONFIRM}
              </Button>
            </TooltipTrigger>
            {blocked && <TooltipContent>{blockedMessage}</TooltipContent>}
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
