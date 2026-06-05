import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** clsx + tailwind-merge 클래스 병합 헬퍼 (04 §4). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
