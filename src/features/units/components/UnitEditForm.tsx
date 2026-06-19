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
  unitEditFormSchema,
  type UnitDetail,
  type UnitEditFormValues,
} from '@/features/units/schemas';
import { useUpdateUnit } from '@/features/units/mutations';

interface UnitEditFormProps {
  unit: UnitDetail;
  onCancel: () => void;
  onSaved: () => void;
}

export function UnitEditForm({ unit, onCancel, onSaved }: UnitEditFormProps) {
  const updateUnit = useUpdateUnit(unit.unitId);
  const form = useForm<UnitEditFormValues>({
    resolver: zodResolver(unitEditFormSchema),
    mode: 'onBlur',
    defaultValues: { title: unit.title, description: unit.description },
  });
  const {
    register,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = form;

  const blocker = useUnsavedChangesGuard(isDirty && !isSubmitSuccessful);

  const onSubmit = form.handleSubmit(
    (values) => {
      updateUnit.mutate(values, {
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
        <Button variant="outline" onClick={onCancel} disabled={updateUnit.isPending}>
          취소
        </Button>
        <Button onClick={onSubmit} disabled={updateUnit.isPending}>
          저장
        </Button>
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesModal open onConfirm={() => blocker.proceed()} onCancel={() => blocker.reset()} />
      )}
    </div>
  );
}
