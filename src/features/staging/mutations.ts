import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promoteStagingLabel, updateStagingLesson } from '@/features/staging/api';
import { stagingKeys } from '@/features/staging/queries';

/** 스테이징 레슨 수정 (03 §8-3). 성공 시 라벨 상세 invalidate. */
export function useUpdateStagingLesson(lessonId: number, label: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string }) => updateStagingLesson(lessonId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stagingKeys.detail(label) });
    },
  });
}

/**
 * 스테이징 promote (03 §8-7, PENDING→COMPLETED). ⚠️ 비가역 — 실제 실행은 사람 위임.
 * 성공 시 staging 전체 invalidate. (dashboard 요약 invalidate·토스트·이동은 호출 페이지에서 — 04 §10-2-8.)
 */
export function usePromoteStagingLabel(label: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => promoteStagingLabel(label),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stagingKeys.all });
    },
  });
}
