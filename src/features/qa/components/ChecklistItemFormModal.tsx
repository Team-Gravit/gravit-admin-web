import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QaApiError } from '@/shared/api/qaClient';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { FormField } from '@/shared/components/form/FormField';
import { QaNotice } from '@/features/qa/components/QaNotice';
import { useCreateChecklistItem, useUpdateChecklistItem } from '@/features/qa/mutations';
import type { ChecklistItemUpdateBody } from '@/features/qa/api';
import { ERROR_COPY, NOTICE_COPY, TOAST_COPY } from '@/features/qa/copy';
import {
  CLASSIFICATION_LABELS,
  PART_LABELS,
  PART_ORDER,
  PERSONA_OPTIONS,
} from '@/features/qa/labels';
import {
  PERSONA_NONE,
  checklistItemFormSchema,
  type ChecklistItem,
  type ChecklistItemFormValues,
  type Feature,
  type Part,
} from '@/features/qa/schemas';

interface ChecklistItemFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprintId: number;
  feature: Feature;
  /** 있으면 수정, 없으면 추가 */
  item?: ChecklistItem;
}

const ordered = (parts: Part[]) => PART_ORDER.filter((p) => parts.includes(p));
const sameParts = (a: Part[], b: Part[]) => ordered(a).join() === ordered(b).join();
const personaOrNull = (key: string) => (key === PERSONA_NONE ? null : key);

function defaultsOf(feature: Feature, item?: ChecklistItem): ChecklistItemFormValues {
  if (!item) {
    return {
      title: '',
      expected: '',
      parts: ordered(feature.parts),
      classification: 'MANUAL',
      testRef: '',
      personaKey: PERSONA_NONE,
    };
  }
  return {
    title: item.title,
    expected: item.expected,
    parts: ordered(item.parts),
    classification: item.classification,
    testRef: item.testRef ?? '',
    personaKey: item.personaKey ?? PERSONA_NONE,
  };
}

/** 바꾼 필드만 (A-2 #10). 자동이 아니면 테스트 ID 는 숨겨진 값이라 보내지 않는다. */
function changedFields(item: ChecklistItem, v: ChecklistItemFormValues) {
  const body: Omit<ChecklistItemUpdateBody, 'version'> = {};
  // 폼 값은 trim 된다 — 원본도 trim 해 비교해야 앞뒤 공백만 다른 필드가 딸려 가지 않는다
  if (v.title !== item.title.trim()) body.title = v.title;
  if (v.expected !== item.expected.trim()) body.expected = v.expected;
  if (!sameParts(v.parts, item.parts)) body.parts = ordered(v.parts);
  if (v.classification !== item.classification) body.classification = v.classification;
  if (v.classification === 'AUTO' && v.testRef !== (item.testRef ?? '')) body.testRef = v.testRef;
  if (personaOrNull(v.personaKey) !== item.personaKey)
    body.personaKey = personaOrNull(v.personaKey);
  return body;
}

/**
 * 체크 항목 추가·수정 모달 (QA_SPEC B-3).
 * 파트는 기능의 parts 에 있는 것만 고를 수 있다(G4 — 서버 거부 여부 미확정이라 화면이 막는다).
 * 422 = 테스트 카탈로그에 없는 테스트 ID → 테스트 ID 아래에 F-5 AUTO_NOT_ALLOWED.
 * 409 = 다른 운영자가 먼저 변경 → 모달을 닫는다(체크리스트 다시 조회·STALE 토스트는 훅이 한다).
 * 열 때마다 새로 마운트한다(부모가 열린 동안만 렌더) — 캐시가 바뀌어도 입력 중인 값을 덮지 않는다.
 */
export function ChecklistItemFormModal({
  open,
  onOpenChange,
  sprintId,
  feature,
  item,
}: ChecklistItemFormModalProps) {
  const update = useUpdateChecklistItem(sprintId);
  const create = useCreateChecklistItem(sprintId);
  const pending = update.isPending || create.isPending;

  const form = useForm<ChecklistItemFormValues>({
    resolver: zodResolver(checklistItemFormSchema),
    mode: 'onBlur',
    defaultValues: defaultsOf(feature, item),
  });
  const { control, register, watch, setError, formState } = form;
  const { errors } = formState;
  const classification = watch('classification');

  const onError = (error: unknown) => {
    if (error instanceof QaApiError && error.status === 422) {
      setError(
        'testRef',
        { type: 'server', message: ERROR_COPY.AUTO_NOT_ALLOWED },
        { shouldFocus: true },
      );
      return;
    }
    if (error instanceof QaApiError && error.status === 409) onOpenChange(false);
  };

  const onSubmit = form.handleSubmit(
    (values) => {
      if (item) {
        const body = changedFields(item, values);
        if (Object.keys(body).length === 0) return onOpenChange(false);
        update.mutate(
          { itemId: item.id, body: { ...body, version: item.version } },
          {
            onSuccess: () => {
              toast.success(TOAST_COPY.ITEM_UPDATED);
              onOpenChange(false);
            },
            onError,
          },
        );
        return;
      }
      create.mutate(
        {
          featureId: feature.id,
          title: values.title,
          expected: values.expected,
          parts: ordered(values.parts),
          classification: values.classification,
          ...(values.classification === 'AUTO' ? { testRef: values.testRef } : {}),
          ...(values.personaKey !== PERSONA_NONE ? { personaKey: values.personaKey } : {}),
        },
        {
          onSuccess: () => {
            toast.success(TOAST_COPY.ITEM_CREATED);
            onOpenChange(false);
          },
          onError,
        },
      );
    },
    () => toast.error('필수 항목을 확인해주세요.'),
  );

  const formId = item ? `qa-item-edit-${item.id}` : `qa-item-create-${feature.id}`;

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? '항목 수정' : '항목 추가'}</DialogTitle>
        </DialogHeader>

        <form id={formId} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <FormField
            label="제목"
            htmlFor={`${formId}-title`}
            required
            error={errors.title?.message}
          >
            <Input id={`${formId}-title`} disabled={pending} {...register('title')} />
          </FormField>

          <FormField
            label="기대 결과"
            htmlFor={`${formId}-expected`}
            required
            error={errors.expected?.message}
          >
            <Textarea
              id={`${formId}-expected`}
              rows={4}
              disabled={pending}
              {...register('expected')}
            />
          </FormField>

          <FormField label="파트" required error={errors.parts?.message}>
            <Controller
              control={control}
              name="parts"
              render={({ field }) => (
                <div className="flex items-center gap-4">
                  {PART_ORDER.map((part) => {
                    // 기능 parts 밖 파트는 새로 고를 수 없다. 이미 들어 있으면 해제는 할 수 있다(G4).
                    const allowed = feature.parts.includes(part) || field.value.includes(part);
                    const id = `${formId}-part-${part}`;
                    return (
                      <label
                        key={part}
                        htmlFor={id}
                        className={`flex items-center gap-2 text-body ${allowed ? 'text-foreground' : 'text-fg-disabled'}`}
                      >
                        <Checkbox
                          id={id}
                          disabled={!allowed || pending}
                          checked={field.value.includes(part)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked === true
                                ? ordered([...field.value, part])
                                : field.value.filter((p) => p !== part),
                            )
                          }
                        />
                        {PART_LABELS[part]}
                      </label>
                    );
                  })}
                </div>
              )}
            />
            <QaNotice className="mt-1.5">{NOTICE_COPY.PARTS_HINT}</QaNotice>
          </FormField>

          <FormField label="분류" required>
            <Controller
              control={control}
              name="classification"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={pending}
                  className="flex items-center gap-4"
                >
                  {(['AUTO', 'MANUAL'] as const).map((value) => (
                    <label
                      key={value}
                      htmlFor={`${formId}-cls-${value}`}
                      className="flex items-center gap-2 text-body text-foreground"
                    >
                      <RadioGroupItem id={`${formId}-cls-${value}`} value={value} />
                      {CLASSIFICATION_LABELS[value]}
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
          </FormField>

          {classification === 'AUTO' && (
            <FormField
              label="테스트 ID"
              htmlFor={`${formId}-testref`}
              required
              error={errors.testRef?.message}
            >
              <Input
                id={`${formId}-testref`}
                autoComplete="off"
                disabled={pending}
                {...register('testRef')}
              />
            </FormField>
          )}

          <FormField label="페르소나">
            <Controller
              control={control}
              name="personaKey"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PERSONA_NONE}>없음</SelectItem>
                    {PERSONA_OPTIONS.map((p) => (
                      <SelectItem key={p.key} value={p.key}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            취소
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={pending || (item !== undefined && !formState.isDirty)}
          >
            {pending && <Loader2 className="animate-spin" />}
            {item ? '저장' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
