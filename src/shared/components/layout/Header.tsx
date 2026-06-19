import { Breadcrumb } from '@/shared/components/layout/Breadcrumb';
import { ConfirmModal } from '@/shared/components/modals/ConfirmModal';
import { Button } from '@/shared/components/ui/button';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

/**
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
      <Button variant="ghost" className="ml-auto" onClick={() => setConfirmOpen(true)}>
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
