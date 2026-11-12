import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Register project width tokens so a modal's explicit width replaces its default.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'max-w': [{ 'max-w': ['content', 'login-card', 'modal', 'modal-wide', 'modal-history'] }],
      'max-h': [{ 'max-h': ['dialog'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
