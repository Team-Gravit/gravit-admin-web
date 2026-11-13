import { delay, http, HttpResponse } from 'msw';
import { z } from 'zod';
import { env } from '@/env';
import {
  buildFixture,
  checklistResponse,
  designResponse,
  progressOf,
  SCREENS,
  type QaFixture,
} from '@/mocks/qaChecklist';
import {
  checklistItemFormSchema,
  partSchema,
  progressPartSchema,
  verdictUpdateSchema,
  type ChecklistItem,
  type DesignItem,
  type Job,
  type FixReports,
  type Reflection,
  type Sprint,
  type SprintStatus,
} from '@/features/qa/schemas';

/** In-memory contract server. qaMock query selects isolated error scenarios; no real QA writes. */
const QA = env.VITE_QA_API_BASE;
const now = () => `${new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, -1)}+09:00`;
const scenario = () => new URLSearchParams(window.location.search).get('qaMock');
function compatibilityBody<T>(data: T): T {
  return scenario() === 'legacy'
    ? (JSON.parse(
        JSON.stringify(data, (key, value: unknown) => (key === 'evidence' ? undefined : value)),
      ) as T)
    : data;
}
const error = (status: number, code: string, message: string) =>
  HttpResponse.json({ error: code, message }, { status });
const conflict = () =>
  error(409, 'GLOBAL_4091', '다른 운영자가 먼저 변경했습니다. 다시 불러와 주세요.');
const invalidState = () => error(409, 'SPRINT_4092', '현재 상태에서는 요청을 처리할 수 없습니다.');
const KEYS = [
  'CONNECT',
  'SPEC_COLLECT',
  'CHECKLIST_GENERATE',
  'DESIGN_REVIEW',
  'AUTO_REVIEW',
] as const;
const versionBody = z.object({ version: z.number().int() });
const stateBody = verdictUpdateSchema;
function unchangedFail(
  current: Pick<DesignItem, 'state' | 'reason'>,
  update: z.infer<typeof stateBody>,
) {
  return (
    current.state === 'FAIL' &&
    update.state === 'FAIL' &&
    (scenario() === 'legacy' || !update.reason || update.reason === current.reason)
  );
}
interface RecordData {
  sprint: Sprint;
  fixture: QaFixture;
  reflections: Reflection[];
  notionId: string;
}
const records = new Map<number, RecordData>();
const jobs = new Map<number, { job: Job; step: number; waiting: boolean }>();
let nextSprintId = 11;
let nextJobId = 100;
let nextItemId = 900000;
const failedApproval = new Set<number>();

function newJob(sprintId: number, step: number, waiting = false): Job {
  const job: Job = {
    id: nextJobId++,
    type: step <= 1 ? 'SPEC_LOAD' : 'QA_PREPARE',
    sprintId,
    status: 'RUNNING',
    attempt: 1,
    maxAttempts: 4,
    nextRunAt: null,
    cancelRequested: false,
    lastError: null,
    createdAt: now(),
    finishedAt: null,
    steps: KEYS.map((name, i) => ({
      seq: i + 1,
      name,
      status: i < step ? 'DONE' : i === step ? 'RUNNING' : 'PENDING',
      message: null,
      startedAt: i <= step ? now() : null,
      finishedAt: i < step ? now() : null,
    })),
  };
  jobs.set(job.id, { job, step, waiting });
  return job;
}
function seed(id: number, status: SprintStatus, complete = false) {
  const fixture = buildFixture(id, complete);
  if (id === 2 && scenario() === 'auto-fail') {
    const item = fixture.design[0];
    if (item) {
      item.state = 'FAIL';
      item.reason = 'Figma의 버튼 배치와 명세가 다릅니다.';
      const history = fixture.designHistory.get(item.id)?.[0];
      if (history) Object.assign(history, { state: item.state, reason: item.reason });
    }
  }
  const ready = !['DRAFT', 'SPEC_LOAD', 'CHECKLIST'].includes(status);
  const sprint: Sprint = {
    id,
    sprintKey: `${id}th Agile`,
    summary:
      id === 7
        ? null
        : ({
            2: '로그인·공통 화면 수동 검수',
            6: '기능 명세 변경 반영 승인',
            8: '저장소 연결 실패',
            9: '모든 검수 완료',
          }[id] ?? 'QA 흐름 예시'),
    status,
    version: 0,
    connections:
      status === 'DRAFT'
        ? []
        : (['NOTION', 'FIGMA', 'SERVER', 'WEB', 'APP'] as const).map((target) => ({
            target,
            connected: id !== 8 || target !== 'APP',
            ref: ['NOTION', 'FIGMA'].includes(target) ? null : 'qa-baseline@abc1234',
            message: id === 8 && target === 'APP' ? 'qa-baseline 브랜치를 찾을 수 없습니다.' : null,
          })),
    progress: ready ? progressOf(fixture) : [],
    setupSteps:
      status === 'DRAFT'
        ? []
        : KEYS.map((key) => ({
            key,
            status: 'DONE',
            attempt: 1,
            message:
              key === 'SPEC_COLLECT'
                ? 'API 명세 일부가 없어 해당 항목은 수동 확인이 필요합니다.'
                : null,
          })),
    latestJob: null,
    pendingReflectionCount: 0,
  };
  const record: RecordData = {
    sprint,
    fixture,
    reflections: [],
    notionId: String(id).padStart(32, 'a'),
  };
  if (id === 6) {
    record.reflections = SCREENS.map((screen, n) => ({
      id: 600 + n,
      featureId: screen.featureId,
      screenId: screen.screenId,
      screenName: screen.screenName,
      historyRows: [{ sprint: '6th Agile', change: '오류 안내와 재시도 동작을 보완했습니다.' }],
      before: '### 오류 처리\n오류 안내를 표시합니다.',
      after: '### 오류 처리\n오류 안내를 표시하고 **다시 시도** 버튼을 제공합니다.',
      state: n === 0 ? 'PENDING' : 'FAILED',
      message: n === 1 ? 'Notion 본문 반영 중 연결이 끊겼습니다.' : null,
      version: 0,
    }));
    sprint.pendingReflectionCount = 2;
    sprint.setupSteps = KEYS.map((key, i) => ({
      key,
      status: i === 0 ? 'DONE' : i === 1 ? 'WAITING' : 'PENDING',
      attempt: i <= 1 ? 1 : 0,
      message: i === 1 ? '명세 수정 이력의 본문 반영 승인을 기다리고 있습니다.' : null,
    }));
    sprint.latestJob = newJob(id, 1, true);
    // SPEC_LOAD has finished while the server waits for human decisions.
    sprint.latestJob.status = 'SUCCEEDED';
    sprint.latestJob.finishedAt = now();
  } else if (id === 8) {
    const job = newJob(id, 0);
    job.status = 'FAILED';
    job.lastError = 'NonRetryableJobException: APP 저장소 qa-baseline 브랜치가 없습니다.';
    if (job.steps[0]) job.steps[0].status = 'FAILED';
    sprint.latestJob = job;
    sprint.setupSteps = KEYS.map((key, i) => ({
      key,
      status: i === 0 ? 'FAILED' : 'PENDING',
      attempt: i === 0 ? 1 : 0,
      message: i === 0 ? 'APP 저장소 qa-baseline 브랜치가 없습니다.' : null,
    }));
  } else if ([3, 4, 5].includes(id)) {
    const step = id === 3 ? 4 : id === 4 ? 3 : 2;
    sprint.latestJob = newJob(id, step);
    sprint.setupSteps = KEYS.map((key, i) => ({
      key,
      status: i < step ? 'DONE' : i === step ? 'RUNNING' : 'PENDING',
      attempt: i <= step ? 1 : 0,
      message: null,
    }));
  }
  records.set(id, record);
}
seed(1, 'CLOSED', true);
seed(2, 'MANUAL_REVIEW');
seed(3, 'AUTO_REVIEW');
seed(4, 'DESIGN_REVIEW');
seed(5, 'CHECKLIST');
seed(6, 'SPEC_LOAD');
seed(7, 'DRAFT');
seed(8, 'SPEC_LOAD');
seed(9, 'MANUAL_REVIEW', true);

function sync(record: RecordData) {
  record.sprint.pendingReflectionCount = record.reflections.filter((r) =>
    ['PENDING', 'FAILED'].includes(r.state),
  ).length;
  record.sprint.progress = ['DRAFT', 'SPEC_LOAD', 'CHECKLIST'].includes(record.sprint.status)
    ? []
    : progressOf(record.fixture);
}
function guard() {
  if (scenario() === '503') return error(503, 'AUTH_5031', '인증 서버에 연결할 수 없습니다.');
  if (scenario() === '403') return error(403, 'AUTH_4031', 'QA 메뉴를 사용할 권한이 없습니다.');
  return null;
}
function versionMismatch(current: number, requested: number) {
  return scenario() === 'stale' || current !== requested;
}
function findItem(id: number) {
  for (const record of records.values()) {
    const item = record.fixture.items.find((i) => i.id === id);
    if (item) return { record, item };
  }
}
function findDesign(id: number) {
  for (const record of records.values()) {
    const item = record.fixture.design.find((i) => i.id === id);
    if (item) return { record, item };
  }
}
function findReflection(id: number) {
  for (const record of records.values()) {
    const item = record.reflections.find((i) => i.id === id);
    if (item) return { record, item };
  }
}
function active(record: RecordData) {
  return ['QUEUED', 'RUNNING'].includes(record.sprint.latestJob?.status ?? '');
}
const missing = () => error(404, 'GLOBAL_4041', '대상을 찾을 수 없습니다.');
const badRequest = () => error(400, 'GLOBAL_4001', '요청 형식이 올바르지 않습니다.');

function fixReportsOf(record: RecordData): FixReports {
  const countUnchecked = (classification: 'AUTO' | 'MANUAL') =>
    record.fixture.items
      .filter((item) => item.classification === classification)
      .flatMap((item) => item.cells)
      .filter((cell) => cell.state === 'UNCHECKED').length;
  const unchecked = {
    design: record.fixture.design.filter((item) => item.state === 'UNCHECKED').length,
    first: countUnchecked('AUTO'),
    second: countUnchecked('MANUAL'),
  };
  return {
    sprintId: record.sprint.id,
    status: record.sprint.status,
    ready:
      ['MANUAL_REVIEW', 'CLOSED'].includes(record.sprint.status) &&
      !active(record) &&
      Object.values(unchecked).every((count) => count === 0),
    unchecked,
    parts: (['DESIGN', 'WEB', 'APP', 'SERVER'] as const).map((part) => ({
      part,
      failCount:
        part === 'DESIGN'
          ? record.fixture.design.filter((item) => item.state === 'FAIL').length
          : record.fixture.items
              .flatMap((item) => item.cells)
              .filter((cell) => cell.part === part && cell.state === 'FAIL').length,
      fileName: `${record.sprint.sprintKey}-${part}-수정사항.txt`,
    })),
  };
}

export const qaHandlers = [
  http.get(`${QA}/sprints/:id/fix-reports`, async ({ params }) => {
    const failure = guard();
    if (failure) return failure;
    if (scenario() === 'legacy') return missing();
    if (scenario() === 'fixes-loading') await delay(600);
    const record = records.get(Number(params.id));
    return record ? HttpResponse.json(fixReportsOf(record)) : missing();
  }),
  http.get(`${QA}/sprints/:id/fix-reports/:part`, ({ params }) => {
    const failure = guard();
    if (failure) return failure;
    if (scenario() === 'legacy' || scenario() === 'fixes-download-404') return missing();
    const record = records.get(Number(params.id));
    if (!record) return missing();
    const part = progressPartSchema.safeParse(params.part);
    if (!part.success) return badRequest();
    if (!fixReportsOf(record).ready || scenario() === 'fixes-download-conflict')
      return error(409, 'SPRINT_4093', '검수가 완료되지 않았습니다.');
    // Temporary transfer fixture: the server prompt's TXT example has not been supplied.
    // This is deliberately labelled as a mock, not an assertion of the server's TXT layout.
    const entries =
      part.data === 'DESIGN'
        ? record.fixture.design
            .filter((item) => item.state === 'FAIL')
            .map((item) => `${item.title}\n${item.reason ?? ''}`)
        : record.fixture.items.flatMap((item) =>
            item.cells
              .filter((cell) => cell.part === part.data && cell.state === 'FAIL')
              .map((cell) => `${item.title}\n${cell.reason ?? ''}`),
          );
    return new HttpResponse(
      [
        '임시 목 TXT — 서버 계약 예시 틀 확인 필요',
        `${record.sprint.sprintKey} / ${part.data}`,
        ...entries,
      ].join('\n\n'),
      {
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8',
          'Content-Disposition': 'attachment; filename="ignored-header.txt"',
        },
      },
    );
  }),
  http.get(`${QA}/sprints`, async () => {
    await delay(60);
    const failure = guard();
    if (failure) return failure;
    return HttpResponse.json(
      scenario() === 'empty'
        ? []
        : [...records.values()].reverse().map(({ sprint: s }) => ({
            id: s.id,
            sprintKey: s.sprintKey,
            summary: s.summary,
            status: s.status,
          })),
    );
  }),
  http.post(`${QA}/sprints`, async ({ request }) => {
    const failure = guard();
    if (failure) return failure;
    const parsed = z.object({ notionPageUrl: z.string().url() }).safeParse(await request.json());
    if (!parsed.success) return badRequest();
    const notionId = parsed.data.notionPageUrl.replace(/-/g, '').match(/[a-f0-9]{32}/i)?.[0];
    if (!notionId) return badRequest();
    if (notionId.startsWith('0000')) return missing();
    if ([...records.values()].some((r) => r.notionId === notionId))
      return error(409, 'SPRINT_4091', '이미 등록된 스프린트입니다.');
    const id = nextSprintId++;
    seed(id, 'DRAFT');
    const record = records.get(id)!;
    record.notionId = notionId;
    return HttpResponse.json(record.sprint, { status: 201 });
  }),
  http.get(`${QA}/sprints/:id`, async ({ params }) => {
    const failure = guard();
    if (failure) return failure;
    const record = records.get(Number(params.id));
    if (!record) return missing();
    sync(record);
    return HttpResponse.json(record.sprint);
  }),
  http.post(`${QA}/sprints/:id/setup-jobs`, async ({ params, request }) => {
    const failure = guard();
    if (failure) return failure;
    const record = records.get(Number(params.id));
    if (!record) return missing();
    const parsed = versionBody.safeParse(await request.json());
    if (!parsed.success) return badRequest();
    if (versionMismatch(record.sprint.version, parsed.data.version)) return conflict();
    if (scenario() === 'recollect-conflict') return invalidState();
    if (scenario() === 'recollect-error')
      return error(500, 'GLOBAL_5001', '준비 작업을 시작하지 못했습니다.');
    const recollect =
      record.sprint.pendingReflectionCount > 0 &&
      record.sprint.setupSteps.some((s) => s.status === 'WAITING');
    const retry = record.sprint.latestJob?.status === 'FAILED';
    if (
      record.sprint.status === 'CLOSED' ||
      (!recollect && (active(record) || (record.sprint.status !== 'DRAFT' && !retry)))
    )
      return invalidState();
    if (recollect) {
      record.reflections = record.reflections.filter(
        (r) => !['PENDING', 'FAILED'].includes(r.state),
      );
      const previous = record.sprint.latestJob;
      if (previous) {
        previous.status = 'CANCELLED';
        previous.finishedAt = now();
      }
    }
    const failedIndex = record.sprint.setupSteps.findIndex((s) => s.status === 'FAILED');
    const step = recollect ? 1 : retry && failedIndex >= 0 ? failedIndex : 0;
    const previousSteps = record.sprint.setupSteps;
    const job = newJob(record.sprint.id, step);
    job.status = 'QUEUED';
    job.attempt = 0;
    job.nextRunAt = now();
    record.sprint.latestJob = job;
    record.sprint.status =
      step <= 1
        ? 'SPEC_LOAD'
        : step === 2
          ? 'CHECKLIST'
          : step === 3
            ? 'DESIGN_REVIEW'
            : 'AUTO_REVIEW';
    record.sprint.version++;
    record.sprint.setupSteps = KEYS.map((key, i) => ({
      key,
      status: i < step ? 'DONE' : i === step ? 'RUNNING' : 'PENDING',
      attempt:
        i === step
          ? (previousSteps.find((s) => s.key === key)?.attempt ?? 0) + 1
          : i < step
            ? 1
            : 0,
      message: null,
    }));
    record.sprint.connections = (['NOTION', 'FIGMA', 'SERVER', 'WEB', 'APP'] as const).map(
      (target) => ({
        target,
        connected: true,
        ref: ['NOTION', 'FIGMA'].includes(target) ? null : 'qa-baseline@def5678',
        message: null,
      }),
    );
    sync(record);
    return HttpResponse.json({ jobId: job.id }, { status: 202 });
  }),
  http.get(`${QA}/jobs/:id`, async ({ params }) => {
    const failure = guard();
    if (failure) return failure;
    const entry = jobs.get(Number(params.id));
    if (!entry) return missing();
    const record = records.get(entry.job.sprintId ?? -1);
    if (record && !entry.waiting && ['QUEUED', 'RUNNING'].includes(entry.job.status)) {
      if (entry.job.status === 'QUEUED') {
        entry.job.status = 'RUNNING';
        entry.job.attempt++;
        entry.job.nextRunAt = null;
      } else {
        const jobStep = entry.job.steps[entry.step];
        const setupStep = record.sprint.setupSteps[entry.step];
        if (!jobStep || !setupStep) return invalidState();
        jobStep.status = 'DONE';
        jobStep.finishedAt = now();
        setupStep.status = 'DONE';
        if (entry.step === 1)
          setupStep.message = 'API 명세 일부가 없어 해당 항목은 수동 확인이 필요합니다.';
        entry.step++;
        const nextKey = KEYS[entry.step];
        if (!nextKey) {
          entry.job.status = 'SUCCEEDED';
          entry.job.finishedAt = now();
          record.sprint.status = 'MANUAL_REVIEW';
        } else {
          entry.job.type = entry.step <= 1 ? 'SPEC_LOAD' : 'QA_PREPARE';
          const nextJobStep = entry.job.steps[entry.step];
          if (nextJobStep) {
            nextJobStep.status = 'RUNNING';
            nextJobStep.startedAt = now();
          }
          record.sprint.setupSteps[entry.step] = {
            key: nextKey,
            status: 'RUNNING',
            attempt: 1,
            message: null,
          };
          record.sprint.status =
            entry.step <= 1
              ? 'SPEC_LOAD'
              : entry.step === 2
                ? 'CHECKLIST'
                : entry.step === 3
                  ? 'DESIGN_REVIEW'
                  : 'AUTO_REVIEW';
        }
        record.sprint.version++;
        sync(record);
      }
    }
    return HttpResponse.json(entry.job);
  }),
  http.post(`${QA}/jobs/:id/cancel`, ({ params }) => {
    const failure = guard();
    if (failure) return failure;
    const entry = jobs.get(Number(params.id));
    if (!entry) return missing();
    if (!['QUEUED', 'RUNNING'].includes(entry.job.status)) return invalidState();
    entry.job.cancelRequested = true;
    entry.job.status = 'CANCELLED';
    entry.job.finishedAt = now();
    const record = records.get(entry.job.sprintId ?? -1);
    if (record) {
      record.sprint.status = 'DRAFT';
      record.sprint.version++;
    }
    return HttpResponse.json(entry.job, { status: 202 });
  }),
  http.get(`${QA}/sprints/:id/reflections`, ({ params }) => {
    const failure = guard();
    if (failure) return failure;
    const record = records.get(Number(params.id));
    return record ? HttpResponse.json(record.reflections) : missing();
  }),
  ...(['approve', 'reject'] as const).map((action) =>
    http.post(`${QA}/reflections/:id/${action}`, async ({ params, request }) => {
      const failure = guard();
      if (failure) return failure;
      const found = findReflection(Number(params.id));
      if (!found) return missing();
      const { record, item } = found;
      const parsed = versionBody.safeParse(await request.json());
      if (!parsed.success) return badRequest();
      if (versionMismatch(item.version, parsed.data.version)) return conflict();
      if (!['PENDING', 'FAILED'].includes(item.state)) return invalidState();
      if (scenario() === 'reflection-changed' && action === 'approve')
        return error(409, 'REFLECTION_4091', '제안 이후 명세가 바뀌었습니다.');
      item.version++;
      if (
        action === 'approve' &&
        scenario() === 'reflection-fail' &&
        !failedApproval.has(item.id)
      ) {
        failedApproval.add(item.id);
        item.state = 'FAILED';
        item.message = 'Notion 본문 반영에 실패했습니다. 남은 작업부터 다시 시도할 수 있습니다.';
        sync(record);
        return error(502, 'REFLECTION_5021', item.message);
      }
      if (scenario() === 'reflection-delay') await delay(800);
      item.state = action === 'approve' ? 'APPLIED' : 'REJECTED';
      item.message = null;
      record.sprint.version++;
      sync(record);
      if (record.sprint.pendingReflectionCount === 0) {
        // SetupFacade.proceedAfterReflections enters QA_PREPARE in this request.
        const collected = record.sprint.setupSteps[1];
        if (collected) {
          collected.status = 'DONE';
          collected.message = '반영 제안 처리가 끝났습니다.';
        }
        const next = record.sprint.setupSteps[2];
        if (next) {
          next.status = 'RUNNING';
          next.attempt = 1;
        }
        const job = newJob(record.sprint.id, 2);
        job.status = 'QUEUED';
        job.attempt = 0;
        job.nextRunAt = now();
        record.sprint.latestJob = job;
        record.sprint.status = 'CHECKLIST';
      }
      return HttpResponse.json(item);
    }),
  ),
  http.get(`${QA}/sprints/:id/checklist`, ({ params, request }) => {
    const failure = guard();
    if (failure) return failure;
    const round = new URL(request.url).searchParams.get('round');
    if (round !== '1' && round !== '2') return badRequest();
    const record = records.get(Number(params.id));
    return record
      ? HttpResponse.json(
          ['DRAFT', 'SPEC_LOAD', 'CHECKLIST'].includes(record.sprint.status) &&
            scenario() !== 'pre-review-cells'
            ? { sprintId: record.sprint.id, sprintStatus: record.sprint.status, features: [] }
            : compatibilityBody(
                checklistResponse(
                  record.sprint.id,
                  record.sprint.status,
                  record.fixture,
                  round === '1' ? 1 : 2,
                ),
              ),
        )
      : missing();
  }),
  http.get(`${QA}/sprints/:id/design-review`, ({ params }) => {
    const failure = guard();
    if (failure) return failure;
    const record = records.get(Number(params.id));
    return record
      ? HttpResponse.json(
          ['DRAFT', 'SPEC_LOAD', 'CHECKLIST'].includes(record.sprint.status)
            ? { sprintId: record.sprint.id, sprintStatus: record.sprint.status, features: [] }
            : designResponse(record.sprint.id, record.sprint.status, record.fixture),
        )
      : missing();
  }),
  http.put(`${QA}/design-review-items/:id`, async ({ params, request }) => {
    const failure = guard();
    if (failure) return failure;
    if (scenario() === 'verdict-delay' || scenario() === 'verdict-fail') {
      await delay(800);
      if (scenario() === 'verdict-fail')
        return error(500, 'GLOBAL_5001', '판정을 저장하지 못했습니다. 다시 시도해 주세요.');
    }
    const found = findDesign(Number(params.id));
    if (!found) return missing();
    const { record, item } = found;
    const parsed = stateBody.safeParse(await request.json());
    if (!parsed.success) return badRequest();
    if (scenario() === 'legacy' && parsed.data.state === 'NOT_APPLICABLE') return badRequest();
    if (versionMismatch(item.version, parsed.data.version)) return conflict();
    if (record.sprint.status === 'CLOSED' || !item.editable) return invalidState();
    if (unchangedFail(item, parsed.data)) return HttpResponse.json(item);
    Object.assign(item, {
      state: parsed.data.state,
      source: 'MANUAL',
      reason:
        parsed.data.state === 'FAIL' && scenario() !== 'legacy' ? parsed.data.reason || null : null,
      version: item.version + 1,
    });
    record.fixture.designHistory.get(item.id)?.unshift({
      state: item.state,
      source: 'MANUAL',
      reason: item.reason,
      updatedBy: 1,
      updatedAt: now(),
    });
    sync(record);
    return HttpResponse.json(item);
  }),
  http.get(`${QA}/design-review-items/:id/history`, ({ params }) => {
    const failure = guard();
    if (failure) return failure;
    const found = findDesign(Number(params.id));
    return found
      ? HttpResponse.json(found.record.fixture.designHistory.get(found.item.id) ?? [])
      : missing();
  }),
  http.patch(`${QA}/design-review-items/:id`, async ({ params, request }) => {
    const failure = guard();
    if (failure) return failure;
    if (scenario() === 'legacy') return missing();
    const found = findDesign(Number(params.id));
    if (!found) return missing();
    const { record, item } = found;
    const parsed = versionBody
      .extend({
        title: z.string().trim().min(1).optional(),
        expected: z.string().trim().min(1).optional(),
      })
      .safeParse(await request.json());
    if (!parsed.success) return badRequest();
    if (versionMismatch(item.version, parsed.data.version)) return conflict();
    if (active(record) || record.sprint.status === 'CLOSED' || !item.editable)
      return invalidState();
    const title = parsed.data.title ?? item.title;
    const expected = parsed.data.expected ?? item.expected;
    if (title !== item.title || expected !== item.expected) {
      Object.assign(item, {
        title,
        expected,
        state: 'UNCHECKED',
        source: 'MANUAL',
        reason: null,
        version: item.version + 1,
      });
      const history = record.fixture.designHistory.get(item.id) ?? [];
      history.unshift({
        state: 'UNCHECKED',
        source: 'MANUAL',
        reason: '항목 수정으로 판정 초기화',
        updatedBy: 1,
        updatedAt: now(),
      });
      record.fixture.designHistory.set(item.id, history);
    }
    sync(record);
    return HttpResponse.json(item);
  }),
  http.delete(`${QA}/design-review-items/:id`, ({ params, request }) => {
    const failure = guard();
    if (failure) return failure;
    if (scenario() === 'legacy') return missing();
    const found = findDesign(Number(params.id));
    if (!found) return missing();
    const { record, item } = found;
    const version = new URL(request.url).searchParams.get('version');
    if (version === null || !/^\d+$/.test(version)) return badRequest();
    if (versionMismatch(item.version, Number(version))) return conflict();
    if (active(record) || record.sprint.status === 'CLOSED' || !item.editable)
      return invalidState();
    record.fixture.design = record.fixture.design.filter((entry) => entry.id !== item.id);
    sync(record);
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${QA}/sprints/:id/checklist-items`, async ({ params, request }) => {
    const failure = guard();
    if (failure) return failure;
    const record = records.get(Number(params.id));
    if (!record) return missing();
    if (active(record) || record.sprint.status === 'CLOSED') return invalidState();
    const parsed = checklistItemFormSchema
      .extend({ featureId: z.number(), classification: z.enum(['AUTO', 'MANUAL']).optional() })
      .safeParse(await request.json());
    if (!parsed.success) return badRequest();
    if (!SCREENS.some((s) => s.featureId === parsed.data.featureId)) return badRequest();
    const item: ChecklistItem = {
      ...parsed.data,
      classification: 'MANUAL',
      id: nextItemId++,
      origin: 'HUMAN',
      version: 0,
      cells: parsed.data.parts.map((part) => ({
        part,
        state: 'UNCHECKED',
        source: 'MANUAL',
        reason: null,
        evidence: [],
        editable: true,
        version: 0,
      })),
    };
    record.fixture.items.push(item);
    sync(record);
    return HttpResponse.json(item, { status: 201 });
  }),
  http.patch(`${QA}/checklist-items/:id`, async ({ params, request }) => {
    const failure = guard();
    if (failure) return failure;
    const found = findItem(Number(params.id));
    if (!found) return missing();
    const { record, item } = found;
    if (active(record) || record.sprint.status === 'CLOSED') return invalidState();
    const parsed = checklistItemFormSchema
      .partial()
      .extend({ version: z.number() })
      .safeParse(await request.json());
    if (!parsed.success) return badRequest();
    if (versionMismatch(item.version, parsed.data.version)) return conflict();
    if (
      parsed.data.classification !== undefined &&
      !(item.classification === 'AUTO' && parsed.data.classification === 'MANUAL')
    )
      return error(400, 'CHECKLIST_4001', '자동 항목을 수동으로 옮기는 것만 가능합니다.');
    const changes = checklistItemFormSchema.partial().parse(parsed.data);
    if (Object.keys(changes).length > 0) {
      Object.assign(item, changes);
      item.version++;
      item.cells = item.parts.map((part) => {
        const old = item.cells.find((c) => c.part === part);
        const key = `${item.id}:${part}`;
        const history = record.fixture.cellHistory.get(key) ?? [];
        history.unshift({
          fromState: old?.state ?? 'UNCHECKED',
          toState: 'UNCHECKED',
          source: 'MANUAL',
          changedBy: 1,
          changedAt: now(),
          reason: '항목 수정으로 판정 초기화',
          evidence: [],
        });
        record.fixture.cellHistory.set(key, history);
        return {
          part,
          state: 'UNCHECKED',
          source: 'MANUAL',
          reason: null,
          evidence: [],
          editable: true,
          version: (old?.version ?? -1) + 1,
        };
      });
    }
    sync(record);
    return HttpResponse.json(item);
  }),
  http.delete(`${QA}/checklist-items/:id`, ({ params, request }) => {
    const failure = guard();
    if (failure) return failure;
    const found = findItem(Number(params.id));
    if (!found) return missing();
    const { record, item } = found;
    const version = new URL(request.url).searchParams.get('version');
    if (version === null || !/^\d+$/.test(version)) return badRequest();
    if (versionMismatch(item.version, Number(version))) return conflict();
    if (active(record) || record.sprint.status === 'CLOSED') return invalidState();
    record.fixture.items = record.fixture.items.filter((i) => i.id !== item.id);
    sync(record);
    return new HttpResponse(null, { status: 204 });
  }),
  http.put(`${QA}/checklist-items/:id/cells/:part`, async ({ params, request }) => {
    const failure = guard();
    if (failure) return failure;
    if (scenario() === 'verdict-delay' || scenario() === 'verdict-fail') {
      await delay(800);
      if (scenario() === 'verdict-fail')
        return error(500, 'GLOBAL_5001', '판정을 저장하지 못했습니다. 다시 시도해 주세요.');
    }
    const found = findItem(Number(params.id));
    if (!found) return missing();
    const part = partSchema.safeParse(params.part);
    if (!part.success) return badRequest();
    const { record, item } = found;
    const cell = item.cells.find((c) => c.part === part.data);
    if (!cell) return missing();
    const parsed = stateBody.safeParse(await request.json());
    if (!parsed.success) return badRequest();
    if (parsed.data.state === 'NOT_APPLICABLE')
      return error(400, 'CHECKLIST_4001', '체크 셀을 해당 없음으로 변경할 수 없습니다.');
    if (versionMismatch(cell.version, parsed.data.version)) return conflict();
    if (record.sprint.status !== 'MANUAL_REVIEW' || !cell.editable) return invalidState();
    if (unchangedFail(cell, parsed.data)) return HttpResponse.json(compatibilityBody(cell));
    const key = `${item.id}:${cell.part}`;
    const history = record.fixture.cellHistory.get(key) ?? [];
    history.unshift({
      fromState: cell.state,
      toState: parsed.data.state,
      source: 'MANUAL',
      changedBy: 1,
      changedAt: now(),
      reason:
        parsed.data.state === 'FAIL' && scenario() !== 'legacy' ? parsed.data.reason || null : null,
      evidence: [],
    });
    record.fixture.cellHistory.set(key, history);
    Object.assign(cell, {
      state: parsed.data.state,
      source: 'MANUAL',
      reason:
        parsed.data.state === 'FAIL' && scenario() !== 'legacy' ? parsed.data.reason || null : null,
      evidence: [],
      version: cell.version + 1,
    });
    sync(record);
    return HttpResponse.json(compatibilityBody(cell));
  }),
  http.get(`${QA}/checklist-items/:id/cells/:part/history`, ({ params }) => {
    const failure = guard();
    if (failure) return failure;
    const found = findItem(Number(params.id));
    return found
      ? HttpResponse.json(
          compatibilityBody(
            found.record.fixture.cellHistory.get(`${params.id}:${params.part}`) ?? [],
          ),
        )
      : missing();
  }),
  http.post(`${QA}/sprints/:id/close`, async ({ params, request }) => {
    const failure = guard();
    if (failure) return failure;
    const record = records.get(Number(params.id));
    if (!record) return missing();
    const parsed = versionBody.safeParse(await request.json());
    if (!parsed.success) return badRequest();
    if (versionMismatch(record.sprint.version, parsed.data.version)) return conflict();
    if (record.sprint.status !== 'MANUAL_REVIEW' || active(record)) return invalidState();
    if (
      record.fixture.design.some((i: DesignItem) => i.state === 'UNCHECKED') ||
      record.fixture.items.some((i) => i.cells.some((c) => c.state === 'UNCHECKED'))
    )
      return error(409, 'SPRINT_4093', '디자인·1차·2차 목록에 미검수가 남아 있습니다.');
    record.sprint.status = 'CLOSED';
    record.sprint.version++;
    sync(record);
    return HttpResponse.json(record.sprint);
  }),
];
