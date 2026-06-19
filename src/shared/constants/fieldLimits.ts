/**
 * 글자 수 제한 (04 §9-5). ⚠️ 클라이언트 UX 보호용 — 백엔드 DB 제약과 향후 동기화 필요.
 */
export const FIELD_LIMITS = {
  notice: {
    title: 100,
    summary: 200,
    content: 10000,
  },
  chapter: {
    title: 100,
    description: 500,
  },
  unit: {
    title: 100,
    description: 500,
  },
  lesson: {
    title: 100,
  },
  problem: {
    instruction: 500,
    content: 2000,
  },
  option: {
    content: 200,
    explanation: 1000,
  },
  answer: {
    content: 500,
    explanation: 1000,
  },
} as const;
