import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Breadcrumb } from '@/shared/components/layout/Breadcrumb';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';

/**
 * Header (DS-00 §7). 56px, 하단 1px border. 좌측 breadcrumb, 우측 [로그아웃](confirm 후 onLogout).
 * presentational — 로그아웃 동작은 prop 으로 주입(shared→features 금지).
 */
interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex h-header items-center justify-between border-b border-border bg-surface px-8">
      <Breadcrumb />
      <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
        <LogOut />
        로그아웃
      </Button>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="로그아웃하시겠습니까?"
        confirmLabel="로그아웃"
        onConfirm={() => {
          setConfirmOpen(false);
          onLogout();
        }}
      />
    </header>
  );
}
