import { expect, test } from '@playwright/test';
import {
  checkCellHistoryListSchema,
  checkCellSchema,
  designReviewSchema,
  jobSchema,
  fixReportsSchema,
  verdictUpdateSchema,
} from '../../../src/features/qa/schemas';

// qa-server dev(cddfc7e)의 응답 필드와 타입. 목 생성기와 독립된 계약 표본입니다.
const designReviewSample = {
  sprintId: 1,
  sprintStatus: 'MANUAL_REVIEW',
  features: [
    {
      featureId: 3,
      screenId: 'TEST-03',
      screenName: '[테스트] 프레임 없는 화면',
      changed: false,
      completionRate: 0,
      items: [
        {
          id: 15,
          featureId: 3,
          platform: 'WEB',
          title: 'WEB 시안 프레임이 없다',
          expected:
            'QA 페이지의 이번 스프린트 WEB Section에 이 화면 프레임이 없어 시안을 명세와 비교하지 못했습니다. 프레임을 확인한 뒤 사람이 판정한다 (TEST-03-C1, TEST-03-C2)',
          specRowIds: ['TEST-03-C1', 'TEST-03-C2'],
          state: 'UNCHECKED',
          source: 'AUTO',
          reason: 'Figma 프레임 없음',
          editable: true,
          version: 0,
        },
      ],
    },
  ],
};

test('서버 디자인 검수 표본의 문자열 명세 행 ID를 파싱한다', () => {
  const parsed = designReviewSchema.safeParse(designReviewSample);
  expect(parsed.success).toBe(true);
  if (parsed.success) expect(parsed.data).toEqual(designReviewSample);
});

test('서버 체크 셀 이력은 autoRunId 없이 1차 판정 사유를 파싱한다', () => {
  const history = [
    {
      fromState: 'UNCHECKED',
      toState: 'PASS',
      source: 'AUTO',
      reason: 'release 코드에서 명세에 해당하는 분기와 응답을 확인했습니다.',
      changedBy: null,
      changedAt: '2026-11-12T10:00:00+09:00',
    },
  ];
  const parsed = checkCellHistoryListSchema.safeParse(history);
  expect(parsed.success).toBe(true);
  if (parsed.success)
    expect(parsed.data).toEqual(history.map((entry) => ({ ...entry, evidence: [] })));
});

test('서버 작업 타입은 SPEC_LOAD와 QA_PREPARE만 허용한다', () => {
  const job = {
    id: 1,
    sprintId: 1,
    status: 'RUNNING',
    attempt: 1,
    maxAttempts: 4,
    nextRunAt: null,
    cancelRequested: false,
    lastError: null,
    steps: [],
    createdAt: '2026-11-12T10:00:00+09:00',
    finishedAt: null,
  };
  for (const type of ['SPEC_LOAD', 'QA_PREPARE']) {
    expect(jobSchema.safeParse({ ...job, type }).success).toBe(true);
  }
  expect(jobSchema.safeParse({ ...job, type: 'SETUP' }).success).toBe(false);
});

test('새 서버 셀과 이력은 구조화된 근거를 보존하고 옛 셀은 빈 근거로 파싱한다', () => {
  const evidence = [{ path: 'src/auth/login.ts', startLine: 12, endLine: 28 }];
  const oldCell = {
    part: 'WEB',
    state: 'PASS',
    source: 'AUTO',
    reason: '로그인 분기를 확인했습니다.',
    editable: true,
    version: 1,
  };
  expect(checkCellSchema.parse(oldCell).evidence).toEqual([]);
  expect(checkCellSchema.parse({ ...oldCell, evidence }).evidence).toEqual(evidence);
  const history = [
    {
      fromState: 'UNCHECKED',
      toState: 'PASS',
      source: 'AUTO',
      changedBy: null,
      changedAt: '2026-11-12T14:43:00+09:00',
      reason: oldCell.reason,
      evidence,
    },
  ];
  expect(checkCellHistoryListSchema.parse(history)[0]).toEqual(history[0]);
});

// G1/G3 user-supplied contracts; not a sample captured from a deployed server.
const fixReportsSample = {
  sprintId: 9,
  status: 'MANUAL_REVIEW',
  ready: true,
  unchecked: { design: 0, first: 0, second: 0 },
  parts: ['DESIGN', 'WEB', 'APP', 'SERVER'].map((part) => ({
    part,
    failCount: part === 'WEB' ? 2 : 0,
    fileName: `9-${part}.txt`,
  })),
};
test('G1 계약은 준비 전 빈 파트와 준비 완료 4개 파트를 파싱한다', () => {
  expect(fixReportsSchema.safeParse({ ...fixReportsSample, ready: false, parts: [] }).success).toBe(
    true,
  );
  expect(fixReportsSchema.parse(fixReportsSample).parts[1].failCount).toBe(2);
  expect(fixReportsSchema.safeParse({ ...fixReportsSample, parts: [] }).success).toBe(false);
  expect(
    fixReportsSchema.safeParse({
      ...fixReportsSample,
      unchecked: { design: -1, first: 0, second: 0 },
    }).success,
  ).toBe(false);
  expect(
    fixReportsSchema.safeParse({
      ...fixReportsSample,
      parts: Array(4).fill(fixReportsSample.parts[0]),
    }).success,
  ).toBe(false);
});
test('G3 선택 사유는 생략·빈 문자열·500자를 허용하고 초과를 거부한다', () => {
  for (const reason of [undefined, '', '가'.repeat(500)])
    expect(verdictUpdateSchema.safeParse({ state: 'FAIL', version: 0, reason }).success).toBe(true);
  expect(
    verdictUpdateSchema.safeParse({ state: 'FAIL', version: 0, reason: '가'.repeat(501) }).success,
  ).toBe(false);
  expect(
    verdictUpdateSchema.parse({ state: 'FAIL', version: 0, reason: ` \n${'가'.repeat(500)}\t ` })
      .reason,
  ).toBe('가'.repeat(500));
  expect(verdictUpdateSchema.parse({ state: 'FAIL', version: 0, reason: ' \n\t ' }).reason).toBe(
    '',
  );
  expect(
    verdictUpdateSchema.safeParse({ state: 'FAIL', version: 0, reason: '🙂'.repeat(250) }).success,
  ).toBe(true);
  expect(
    verdictUpdateSchema.safeParse({ state: 'FAIL', version: 0, reason: '🙂'.repeat(251) }).success,
  ).toBe(false);
});
