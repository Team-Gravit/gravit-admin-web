import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  Plus,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge';
import { ChecklistItemFormModal } from '@/features/qa/components/ChecklistItemFormModal';
import { PartChips } from '@/features/qa/components/PartChips';
import { ReviewItemRow } from '@/features/qa/components/ReviewItemRow';
import { useConfirmFeatureItems, useUpdateChecklistItem } from '@/features/qa/mutations';
import { NOTICE_COPY, warningText } from '@/features/qa/copy';
import { itemRuleError } from '@/features/qa/errorView';
import { SPEC_STATUS_BADGE_VARIANT, SPEC_STATUS_LABELS } from '@/features/qa/labels';
import { figmaNodeUrl } from '@/features/qa/links';
import type { ChecklistFeature, ChecklistItem } from '@/features/qa/schemas';

interface ReviewFeatureGroupProps {
  sprintId: number;
  block: ChecklistFeature;
  /** 필터를 통과한 항목 */
  items: ChecklistItem[];
  figmaFileKey: string | null;
  editable: boolean;
}

const linkClass = 'inline-flex items-center gap-1 text-caption text-primary hover:underline';

/**
 * 분류 검토의 기능 그룹 (QA_SPEC B-3) — 접을 수 있는 블록, 기본 펼침.
 * 머리: 화면 ID·이름·파트·명세 상태·Notion/Figma 링크·경고 수, 오른쪽 [이 기능 항목 모두 확정](결정 #8)·[항목 추가].
 */
export function ReviewFeatureGroup({
  sprintId,
  block,
  items,
  figmaFileKey,
  editable,
}: ReviewFeatureGroupProps) {
  const { feature, warnings } = block;
  const [collapsed, setCollapsed] = useState(false);
  const [warningsOpen, setWarningsOpen] = useState(false);
  // 수정 중인 항목은 id 로 들고 캐시의 최신 항목(version)을 본다
  const [editingId, setEditingId] = useState<number | null>(null);
  const editing = block.items.find((i) => i.id === editingId) ?? null;
  const [adding, setAdding] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const update = useUpdateChecklistItem(sprintId);
  const confirmAll = useConfirmFeatureItems(sprintId);
  const proposedIds = block.items.filter((i) => i.reviewState === 'PROPOSED').map((i) => i.id);
  const busyItemId = update.isPending ? update.variables?.itemId : undefined;

  const review = (item: ChecklistItem, reviewState: 'CONFIRMED' | 'REJECTED') =>
    update.mutate(
      { itemId: item.id, body: { reviewState, version: item.version } },
      {
        onError: (error) => {
          // 행 동작에는 입력란이 없으므로 422(A-3 코드별 문구)도 토스트로 알린다
          const rule = itemRuleError(error);
          if (rule) toast.error(rule.message);
        },
      },
    );

  const confirmFeature = () => {
    setProgress({ done: 0, total: proposedIds.length });
    confirmAll.mutate(
      {
        itemIds: proposedIds,
        onProgress: (done) => setProgress({ done, total: proposedIds.length }),
      },
      {
        // 409·그 밖은 훅이 처리한다. 입력란이 없으므로 422 만 여기서 토스트.
        onError: (error) => {
          const rule = itemRuleError(error);
          if (rule) toast.error(rule.message);
        },
        onSettled: () => setProgress(null),
      },
    );
  };

  return (
    <section className="rounded-lg border border-border bg-surface">
      <header className="flex items-start justify-between gap-4 px-6 py-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? '펼치기' : '접기'}
              className="text-fg-muted hover:text-foreground"
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            <code className="font-mono text-caption text-fg-secondary">{feature.screenId}</code>
            <h3 className="text-h3 text-foreground">{feature.name}</h3>
            <PartChips parts={feature.parts} />
            <StatusBadge variant={SPEC_STATUS_BADGE_VARIANT[feature.specStatus]}>
              {SPEC_STATUS_LABELS[feature.specStatus]}
            </StatusBadge>
            {warnings.length > 0 && (
              <button
                type="button"
                onClick={() => setWarningsOpen((v) => !v)}
                aria-expanded={warningsOpen}
                className="group inline-flex items-center gap-0.5 text-fg-muted hover:text-foreground"
              >
                <StatusBadge variant="warning" className="group-hover:underline">
                  경고 {warnings.length}
                </StatusBadge>
                {warningsOpen ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 pl-6">
            {feature.notionUrl && (
              <a
                href={feature.notionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Notion
                <ExternalLink className="size-3.5" />
              </a>
            )}
            {figmaFileKey &&
              feature.figmaNodeIds.map((nodeId, i) => (
                <a
                  key={nodeId}
                  href={figmaNodeUrl(figmaFileKey, nodeId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Figma{feature.figmaNodeIds.length > 1 ? ` ${i + 1}` : ''}
                  <ExternalLink className="size-3.5" />
                </a>
              ))}
          </div>
        </div>

        {editable && (
          <div className="flex shrink-0 items-center gap-2">
            {proposedIds.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                // 행 요청이 진행 중이면 응답 전 version 으로 다시 보내 409 가 나므로 함께 막는다
                disabled={confirmAll.isPending || update.isPending}
                onClick={confirmFeature}
              >
                {confirmAll.isPending && <Loader2 className="animate-spin" />}
                {progress ? `${progress.done}/${progress.total}` : '이 기능 항목 모두 확정'}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
              <Plus />
              항목 추가
            </Button>
          </div>
        )}
      </header>

      {warningsOpen && warnings.length > 0 && (
        <ul className="mx-6 mb-4 flex flex-col gap-1 rounded-md bg-warning-bg px-3 py-2.5">
          {warnings.map((w) => (
            <li key={w} className="flex items-start gap-1.5 text-caption text-warning-text">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {warningText(w)}
            </li>
          ))}
        </ul>
      )}

      {/* 경고가 있어 남겨 둔 그룹 — 필터에 맞는 항목이 없음을 알린다 */}
      {!collapsed && items.length === 0 && (
        <p className="border-t border-border px-6 py-4 text-caption text-fg-muted">
          {NOTICE_COPY.EMPTY_FILTERED}
        </p>
      )}

      {!collapsed && items.length > 0 && (
        <ul className="divide-y divide-border border-t border-border">
          {items.map((item) => (
            <ReviewItemRow
              key={item.id}
              item={item}
              editable={editable}
              busy={update.isPending || confirmAll.isPending}
              spinning={busyItemId === item.id}
              onReview={(state) => review(item, state)}
              onEdit={() => setEditingId(item.id)}
            />
          ))}
        </ul>
      )}

      {editing && (
        <ChecklistItemFormModal
          open
          onOpenChange={(open) => !open && setEditingId(null)}
          sprintId={sprintId}
          feature={feature}
          item={editing}
        />
      )}
      {adding && (
        <ChecklistItemFormModal
          open
          onOpenChange={(open) => !open && setAdding(false)}
          sprintId={sprintId}
          feature={feature}
        />
      )}
    </section>
  );
}
