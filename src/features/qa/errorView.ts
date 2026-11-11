import { QaApiError } from '@/shared/api/qaClient';

export function qaErrorView(error: unknown): { message?: string; retryable: boolean } {
  if (error instanceof QaApiError)
    return { message: error.message, retryable: error.status !== 403 };
  return { retryable: true };
}
