import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants/routes';
import { formatDateTime } from '@/shared/lib/formatDate';
import { useSetBreadcrumb } from '@/shared/hooks/useBreadcrumb';
import { reportTypeLabels } from '@/shared/constants/labels';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { useReport } from '@/features/reports/queries';
import { useUpdateReportStatus } from '@/features/reports/mutations';
import { ReportStatusBadge } from '@/features/reports/components/ReportStatusBadge';

export function ReportDetailPage() {
  const { reportId } = useParams();
  const id = Number(reportId);
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useReport(id);
  const updateStatus = useUpdateReportStatus(id);
  const [pending, setPending] = useState<boolean | null>(null);

  useSetBreadcrumb([{ label: '신고 관리', href: ROUTES.REPORTS }, { label: `#${id}` }]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const handleSelect = (value: string) => {
    const next = value === 'true';
    if (next !== data.isResolved) setPending(next);
  };

  const onConfirm = () => {
    if (pending === null) return;
    const next = pending;
    updateStatus.mutate(next, {
      onSuccess: () => {
        toast.success('신고가 처리되었습니다.');
        setPending(null);
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
            onValueChange={handleSelect}
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

      <ConfirmModal
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title="처리하시겠습니까?"
        description={pending ? '해결됨 상태로 변경합니다.' : '미해결 상태로 변경합니다.'}
        confirmLabel="확인"
        loading={updateStatus.isPending}
        onConfirm={onConfirm}
      />
    </div>
  );
}
