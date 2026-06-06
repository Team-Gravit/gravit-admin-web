import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { FormField } from '@/shared/components/form/FormField';
import { FieldError } from '@/shared/components/form/FieldError';
import { ProblemTypeBadge } from '@/shared/components/status-badge/ProblemTypeBadge';
import { updateStagingOption, updateStagingProblem } from '@/features/staging/api';
import { stagingKeys } from '@/features/staging/queries';
import {
  stagingObjectiveFormSchema,
  type StagingObjectiveProblem,
  type StagingObjectiveFormValues,
} from '@/features/staging/schemas';

const OPTION_MARKERS = ['①', '②', '③', '④'];

interface StagingObjectiveFormProps {
  problem: StagingObjectiveProblem;
  problemNumber: number;
  label: string;
  /** 비활성 항목은 unmount 대신 hidden — 미저장 입력 보존(04 §10-2-3). */
  hidden?: boolean;
}

/**
 * 스테이징 객관식 폼 (DS-02 §16-4-2, 03 §8-4/§8-5, 04 §10-2-5).
 * 지시문/본문 + 보기 4 고정(radio 정답 단일 + content/해설). [저장] 변경 없을 때 비활성.
 * 저장 = 변경 필드만 다중 PATCH(Promise.allSettled): 문제(§8-4) + 변경 옵션(§8-5) + 정답 변경 시 이전·새 옵션 isAnswer.
 * 부분실패 세분 baseline·spinner·입력 비활성 정교화는 6-6, 변경 표시(●/4px)는 6-5.
 */
export function StagingObjectiveForm({
  problem,
  problemNumber,
  label,
  hidden,
}: StagingObjectiveFormProps) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const originalAnswerOptionId = problem.options.find((option) => option.isAnswer)?.optionId ?? 0;

  const form = useForm<StagingObjectiveFormValues>({
    resolver: zodResolver(stagingObjectiveFormSchema),
    mode: 'onBlur',
    defaultValues: {
      instruction: problem.instruction,
      content: problem.content,
      answerOptionId: originalAnswerOptionId || (problem.options[0]?.optionId ?? 0),
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
    formState: { errors, isDirty, dirtyFields },
  } = form;
  const { fields } = useFieldArray({ control: form.control, name: 'options' });
  const answerOptionId = watch('answerOptionId');

  const onSubmit = form.handleSubmit(
    async (values) => {
      // 변경된 필드만 골라 PATCH 작업 구성 (04 §10-2-5, good-patterns).
      const tasks: Array<() => Promise<void>> = [];
      if (dirtyFields.instruction || dirtyFields.content) {
        tasks.push(() =>
          updateStagingProblem(problem.problemId, {
            instruction: values.instruction,
            content: values.content,
          }),
        );
      }
      values.options.forEach((option, index) => {
        if (dirtyFields.options?.[index]?.content || dirtyFields.options?.[index]?.explanation) {
          tasks.push(() =>
            updateStagingOption(option.optionId, {
              content: option.content,
              explanation: option.explanation,
            }),
          );
        }
      });
      // 정답 변경 시 이전 정답 옵션 + 새 정답 옵션 모두 PATCH (D4, 03 §8-5).
      if (dirtyFields.answerOptionId && values.answerOptionId !== originalAnswerOptionId) {
        tasks.push(() => updateStagingOption(originalAnswerOptionId, { isAnswer: false }));
        tasks.push(() => updateStagingOption(values.answerOptionId, { isAnswer: true }));
      }
      if (tasks.length === 0) return;

      setIsSaving(true);
      const results = await Promise.allSettled(tasks.map((task) => task()));
      setIsSaving(false);
      const failed = results.filter((result) => result.status === 'rejected').length;
      void queryClient.invalidateQueries({ queryKey: stagingKeys.detail(label) });

      if (failed === 0) {
        toast.success('저장되었습니다.');
        form.reset(values); // baseline 갱신 → [저장] 비활성
      } else if (failed < results.length) {
        toast.error(`일부 항목만 저장되었습니다. (${results.length - failed}/${results.length} 성공)`);
      } else {
        toast.error('저장에 실패했습니다.');
      }
    },
    () => toast.error('필수 항목을 확인해주세요.'),
  );

  return (
    <div className={cn('flex flex-col gap-5', hidden && 'hidden')}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-h3 text-foreground">문제 {problemNumber}</h3>
          <ProblemTypeBadge problemType={problem.problemType} />
        </div>
        <p className="text-caption text-fg-muted">ID: {problem.problemId}</p>
      </div>

      <FormField label="지시문" htmlFor={`obj-instruction-${problem.problemId}`} required error={errors.instruction?.message}>
        <Input id={`obj-instruction-${problem.problemId}`} {...register('instruction')} />
      </FormField>
      <FormField label="본문" htmlFor={`obj-content-${problem.problemId}`} required error={errors.content?.message}>
        <Textarea id={`obj-content-${problem.problemId}`} className="min-h-24" {...register('content')} />
      </FormField>

      <div className="flex flex-col gap-3">
        <h4 className="text-body font-medium text-foreground">보기 (4개 고정)</h4>
        <RadioGroup
          value={String(answerOptionId)}
          onValueChange={(value) => setValue('answerOptionId', Number(value), { shouldDirty: true })}
          className="gap-4"
        >
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-2 rounded-md border border-border p-4">
              <div className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-body text-foreground">{OPTION_MARKERS[index]}</span>
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
      </div>

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={!isDirty || isSaving}>
          저장
        </Button>
      </div>
    </div>
  );
}
