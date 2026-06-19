import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUnit, type UpdateUnitBody } from '@/features/units/api';
import { unitKeys } from '@/features/units/queries';

export function useUpdateUnit(unitId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUnitBody) => updateUnit(unitId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: unitKeys.detail(unitId) });
    },
  });
}
