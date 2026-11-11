import { z } from 'zod';
import { providerIdSchema } from '@/features/auth/schemas';
import type { ProviderId } from '@/features/auth/types';

const STORAGE_KEY = 'gravit_admin_pending_oauth_state';
const STATE_TTL_MS = 10 * 60 * 1000;
const pendingStateSchema = z.object({
  provider: providerIdSchema,
  state: z.string().min(1),
  createdAt: z.number().int().nonnegative(),
});

/** 제공자 앱을 거쳐 새 탭으로 돌아와도 검증할 수 있도록 localStorage에 저장한다. */
export function savePendingOAuthState(provider: ProviderId, state: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, state, createdAt: Date.now() }));
}

/** 이 브라우저가 시작한 로그인인지 검증하고, 성공 여부와 관계없이 한 번만 소비한다. */
export function consumePendingOAuthState(
  provider: ProviderId | undefined,
  state: string | null,
): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
  if (!raw || !state || !provider) return false;

  try {
    const pending = pendingStateSchema.parse(JSON.parse(raw));
    const age = Date.now() - pending.createdAt;
    return (
      age >= 0 && age < STATE_TTL_MS && pending.provider === provider && pending.state === state
    );
  } catch {
    return false;
  }
}
