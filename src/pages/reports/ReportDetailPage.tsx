import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants/routes';
import { formatDateTime } from '@/shared/lib/formatDate';
import { reportTypeLabels } from '@/shared/constants/labels';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { useReport } from '@/features/reports/queries';
import { useUpdateReportStatus } from '@/features/reports/mutations';
import { ReportStatusBadge } from '@/features/reports/components/ReportStatusBadge';

/**
 * REPORT_DETAIL (DS-02 §9, 03 §6-2/§6-3). 신고정보 + 내용 + 처리상태(Select).
 * 처리 후 분기(04 §10-4): 미해결→해결됨 = 목록 자동 이동(미해결 default·1p), 해결됨→미해결 = 머무름.
 * (필터 유지: REPORT_LIST 가 기본 미해결이라 복귀 시 미해결 default 로 복원 — 주 사례 충족.)
 */
export function ReportDetailPage() {
  const { reportId } = useParams();
  const id = Number(reportId);
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useReport(id);
  const updateStatus = useUpdateReportStatus(id);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const handleStatusChange = (value: string) => {
    const next = value === 'true';
    if (next === data.isResolved) return;
    updateStatus.mutate(next, {
      onSuccess: () => {
        toast.success('신고가 처리되었습니다.');
        // 미해결 → 해결됨: 목록으로 이동(미해결 default + 1페이지). 해결됨 → 미해결: 머무름(invalidate 갱신).
        if (!data.isResolved && next) navigate(ROUTES.REPORTS);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-foreground">신고 #{data.reportId}</h1>
        <ReportStatusBadge isResolved={data.isResolved} />
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-h3 text-foreground">신고 정보</h3>
        <div className="flex items-center gap-4">
          <span className="w-20 text-body text-fg-secondary">유형</span>
          <span className="text-body text-foreground">
            {reportTypeLabels[data.reportType]} ({data.reportType})
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-20 text-body text-fg-secondary">문제 ID</span>
          <span className="text-body text-foreground">P-{data.problemId}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.PROBLEM_DETAIL(data.problemId))}
          >
            문제 보기 →
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-20 text-body text-fg-secondary">제출일</span>
          <span className="text-body text-foreground">{formatDateTime(data.submittedAt)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-h3 text-foreground">신고 내용</h3>
        <blockquote className="whitespace-pre-wrap border-l-4 border-border pl-4 text-body text-fg-secondary">
          {data.content}
        </blockquote>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-h3 text-foreground">처리 상태</h3>
        <div className="flex items-center gap-4">
          <span className="w-20 text-body text-fg-secondary">현재 상태</span>
          <Select
            value={String(data.isResolved)}
            onValueChange={handleStatusChange}
            disabled={updateStatus.isPending}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">미해결</SelectItem>
              <SelectItem value="true">해결됨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
