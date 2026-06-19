import { useParams } from 'react-router';
import { ROUTES } from '@/shared/constants/routes';
import { formatDateTime } from '@/shared/lib/formatDate';
import { useSetBreadcrumb } from '@/shared/hooks/useBreadcrumb';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { useInquiry } from '@/features/inquiries/queries';
import { InquiryStatusBadge } from '@/features/inquiries/components/InquiryStatusBadge';
import { InquiryTypeBadge } from '@/features/inquiries/components/InquiryTypeBadge';
import { InquiryAnswerSection } from '@/features/inquiries/components/InquiryAnswerSection';

/**
 * INQUIRY_DETAIL (inquiry-handoff A-2-2, B). 헤더(유형 배지 + 제목 + 상태 배지) + 문의 정보(작성자/이메일/작성일)
 * + 문의 내용 + 답변 영역(등록/수정/삭제). 작성자 닉네임/이메일은 탈퇴 시 null → 폴백 표시.
 */
export function InquiryDetailPage() {
  const { inquiryId } = useParams();
  const id = Number(inquiryId);
  const { data, isLoading, isError, refetch } = useInquiry(id);

  // breadcrumb: 문의 관리 > #{id}.
  useSetBreadcrumb([{ label: '문의 관리', href: ROUTES.INQUIRIES }, { label: `#${id}` }]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InquiryTypeBadge type={data.type} />
          <h1 className="text-h1 text-foreground">{data.title}</h1>
        </div>
        <InquiryStatusBadge status={data.status} />
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-h3 text-foreground">문의 정보</h3>
        <div className="flex items-center gap-4">
          <span className="w-20 text-body text-fg-secondary">작성자</span>
          <span className="text-body text-foreground">
            {data.submitterNickname ?? '(탈퇴한 사용자)'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-20 text-body text-fg-secondary">이메일</span>
          <span className="text-body text-foreground">{data.submitterEmail ?? '-'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-20 text-body text-fg-secondary">작성일</span>
          <span className="text-body text-foreground">{formatDateTime(data.createdAt)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-h3 text-foreground">문의 내용</h3>
        <blockquote className="whitespace-pre-wrap border-l-4 border-border pl-4 text-body text-fg-secondary">
          {data.content}
        </blockquote>
      </div>

      <InquiryAnswerSection inquiryId={id} answer={data.answer} />
    </div>
  );
}
