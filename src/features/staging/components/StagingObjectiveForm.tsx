import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
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
  /** dirty 변화를 좌측 리스트(●)로 lift-up (04 §10-2-4). */
  onDirtyChange?: (dirty: boolean) => void;
  /** COMPLETED read-only(04 §10-2-9): 입력/radio disabled + 저장 숨김(정답 표시 유지). */
  readOnly?: boolean;
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
  onDirtyChange,
  readOnly,
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

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // 변경된 input 좌측 4px Primary 보더 (DS-02 §16-5, 04 §10-2-4).
  const dirtyBorder = (dirty: boolean | undefined) =>
    dirty ? 'border-l-4 border-l-primary' : undefined;
  // COMPLETED read-only 입력 스타일 (DS-02 §16-6: bg-hover + text-secondary).
  const roClass = readOnly ? 'bg-hover text-fg-secondary' : undefined;

  const onSubmit = form.handleSubmit(
    async (values) => {
      // 변경된 필드만 PATCH. 각 작업은 성공 시 baseline 갱신(commit)을 함께 보유(부분실패 시 성공 필드만 반영, 04 §10-2-5).
      const tasks: Array<{ run: () => Promise<unknown>; commit: () => void }> = [];

      const problemBody: { instruction?: string; content?: string } = {};
      if (dirtyFields.instruction) problemBody.instruction = values.instruction;
      if (dirtyFields.content) problemBody.content = values.content;
      if (Object.keys(problemBody).length > 0) {
        tasks.push({
          run: () => updateStagingProblem(problem.problemId, problemBody),
          commit: () => {
            if (problemBody.instruction !== undefined)
              form.resetField('instruction', { defaultValue: values.instruction });
            if (problemBody.content !== undefined)
              form.resetField('content', { defaultValue: values.content });
          },
        });
      }
      values.options.forEach((option, index) => {
        const optionBody: { content?: string; explanation?: string } = {};
        if (dirtyFields.options?.[index]?.content) optionBody.content = option.content;
        if (dirtyFields.options?.[index]?.explanation) optionBody.explanation = option.explanation;
        if (Object.keys(optionBody).length > 0) {
          tasks.push({
            run: () => updateStagingOption(option.optionId, optionBody),
            commit: () => {
              if (optionBody.content !== undefined)
                form.resetField(`options.${index}.content`, { defaultValue: option.content });
              if (optionBody.explanation !== undefined)
                form.resetField(`options.${index}.explanation`, { defaultValue: option.explanation });
            },
          });
        }
      });
      // 정답 변경 시 이전 정답 옵션 + 새 정답 옵션 모두 PATCH (D4, 03 §8-5). 둘 다 성공해야 commit.
      if (dirtyFields.answerOptionId && values.answerOptionId !== originalAnswerOptionId) {
        const newAnswerOptionId = values.answerOptionId;
        tasks.push({
          run: () =>
            Promise.all([
              updateStagingOption(originalAnswerOptionId, { isAnswer: false }),
              updateStagingOption(newAnswerOptionId, { isAnswer: true }),
            ]),
          commit: () => form.resetField('answerOptionId', { defaultValue: newAnswerOptionId }),
        });
      }
      if (tasks.length === 0) return;

      setIsSaving(true);
      const results = await Promise.allSettled(tasks.map((task) => task.run()));
      setIsSaving(false);

      // 성공한 작업만 baseline 갱신(실패 필드는 입력값 dirty 유지). good-patterns.
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') tasks[index]?.commit();
      });
      const failed = results.filter((result) => result.status === 'rejected').length;
      if (failed < results.length) {
        void queryClient.invalidateQueries({ queryKey: stagingKeys.detail(label) });
      }

      if (failed === 0) {
        toast.success('저장되었습니다.');
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
        <Input
          id={`obj-instruction-${problem.problemId}`}
          className={cn(dirtyBorder(dirtyFields.instruction), roClass)}
          disabled={readOnly || isSaving}
          {...register('instruction')}
        />
      </FormField>
      <FormField label="본문" htmlFor={`obj-content-${problem.problemId}`} required error={errors.content?.message}>
        <Textarea
          id={`obj-content-${problem.problemId}`}
          className={cn('min-h-24', dirtyBorder(dirtyFields.content), roClass)}
          disabled={readOnly || isSaving}
          {...register('content')}
        />
      </FormField>

      <div className="flex flex-col gap-3">
        <h4 className="text-body font-medium text-foreground">보기 (4개 고정)</h4>
        <RadioGroup
          value={String(answerOptionId)}
          onValueChange={(value) => setValue('answerOptionId', Number(value), { shouldDirty: true })}
          disabled={readOnly || isSaving}
          className="gap-4"
        >
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3 rounded-md border border-border p-4">
              {/* 좌측 고정: 마커 + 정답 radio (입력칸 상단에 맞춰 정렬) */}
              <span className="w-5 shrink-0 pt-2 text-body text-foreground">{OPTION_MARKERS[index]}</span>
              <label className="flex shrink-0 items-center gap-2 pt-2 text-caption text-fg-secondary">
                <RadioGroupItem value={String(field.optionId)} />
                정답
              </label>
              {/* 우측 공유 컬럼: content·해설 동일 x좌표·너비 */}
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <Input
                    className={cn(dirtyBorder(dirtyFields.options?.[index]?.content), roClass)}
                    disabled={readOnly || isSaving}
                    {...register(`options.${index}.content`)}
                  />
                  <FieldError message={errors.options?.[index]?.content?.message} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-caption text-fg-muted">해설</span>
                  <Textarea
                    className={cn('min-h-16', dirtyBorder(dirtyFields.options?.[index]?.explanation), roClass)}
                    disabled={readOnly || isSaving}
                    {...register(`options.${index}.explanation`)}
                  />
                  <FieldError message={errors.options?.[index]?.explanation?.message} />
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={!isDirty || isSaving}>
            {isSaving && <Loader2 className="animate-spin" />}
            저장
          </Button>
        </div>
      )}
    </div>
  );
}
