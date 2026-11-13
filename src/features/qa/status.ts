import { CircleAlert, CircleCheck, Minus, CircleX, LoaderCircle, Lock } from 'lucide-react';
import type { CellState, Reflection, SetupStep } from '@/features/qa/schemas';

export const QA_STATUS_CATEGORIES = {
  success: {
    icon: CircleCheck,
    label: '성공',
    description: '완료 · 연결됨 · 반영 완료 · Pass',
    color: 'bg-success-bg text-success-text',
  },
  failure: {
    icon: CircleX,
    label: '실패',
    description: '실패 · Fail',
    color: 'bg-danger-bg text-danger-text',
  },
  action: {
    icon: CircleAlert,
    label: '사람 조치 필요',
    description: '승인 대기',
    color: 'bg-warning-bg text-warning-text',
  },
  running: {
    icon: LoaderCircle,
    label: '진행 중',
    description: '실행 중 · 실행 예약 · 반영 중',
    color: 'bg-primary-badge text-primary',
  },
  pending: {
    icon: Minus,
    label: '대기·미검수',
    description: '대기 · 미검수 · 확인 전',
    color: 'bg-muted-ds-bg text-muted-ds-text',
  },
  excluded: {
    icon: Lock,
    label: '제외',
    description: '해당 없음 · 거절 · 취소 · 건너뜀',
    color: 'bg-muted-ds-bg text-muted-ds-text',
  },
} as const;
export type QaStatusCategory = keyof typeof QA_STATUS_CATEGORIES;
export const CELL_CATEGORIES: Record<CellState, QaStatusCategory> = {
  PASS: 'success',
  FAIL: 'failure',
  UNCHECKED: 'pending',
  NOT_APPLICABLE: 'excluded',
};
export const SETUP_CATEGORIES: Record<SetupStep['status'], QaStatusCategory> = {
  DONE: 'success',
  FAILED: 'failure',
  WAITING: 'action',
  RUNNING: 'running',
  PENDING: 'pending',
};
export const REFLECTION_CATEGORIES: Record<Reflection['state'], QaStatusCategory> = {
  APPLIED: 'success',
  FAILED: 'failure',
  PENDING: 'action',
  APPROVED: 'running',
  REJECTED: 'excluded',
};
