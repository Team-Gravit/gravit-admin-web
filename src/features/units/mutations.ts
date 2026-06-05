import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUnit, type UpdateUnitBody } from '@/features/units/api';
import { unitKeys } from '@/features/units/queries';

/** 유닛 수정 (03 §7-7). 성공 시 유닛 상세 invalidate(제목·설명 갱신). */
export function useUpdateUnit(unitId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUnitBody) => updateUnit(unitId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: unitKeys.detail(unitId) });
    },
  });
}
