import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ErrorResponse } from '@/shared/api/types';

const DEFAULT_MESSAGES: Record<number, string> = {
  400: '요청을 처리할 수 없습니다. 입력값을 확인해주세요.',
  403: '권한이 없습니다.',
  404: '요청한 항목을 찾을 수 없습니다.',
  409: '상태 전이가 허용되지 않습니다.',
  500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  502: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  503: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

const FALLBACK = '처리에 실패했습니다. 다시 시도해주세요.';
const NETWORK = '네트워크 연결을 확인해주세요.';

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Partial<ErrorResponse> | undefined;
    if (typeof data?.message === 'string' && data.message.length > 0) {
      return data.message;
    }
    if (!error.response) return NETWORK;
    return DEFAULT_MESSAGES[error.response.status] ?? FALLBACK;
  }
  return FALLBACK;
}

export function showErrorToast(error: unknown): void {
  toast.error(getErrorMessage(error));
}
