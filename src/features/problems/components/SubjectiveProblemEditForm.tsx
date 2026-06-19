import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { MarkdownEditor } from '@/shared/components/markdown/MarkdownEditor';
import { FormField } from '@/shared/components/form/FormField';
import { UnsavedChangesModal } from '@/shared/components/modals/UnsavedChangesModal';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import {
  subjectiveEditFormSchema,
  type SubjectiveProblem,
  type SubjectiveEditFormValues,
} from '@/features/problems/schemas';
import { useUpdateSubjectiveProblem } from '@/features/problems/mutations';

interface SubjectiveProblemEditFormProps {
  problem: SubjectiveProblem;
  onCancel: () => void;
  onSaved: () => void;
}

export function SubjectiveProblemEditForm({
  problem,
  onCancel,
  onSaved,
}: SubjectiveProblemEditFormProps) {
  const updateSubjective = useUpdateSubjectiveProblem(problem.problemId);
  const { answer } = problem;
  const form = useForm<SubjectiveEditFormValues>({
    resolver: zodResolver(subjectiveEditFormSchema),
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
    watch,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = form;

  const blocker = useUnsavedChangesGuard(isDirty && !isSubmitSuccessful);

  const onSubmit = form.handleSubmit(
    (values) => {
      updateSubjective.mutate(
        {
          instruction: values.instruction,
          content: values.content,
          answer: {
            answerId: answer.answerId,
            content: values.answerContent,
            explanation: values.answerExplanation,
          },
        },
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
        <FormField label="본문" htmlFor="content" required error={errors.content?.message}>
          <MarkdownEditor
            id="content"
            className="min-h-24"
            registration={register('content')}
            value={watch('content')}
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-h3 text-foreground">정답</h3>
        <FormField
          label="정답 (인정 표기는 콤마로 구분)"
          htmlFor="answerContent"
          required
          error={errors.answerContent?.message}
        >
          <Input
            id="answerContent"
            placeholder="예: 데이터베이스,데이터 베이스,database"
            {...register('answerContent')}
          />
        </FormField>
        <FormField
          label="해설"
          htmlFor="answerExplanation"
          required
          error={errors.answerExplanation?.message}
        >
          <Textarea id="answerExplanation" className="min-h-24" {...register('answerExplanation')} />
        </FormField>
      </section>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={updateSubjective.isPending}>
          취소
        </Button>
        <Button onClick={onSubmit} disabled={updateSubjective.isPending}>
          저장
        </Button>
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesModal open onConfirm={() => blocker.proceed()} onCancel={() => blocker.reset()} />
      )}
    </div>
  );
}
