import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReportStatus } from '@/features/reports/api';
import { reportKeys } from '@/features/reports/queries';

/** 신고 처리상태 변경 (03 §6-3). 성공 시 detail+lists invalidate (04 §9-1). */
export function useUpdateReportStatus(reportId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isResolved: boolean) => updateReportStatus(reportId, isResolved),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reportKeys.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}
