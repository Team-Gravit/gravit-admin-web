import { useSetBreadcrumb } from '@/shared/hooks/useBreadcrumb';
import { useCurrentAdmin } from '@/features/auth/hooks';
import { RavvitConversation } from '@/features/ravvit/components/RavvitConversation';

/**
 * RAVVIT (RAVVIT_SPEC §A-1).
 * 본문 h1 을 두지 않는 유일한 화면이라 화면 제목은 Header breadcrumb 이 대신한다(결정 #4 의 전제).
 * 운영자 닉네임은 여기서 주입한다 — features/ravvit 가 features/auth 를 직접 참조하지 않도록.
 */
export function RavvitPage() {
  useSetBreadcrumb([{ label: 'Ravvit' }]);
  const admin = useCurrentAdmin();

  return <RavvitConversation nickname={admin?.nickname ?? null} />;
}
