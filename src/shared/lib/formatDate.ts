import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (input: string | Date | null | undefined): string => {
  if (!input) return '-';
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return format(new Date(input), 'yyyy-MM-dd', { locale: ko });
};

export const formatDateTime = (input: string | Date | null | undefined): string => {
  if (!input) return '-';
  return format(new Date(input), 'yyyy-MM-dd HH:mm', { locale: ko });
};
