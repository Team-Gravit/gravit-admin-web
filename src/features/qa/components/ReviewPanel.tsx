import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { z } from 'zod';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { EmptyState } from '@/shared/components/states/EmptyState';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { ConfirmChecklistModal } from '@/features/qa/components/ConfirmChecklistModal';
import { QaNotice } from '@/features/qa/components/QaNotice';
import { ReviewFeatureGroup } from '@/features/qa/components/ReviewFeatureGroup';
import { useConfirmChecklist } from '@/features/qa/mutations';
import { useChecklist } from '@/features/qa/queries';
import { NOTICE_COPY, blockerCopy } from '@/features/qa/copy';
import { qaErrorView } from '@/features/qa/errorView';
import { REVIEW_STATE_LABELS } from '@/features/qa/labels';
import { reviewStateSchema, type ReviewState, type Sprint } from '@/features/qa/schemas';

type ReviewFilter = ReviewState | 'ALL';

function toReviewFilter(value: string): ReviewFilter {
  const parsed = reviewStateSchema.safeParse(value);
  return parsed.success ? parsed.data : 'ALL';
}

/** OPEN_CONFIRM_STATE(screens.ts) 판별 */
const openConfirmStateSchema = z.object({ openConfirm: z.literal(true) });

const NOT_READY: ReadonlyArray<Sprint['status']> = ['DRAFT', 'PREPARING', 'PREPARE_FAILED'];

/**
 * 분류 검토 화면 본문 (QA_SPEC B-3).
 * - 초안 전(DRAFT·PREPARING·PREPARE_FAILED): 목록 대신 REVIEW_NOT_READY + 준비 화면 링크
 * - REVIEW 가 아니면 편집 컨트롤 없이 읽기 전용 + REVIEW_READONLY
 * - [체크리스트 확정]은 검토 전 0개일 때만, 막혔으면 버튼 옆에 F-2 막힌 이유
 */
export function ReviewPanel({ sprint }: { sprint: Sprint }) {
  const notReady = NOT_READY.includes(sprint.status);
  const editable = sprint.status === 'REVIEW';
  const checklistQuery = useChecklist(sprint.id, !notReady);
  const checklist = checklistQuery.data;

  // 기본 '검토 전'. 확정 이후(읽기 전용)에는 검토 전이 남을 수 없어 '전체'로 시작한다.
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>(editable ? 'PROPOSED' : 'ALL');
  const [needsCheckOnly, setNeedsCheckOnly] = useState(false);
  const [warningsOnly, setWarningsOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirm = useConfirmChecklist(sprint.id);
  const navigate = useNavigate();
  const location = useLocation();

  const allItems = useMemo(() => checklist?.features.flatMap((f) => f.items) ?? [], [checklist]);
  const counts = {
    PROPOSED: allItems.filter((i) => i.reviewState === 'PROPOSED').length,
    CONFIRMED: allItems.filter((i) => i.reviewState === 'CONFIRMED').length,
    REJECTED: allItems.filter((i) => i.reviewState === 'REJECTED').length,
  };
  const canConfirm = editable && checklist !== undefined && counts.PROPOSED === 0;
  const hasAutoItems = allItems.some(
    (i) => i.reviewState === 'CONFIRMED' && i.classification === 'AUTO',
  );

  // 배너에서 넘어온 확정 요청: 체크리스트를 받은 뒤(자동 항목 여부를 알아야 한다) 한 번만 연다.
  useEffect(() => {
    if (!openConfirmStateSchema.safeParse(location.state).success || !checklist) return;
    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: null },
    );
    if (canConfirm) setConfirmOpen(true);
  }, [location.state, location.pathname, location.search, checklist, canConfirm, navigate]);

  const groups = useMemo(() => {
    if (!checklist) return [];
    const q = search.trim().toLowerCase();
    return (
      checklist.features
        .filter(({ feature, warnings }) => {
          if (needsCheckOnly && feature.specStatus !== 'NEEDS_CHECK') return false;
          if (warningsOnly && warnings.length === 0) return false;
          if (!q) return true;
          return (
            feature.screenId.toLowerCase().includes(q) || feature.name.toLowerCase().includes(q)
          );
        })
        .map((block) => ({
          block,
          items: block.items.filter(
            (i) => reviewFilter === 'ALL' || i.reviewState === reviewFilter,
          ),
        }))
        // 필터에 맞는 항목이 없는 그룹은 숨기되, 경고가 있는 그룹은 남긴다 — ITEM_GENERATION_FAILED 처럼
        // '실패 항목을 거절하고 직접 추가' 안내와 [항목 추가]가 거절 직후 사라지면 안 된다(B-3).
        .filter((g) => reviewFilter === 'ALL' || g.items.length > 0 || g.block.warnings.length > 0)
    );
  }, [checklist, search, needsCheckOnly, warningsOnly, reviewFilter]);

  if (notReady) {
    return (
      <div className="rounded-lg border border-border bg-surface">
        <EmptyState
          message={NOTICE_COPY.REVIEW_NOT_READY}
          action={
            <Button variant="outline" asChild>
              <Link to={ROUTES.QA_SPRINT_SETUP(sprint.id)}>{NOTICE_COPY.GO_SETUP}</Link>
            </Button>
          }
        />
      </div>
    );
  }
  if (checklistQuery.isLoading) return <LoadingSkeleton />;
  if (checklistQuery.isError || !checklist) {
    const view = qaErrorView(checklistQuery.error);
    return (
      <ErrorState
        message={view.message}
        onRetry={view.retryable ? () => checklistQuery.refetch() : undefined}
      />
    );
  }

  const onConfirm = (startAutoRun: boolean | undefined) =>
    confirm.mutate(
      { ...(startAutoRun === undefined ? {} : { startAutoRun }), version: sprint.version },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          navigate(ROUTES.QA_SPRINT_CHECKLIST(sprint.id));
        },
        onError: () => setConfirmOpen(false),
      },
    );

  const blocked = blockerCopy({
    code: 'PROPOSED_ITEMS_REMAINING',
    count: counts.PROPOSED,
    part: null,
  });
  const isFiltered =
    reviewFilter !== 'ALL' || needsCheckOnly || warningsOnly || search.trim() !== '';

  return (
    <div className="flex flex-col gap-4">
      {!editable && <QaNotice>{NOTICE_COPY.REVIEW_READONLY}</QaNotice>}

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-6 py-4">
        <p className="text-body text-foreground">
          검토 전 {counts.PROPOSED}개, 확정 {counts.CONFIRMED}개, 거절 {counts.REJECTED}개
        </p>
        {editable && (
          <div className="flex items-center gap-3">
            {!canConfirm && blocked && (
              <span className="text-caption text-fg-secondary">{blocked}</span>
            )}
            <Button disabled={!canConfirm} onClick={() => setConfirmOpen(true)}>
              체크리스트 확정
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select value={reviewFilter} onValueChange={(v) => setReviewFilter(toReviewFilter(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {reviewStateSchema.options.map((state) => (
              <SelectItem key={state} value={state}>
                {REVIEW_STATE_LABELS[state]}
              </SelectItem>
            ))}
            <SelectItem value="ALL">전체</SelectItem>
          </SelectContent>
        </Select>
        <label
          htmlFor="qa-needs-check"
          className="flex items-center gap-2 text-body text-foreground"
        >
          <Checkbox
            id="qa-needs-check"
            checked={needsCheckOnly}
            onCheckedChange={(c) => setNeedsCheckOnly(c === true)}
          />
          확인 필요 명세만
        </label>
        <label
          htmlFor="qa-warnings-only"
          className="flex items-center gap-2 text-body text-foreground"
        >
          <Checkbox
            id="qa-warnings-only"
            checked={warningsOnly}
            onCheckedChange={(c) => setWarningsOnly(c === true)}
          />
          경고 있는 기능만
        </label>
        <div className="relative ml-auto w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="화면 ID, 기능 이름"
            aria-label="화면 ID, 기능 이름 검색"
            className="pl-9"
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState message={isFiltered ? NOTICE_COPY.EMPTY_FILTERED : NOTICE_COPY.EMPTY_ITEMS} />
        </div>
      ) : (
        groups.map(({ block, items }) => (
          <ReviewFeatureGroup
            key={block.feature.id}
            sprintId={sprint.id}
            block={block}
            items={items}
            figmaFileKey={sprint.figmaFileKey}
            editable={editable}
          />
        ))
      )}

      {confirmOpen && (
        <ConfirmChecklistModal
          open
          onOpenChange={setConfirmOpen}
          hasAutoItems={hasAutoItems}
          loading={confirm.isPending}
          onConfirm={onConfirm}
        />
      )}
    </div>
  );
}
