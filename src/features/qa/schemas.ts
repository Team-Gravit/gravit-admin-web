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

// ---------- 폼 ----------
/** 스프린트 등록 (A-2 #2 `{ notionPageUrl: string(uri) }`). */
export const sprintCreateFormSchema = z.object({
  notionPageUrl: z
    .string()
    .trim()
    .min(1, 'Notion 스프린트 페이지 URL을 입력하세요.')
    .url('URL 형식이 올바르지 않습니다.'),
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
