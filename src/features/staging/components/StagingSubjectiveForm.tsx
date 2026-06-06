import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { FormField } from '@/shared/components/form/FormField';
import { ProblemTypeBadge } from '@/shared/components/status-badge/ProblemTypeBadge';
import { updateStagingAnswer, updateStagingProblem } from '@/features/staging/api';
import { stagingKeys } from '@/features/staging/queries';
import {
  stagingSubjectiveFormSchema,
  type StagingSubjectiveProblem,
  type StagingSubjectiveFormValues,
} from '@/features/staging/schemas';

interface StagingSubjectiveFormProps {
  problem: StagingSubjectiveProblem;
  problemNumber: number;
  label: string;
  /** 비활성 항목은 unmount 대신 hidden — 미저장 입력 보존(04 §10-2-3). */
  hidden?: boolean;
  /** dirty 변화를 좌측 리스트(●)로 lift-up (04 §10-2-4). */
  onDirtyChange?: (dirty: boolean) => void;
  /** COMPLETED read-only(04 §10-2-9): 입력 disabled + 저장 숨김. */
  readOnly?: boolean;
}

/**
 * 스테이징 주관식 폼 (DS-02 §16-4-3 + D1 단일 객체, 03 §8-4/§8-6, 04 §10-2-5).
 * 지시문/본문 + 정답 단일(콤마 구분 content) + 해설 1개. 정답 추가/삭제 없음.
 * 저장 = 변경 필드만 다중 PATCH(Promise.allSettled): 문제(§8-4) + 정답(§8-6).
 * 부분실패 세분 baseline·spinner·입력 비활성 정교화는 6-6, 변경 표시(●/4px)는 6-5.
 */
export function StagingSubjectiveForm({
  problem,
  problemNumber,
  label,
  hidden,
  onDirtyChange,
  readOnly,
}: StagingSubjectiveFormProps) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const { answer } = problem;

  const form = useForm<StagingSubjectiveFormValues>({
    resolver: zodResolver(stagingSubjectiveFormSchema),
    mode: 'onBlur',
    defaultValues: {
      instruction: problem.instruction,
      content: problem.content,
      answerContent: answer.content,
      answerExplanation: answer.explanation,
    },
  });
  const {
    register,
    formState: { errors, isDirty, dirtyFields },
  } = form;

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
      // 변경된 필드만 PATCH. 작업별 commit 으로 부분실패 시 성공 필드만 baseline 갱신(04 §10-2-5).
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
      const answerBody: { content?: string; explanation?: string } = {};
      if (dirtyFields.answerContent) answerBody.content = values.answerContent;
      if (dirtyFields.answerExplanation) answerBody.explanation = values.answerExplanation;
      if (Object.keys(answerBody).length > 0) {
        tasks.push({
          run: () => updateStagingAnswer(answer.answerId, answerBody),
          commit: () => {
            if (answerBody.content !== undefined)
              form.resetField('answerContent', { defaultValue: values.answerContent });
            if (answerBody.explanation !== undefined)
              form.resetField('answerExplanation', { defaultValue: values.answerExplanation });
          },
        });
      }
      if (tasks.length === 0) return;

      setIsSaving(true);
      const results = await Promise.allSettled(tasks.map((task) => task.run()));
      setIsSaving(false);

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

  const ids = {
    instruction: `subj-instruction-${problem.problemId}`,
    content: `subj-content-${problem.problemId}`,
    answer: `subj-answer-${problem.problemId}`,
    explanation: `subj-explanation-${problem.problemId}`,
  };

  return (
    <div className={cn('flex flex-col gap-5', hidden && 'hidden')}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-h3 text-foreground">문제 {problemNumber}</h3>
          <ProblemTypeBadge problemType={problem.problemType} />
        </div>
        <p className="text-caption text-fg-muted">ID: {problem.problemId}</p>
      </div>

      <FormField label="지시문" htmlFor={ids.instruction} required error={errors.instruction?.message}>
        <Input
          id={ids.instruction}
          className={cn(dirtyBorder(dirtyFields.instruction), roClass)}
          disabled={readOnly || isSaving}
          {...register('instruction')}
        />
      </FormField>
      <FormField label="본문" htmlFor={ids.content} required error={errors.content?.message}>
        <Textarea
          id={ids.content}
          className={cn('min-h-24', dirtyBorder(dirtyFields.content), roClass)}
          disabled={readOnly || isSaving}
          {...register('content')}
        />
      </FormField>

      {/* D1: 정답 단일(인정 표기는 콤마로 구분) + 해설 1개. 추가/삭제 없음. */}
      <FormField
        label="정답 (인정 표기는 콤마로 구분)"
        htmlFor={ids.answer}
        required
        error={errors.answerContent?.message}
      >
        <Input
          id={ids.answer}
          placeholder="예: 데이터베이스,데이터 베이스,database"
          className={cn(dirtyBorder(dirtyFields.answerContent), roClass)}
          disabled={readOnly || isSaving}
          {...register('answerContent')}
        />
      </FormField>
      <FormField label="해설" htmlFor={ids.explanation} required error={errors.answerExplanation?.message}>
        <Textarea
          id={ids.explanation}
          className={cn('min-h-24', dirtyBorder(dirtyFields.answerExplanation), roClass)}
          disabled={readOnly || isSaving}
          {...register('answerExplanation')}
        />
      </FormField>

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
