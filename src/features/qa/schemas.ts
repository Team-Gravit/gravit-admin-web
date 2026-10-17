import { z } from 'zod';

/**
 * QA(gravit-qa) 응답·폼 스키마 (decisions D9, QA_SPEC A-1·A-2).
 * 별도 서비스라 백오피스 공통 래퍼(PaginatedResponse)를 쓰지 않는다 — 목록은 배열 그대로(D9-2).
 * datetime 은 `+09:00` 오프셋 ISO 8601, 날짜만 있는 값은 `yyyy-MM-dd` 문자열로 받는다.
 */

// ---------- enum (A-1) ----------
export const sprintStatusSchema = z.enum([
  'DRAFT',
  'PREPARING',
  'PREPARE_FAILED',
  'REVIEW',
  'IN_PROGRESS',
  'CLOSED',
]);
export const partSchema = z.enum(['SERVER', 'WEB', 'APP']);
export const sprintStageSchema = z.enum(['PREPARE', 'REVIEW', 'CHECK', 'CLOSE', 'DONE']);
export const repoSchema = z.enum(['gravit-server', 'gravit-web', 'gravit-aos']);

// ---------- 스프린트 (A-2) ----------
export const partProgressSchema = z.object({
  part: partSchema,
  /** 해당 없음 제외 셀 수 */
  total: z.number(),
  pass: z.number(),
  fail: z.number(),
  unchecked: z.number(),
  notApplicable: z.number(),
});

/**
 * 화면 안내. 서버는 코드만 주고 문구는 프론트(QA_SPEC F절)가 관리한다.
 * nextAction·blocker code 는 모르는 값이 와도 파싱이 깨지지 않게 문자열로 받고, 매핑에 없으면 숨긴다(F-1).
 */
export const guideBlockerSchema = z.object({
  code: z.string(),
  count: z.number().nullable(),
  part: partSchema.nullable(),
});

export const sprintGuideSchema = z.object({
  stage: sprintStageSchema,
  stageIndex: z.number(),
  stageCount: z.number(),
  nextAction: z.string(),
  blockers: z.array(guideBlockerSchema),
});

export const baselineRepoSchema = z.object({
  repo: repoSchema,
  branch: z.string(),
  commitSha: z.string(),
  /** null 이면 직전 기준점 없음(전체 범위) */
  previousCommitSha: z.string().nullable(),
  compareUrl: z.string().nullable(),
  aosVersionCode: z.number().nullable(),
  aosVersionName: z.string().nullable(),
  versionCodeWarning: z.boolean(),
});

export const baselineSchema = z.object({
  id: z.number(),
  previousBaselineId: z.number().nullable(),
  createdAt: z.string(),
  repos: z.array(baselineRepoSchema),
});

export const sprintSummarySchema = z.object({
  id: z.number(),
  /** Notion 스프린트 이름 (예 `3rd Agile`) */
  sprintKey: z.string(),
  periodStart: z.string().nullable(),
  periodEnd: z.string().nullable(),
  status: sprintStatusSchema,
  progress: z.array(partProgressSchema),
  guide: sprintGuideSchema,
});

export const sprintListResponseSchema = z.array(sprintSummarySchema);

export const sprintSchema = sprintSummarySchema.extend({
  notionPageId: z.string(),
  figmaFileKey: z.string().nullable(),
  baseline: baselineSchema.nullable(),
  latestSetupJobId: z.number().nullable(),
  preparedAt: z.string().nullable(),
  confirmedAt: z.string().nullable(),
  closedAt: z.string().nullable(),
  createdAt: z.string(),
  /** 등록한 운영자 adminId */
  createdBy: z.number(),
  /** 낙관적 잠금 값 (D9-2) */
  version: z.number(),
});

// ---------- 작업 (A-2 #5~#7) ----------
export const jobStatusSchema = z.enum(['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED']);
export const stepStatusSchema = z.enum(['PENDING', 'RUNNING', 'DONE', 'FAILED', 'SKIPPED']);

export const jobStepSchema = z.object({
  seq: z.number(),
  /** BASELINE·NOTION·…·APPLY. 모르는 이름이면 원문 표시(A-1). */
  name: z.string(),
  status: stepStatusSchema,
  message: z.string().nullable(),
  startedAt: z.string().nullable(),
  finishedAt: z.string().nullable(),
});

export const jobSchema = z.object({
  id: z.number(),
  /** SETUP 등 */
  type: z.string(),
  sprintId: z.number().nullable(),
  status: jobStatusSchema,
  attempt: z.number(),
  maxAttempts: z.number(),
  /** 재시도 대기 시각 */
  nextRunAt: z.string().nullable(),
  cancelRequested: z.boolean(),
  lastError: z.string().nullable(),
  steps: z.array(jobStepSchema),
  createdAt: z.string(),
  finishedAt: z.string().nullable(),
});

// ---------- 체크리스트 (A-2 #8~#13) ----------
export const cellStateSchema = z.enum(['UNCHECKED', 'PASS', 'FAIL', 'NOT_APPLICABLE']);
export const cellSourceSchema = z.enum(['MANUAL', 'AUTO']);
export const classificationSchema = z.enum(['AUTO', 'MANUAL']);
export const reviewStateSchema = z.enum(['PROPOSED', 'CONFIRMED', 'REJECTED']);
export const itemOriginSchema = z.enum(['LLM', 'HUMAN']);
export const specStatusSchema = z.enum(['DRAFT', 'NEEDS_CHECK', 'CONFIRMED']);

export const checkCellSchema = z.object({
  itemId: z.number(),
  part: partSchema,
  state: cellStateSchema,
  source: cellSourceSchema,
  autoRunId: z.number().nullable(),
  editable: z.boolean(),
  /** adminId */
  updatedBy: z.number().nullable(),
  updatedAt: z.string().nullable(),
  version: z.number(),
});

/** 셀 변경 이력 (A-2 #13) — 최신순. changedBy 가 null 이면 자동 실행. */
export const checkCellHistorySchema = z.object({
  fromState: cellStateSchema,
  toState: cellStateSchema,
  source: cellSourceSchema,
  changedBy: z.number().nullable(),
  autoRunId: z.number().nullable(),
  changedAt: z.string(),
});

export const checkCellHistoryListSchema = z.array(checkCellHistorySchema);

const criterionSchema = z.object({ met: z.boolean(), reason: z.string() });

/** 분류 기준 5개 (A-1). */
export const classificationCriteriaSchema = z.object({
  specDecidable: criterionSchema,
  preconditionReproducible: criterionSchema,
  observable: criterionSchema,
  noExternalDependency: criterionSchema,
  notSubjective: criterionSchema,
});

export const checklistItemSchema = z.object({
  id: z.number(),
  featureId: z.number(),
  title: z.string(),
  expected: z.string(),
  parts: z.array(partSchema),
  classification: classificationSchema,
  criteria: classificationCriteriaSchema.nullable(),
  automationGap: z.boolean(),
  testRef: z.string().nullable(),
  personaKey: z.string().nullable(),
  sourceRefs: z.array(z.number()),
  origin: itemOriginSchema,
  reviewState: reviewStateSchema,
  cells: z.array(checkCellSchema),
  version: z.number(),
});

export const featureSchema = z.object({
  id: z.number(),
  /** 예 `LRN-02`, 한글 포함 가능 예 `UP-학습` */
  screenId: z.string(),
  name: z.string(),
  route: z.string().nullable(),
  parts: z.array(partSchema),
  specStatus: specStatusSchema,
  notionUrl: z.string().nullable(),
  figmaNodeIds: z.array(z.string()),
});

/**
 * 경고 (decisions D9-5, QA_SPEC G2 — 사용자 결정 2026-10-17: 두 형태 모두 받는다).
 * 서버 C4 브랜치는 경고 코드 문자열, QA_SPEC A-2 는 `ReportWarning{code, message, screenId}`.
 * 어느 쪽이 와도 `{ code, message, screenId }` 로 맞춘다. 서버가 확정되면 다른 쪽 분기를 걷어낸다.
 */
export interface ChecklistWarning {
  code: string;
  /** 서버 문구. 코드 문자열로 왔으면 null. */
  message: string | null;
  screenId: string | null;
}

const reportWarningSchema = z.object({
  code: z.string(),
  message: z.string(),
  screenId: z.string().nullable(),
});

export const checklistWarningSchema = z.union([
  z.string().transform((code): ChecklistWarning => ({ code, message: null, screenId: null })),
  reportWarningSchema.transform(
    ({ code, message, screenId }): ChecklistWarning => ({ code, message, screenId }),
  ),
]);

export const checklistFeatureSchema = z.object({
  feature: featureSchema,
  warnings: z.array(checklistWarningSchema),
  items: z.array(checklistItemSchema),
});

export const checklistSchema = z.object({
  sprintId: z.number(),
  sprintStatus: sprintStatusSchema,
  features: z.array(checklistFeatureSchema),
});

/** 확정 응답 — autoRun 은 이번 범위에서 값을 쓰지 않고 존재만 허용한다(A-2). */
export const checklistConfirmResponseSchema = z.object({
  sprint: sprintSchema,
  autoRun: z.unknown().nullable(),
});

// ---------- 폼 ----------
/** 스프린트 등록 (A-2 #2 `{ notionPageUrl: string(uri) }`). */
export const sprintCreateFormSchema = z.object({
  notionPageUrl: z
    .string()
    .trim()
    .min(1, 'Notion 스프린트 페이지 URL을 입력하세요.')
    .url('URL 형식이 올바르지 않습니다.'),
});

/** 페르소나 Select 의 '없음' 값(Radix Select 는 빈 문자열 값을 쓸 수 없다). 전송 시 null. */
export const PERSONA_NONE = 'NONE';

/**
 * 체크 항목 추가·수정 폼 (A-2 #9·#10, QA_SPEC B-3).
 * 자동 분류는 테스트 ID 를 입력해야 저장할 수 있다. 파트는 1개 이상(기능의 parts 밖 파트는 화면이 막는다).
 */
export const checklistItemFormSchema = z
  .object({
    title: z.string().trim().min(1, '제목을 입력하세요.'),
    expected: z.string().trim().min(1, '기대 결과를 입력하세요.'),
    parts: z.array(partSchema).min(1, '파트를 1개 이상 선택하세요.'),
    classification: classificationSchema,
    testRef: z.string().trim(),
    personaKey: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.classification === 'AUTO' && v.testRef.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['testRef'],
        message: '자동 분류는 테스트 ID를 입력해야 합니다.',
      });
    }
  });

export type SprintStatus = z.infer<typeof sprintStatusSchema>;
export type Part = z.infer<typeof partSchema>;
export type SprintStage = z.infer<typeof sprintStageSchema>;
export type Repo = z.infer<typeof repoSchema>;
export type PartProgress = z.infer<typeof partProgressSchema>;
export type GuideBlocker = z.infer<typeof guideBlockerSchema>;
export type SprintGuide = z.infer<typeof sprintGuideSchema>;
export type BaselineRepo = z.infer<typeof baselineRepoSchema>;
export type Baseline = z.infer<typeof baselineSchema>;
export type SprintSummary = z.infer<typeof sprintSummarySchema>;
export type Sprint = z.infer<typeof sprintSchema>;
export type SprintCreateFormValues = z.infer<typeof sprintCreateFormSchema>;
export type JobStatus = z.infer<typeof jobStatusSchema>;
export type StepStatus = z.infer<typeof stepStatusSchema>;
export type JobStep = z.infer<typeof jobStepSchema>;
export type Job = z.infer<typeof jobSchema>;
export type CellState = z.infer<typeof cellStateSchema>;
export type CellSource = z.infer<typeof cellSourceSchema>;
export type Classification = z.infer<typeof classificationSchema>;
export type ReviewState = z.infer<typeof reviewStateSchema>;
export type ItemOrigin = z.infer<typeof itemOriginSchema>;
export type SpecStatus = z.infer<typeof specStatusSchema>;
export type CheckCell = z.infer<typeof checkCellSchema>;
export type CheckCellHistory = z.infer<typeof checkCellHistorySchema>;
export type ClassificationCriteria = z.infer<typeof classificationCriteriaSchema>;
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type Feature = z.infer<typeof featureSchema>;
export type ChecklistFeature = z.infer<typeof checklistFeatureSchema>;
export type Checklist = z.infer<typeof checklistSchema>;
export type ChecklistConfirmResponse = z.infer<typeof checklistConfirmResponseSchema>;
export type ChecklistItemFormValues = z.infer<typeof checklistItemFormSchema>;
