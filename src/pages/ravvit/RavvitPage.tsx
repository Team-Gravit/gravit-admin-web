import { useCurrentAdmin } from '@/features/auth/hooks';
import { RavvitConversation } from '@/features/ravvit/components/RavvitConversation';

/**
 * RAVVIT (RAVVIT_SPEC §A-1).
 * 본문 h1 도 Header breadcrumb 도 두지 않는다 — 대화에 집중시키기 위한 의도적 무제목 화면(D8-7).
 * 운영자 닉네임은 여기서 주입한다 — features/ravvit 가 features/auth 를 직접 참조하지 않도록.
 */
export function RavvitPage() {
  const admin = useCurrentAdmin();

  return <RavvitConversation nickname={admin?.nickname ?? null} />;
}
