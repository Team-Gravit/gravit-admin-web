import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReportStatus } from '@/features/reports/api';
import { reportKeys } from '@/features/reports/queries';

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
