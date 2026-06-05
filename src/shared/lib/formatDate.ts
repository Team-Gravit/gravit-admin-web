import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜 포맷 (04 §9-9). YYYY-MM-DD 문자열은 그대로, Date/ISO 는 yyyy-MM-dd 로.
 * (03 §12-1: 서버는 UTC+ISO8601 전송, 표시 변환은 클라 책임)
 */
export const formatDate = (input: string | Date | null | undefined): string => {
  if (!input) return '-';
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return format(new Date(input), 'yyyy-MM-dd', { locale: ko });
};

/** ISO 8601 UTC → "yyyy-MM-dd HH:mm" (브라우저 로컬). */
export const formatDateTime = (input: string | Date | null | undefined): string => {
  if (!input) return '-';
  return format(new Date(input), 'yyyy-MM-dd HH:mm', { locale: ko });
};
