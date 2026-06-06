import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { FormField } from '@/shared/components/form/FormField';
import { FieldError } from '@/shared/components/form/FieldError';
import { UnsavedChangesModal } from '@/shared/components/modals/UnsavedChangesModal';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import {
  objectiveEditFormSchema,
  type ObjectiveProblem,
  type ObjectiveEditFormValues,
} from '@/features/problems/schemas';
import { useUpdateObjectiveProblem } from '@/features/problems/mutations';

const OPTION_MARKERS = ['①', '②', '③', '④'];

interface ObjectiveProblemEditFormProps {
  problem: ObjectiveProblem;
  onCancel: () => void;
  onSaved: () => void;
}

/**
 * 객관식 편집 모드 (01 §6-5-5, DS-02 §14-2, 03 §7-13).
 * 지시문/본문 + 보기 4개 고정(radio 정답 단일 선택 + content/해설). 제출 시 options 전체 교체(isAnswer 1개). 이탈 보호.
 */
export function ObjectiveProblemEditForm({
  problem,
  onCancel,
  onSaved,
}: ObjectiveProblemEditFormProps) {
  const updateObjective = useUpdateObjectiveProblem(problem.problemId);
  const form = useForm<ObjectiveEditFormValues>({
    resolver: zodResolver(objectiveEditFormSchema),
    mode: 'onBlur',
    defaultValues: {
      instruction: problem.instruction,
      content: problem.content,
      answerOptionId:
        problem.options.find((option) => option.isAnswer)?.optionId ??
        problem.options[0]?.optionId ??
        0,
      options: problem.options.map((option) => ({
        optionId: option.optionId,
        content: option.content,
        explanation: option.explanation,
      })),
    },
  });
  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = form;
  const { fields } = useFieldArray({ control: form.control, name: 'options' });
  const answerOptionId = watch('answerOptionId');

  const blocker = useUnsavedChangesGuard(isDirty && !isSubmitSuccessful);

  const onSubmit = form.handleSubmit(
    (values) => {
      // 정답 변경 시 이전+새 정답 옵션 모두 반영 — options 전체 교체로 자연 처리(03 §7-13).
      const options = values.options.map((option) => ({
        ...option,
        isAnswer: option.optionId === values.answerOptionId,
      }));
      updateObjective.mutate(
        { instruction: values.instruction, content: values.content, options },
        {
          onSuccess: () => {
            toast.success('저장되었습니다.');
            onSaved();
          },
        },
      );
    },
    () => toast.error('필수 항목을 확인해주세요.'),
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-h3 text-foreground">문제</h3>
        <FormField label="지시문" htmlFor="instruction" required error={errors.instruction?.message}>
          <Input id="instruction" {...register('instruction')} />
        </FormField>
        <FormField label="본문" htmlFor="content" error={errors.content?.message}>
          <Textarea id="content" className="min-h-24" {...register('content')} />
        </FormField>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-h3 text-foreground">보기 (4개 고정)</h3>
        <RadioGroup
          value={String(answerOptionId)}
          onValueChange={(value) =>
            setValue('answerOptionId', Number(value), { shouldDirty: true })
          }
          className="gap-4"
        >
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-2 rounded-md border border-border p-4">
              <div className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-body text-foreground">
                  {OPTION_MARKERS[index]}
                </span>
                <label className="flex shrink-0 items-center gap-2 text-caption text-fg-secondary">
                  <RadioGroupItem value={String(field.optionId)} />
                  정답
                </label>
                <Input className="flex-1" {...register(`options.${index}.content`)} />
              </div>
              <FieldError message={errors.options?.[index]?.content?.message} />
              <div className="flex items-center gap-2 pl-8">
                <span className="shrink-0 text-caption text-fg-muted">해설</span>
                <Input className="flex-1" {...register(`options.${index}.explanation`)} />
              </div>
              <FieldError message={errors.options?.[index]?.explanation?.message} />
            </div>
          ))}
        </RadioGroup>
      </section>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={updateObjective.isPending}>
          취소
        </Button>
        <Button onClick={onSubmit} disabled={updateObjective.isPending}>
          저장
        </Button>
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesModal open onConfirm={() => blocker.proceed()} onCancel={() => blocker.reset()} />
      )}
    </div>
  );
}
