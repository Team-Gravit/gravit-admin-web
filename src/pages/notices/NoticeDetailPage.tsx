import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Pencil, Pin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants/routes';
import { formatDate } from '@/shared/lib/formatDate';
import { useSetBreadcrumb } from '@/shared/hooks/useBreadcrumb';
import { Button } from '@/shared/components/ui/button';
import { ErrorState } from '@/shared/components/states/ErrorState';
import { LoadingSkeleton } from '@/shared/components/states/LoadingSkeleton';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { useNotice } from '@/features/notices/queries';
import { useDeleteNotice } from '@/features/notices/mutations';
import { NoticeStatusBadge } from '@/features/notices/components/NoticeStatusBadge';
import { MarkdownViewer } from '@/shared/components/markdown/MarkdownViewer';
import { NoticeEditForm } from '@/features/notices/components/NoticeEditForm';

export function NoticeDetailPage() {
  const { noticeId } = useParams();
  const id = Number(noticeId);
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useNotice(id);
  const deleteNotice = useDeleteNotice();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useSetBreadcrumb([
    { label: '공지 관리', href: ROUTES.NOTICES },
    ...(data ? [{ label: data.title }] : []),
  ]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  if (mode === 'edit') {
    return (
      <NoticeEditForm notice={data} onCancel={() => setMode('view')} onSaved={() => setMode('view')} />
    );
  }

  const handleDelete = () => {
    deleteNotice.mutate(id, {
      onSuccess: () => {
        toast.success('공지가 삭제되었습니다.');
        navigate(ROUTES.NOTICES);
      },
    });
  };

  const publishedLabel =
    data.status === 'DRAFT' || !data.publishedAt ? '-' : formatDate(data.publishedAt);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {data.pinned && <Pin className="size-5 text-primary" />}
            <NoticeStatusBadge status={data.status} />
            <h1 className="text-h1 text-foreground">{data.title}</h1>
          </div>
          <p className="text-caption text-fg-muted">
            게시일: {publishedLabel} · 작성일: {formatDate(data.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setMode('edit')}>
            <Pencil />
            편집
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 />
            삭제
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-6">
        <section className="flex flex-col gap-2">
          <h3 className="text-h3 text-foreground">요약</h3>
          <p className="text-body text-fg-secondary">{data.summary}</p>
        </section>
        <hr className="border-border" />
        <MarkdownViewer content={data.content} />
      </div>

      <ConfirmModal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="공지를 삭제하시겠습니까?"
        description={`"${data.title}" 공지를 삭제합니다. 삭제된 공지는 목록에서 사라집니다.`}
        variant="destructive"
        confirmLabel="삭제"
        loading={deleteNotice.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
