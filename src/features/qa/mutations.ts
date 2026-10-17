import {
  useIsMutating,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { showErrorToast } from '@/shared/api/errorHandler';
import { QaApiError } from '@/shared/api/qaClient';
import {
  cancelJob,
  closeSprint,
  confirmChecklist,
  createChecklistItem,
  createSprint,
  startSetupJob,
  updateCheckCell,
  updateChecklistItem,
  type ChecklistItemCreateBody,
  type ChecklistItemUpdateBody,
} from '@/features/qa/api';
import { qaKeys } from '@/features/qa/queries';
import { ERROR_COPY, TOAST_COPY } from '@/features/qa/copy';
import type {
  CellState,
  CheckCell,
  Checklist,
  ChecklistItem,
  Job,
  Part,
  Sprint,
} from '@/features/qa/schemas';

/**
 * 스프린트 등록. 404·409·400 은 모달 입력 아래에 표시하므로(QA_SPEC A-3) 전역 토스트를 끈다 —
 * 그 밖의 상태는 화면이 토스트로 알린다.
 */
export function useCreateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notionPageUrl: string) => createSprint(notionPageUrl),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (sprint: Sprint) => {
      queryClient.setQueryData(qaKeys.sprint(sprint.id), sprint);
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprintLists() });
    },
  });
}

const startSetupKey = (sprintId: number) => ['qa', 'startSetupJob', sprintId] as const;

/**
 * QA 준비하기 (A-2 #5). 공통 상단 배너에서도 호출되고 그 직후 화면이 바뀌어 호출한 컴포넌트가
 * 언마운트될 수 있으므로, 캐시 갱신·토스트는 훅 수준 콜백에 둔다.
 * 받은 Job 을 캐시에 넣고 스프린트의 latestSetupJobId 를 그 작업으로 가리켜 곧바로 polling 을 시작한다.
 * 409(실행 중 작업 있음·상태 불가)는 스프린트를 다시 조회한다(A-3). 오류 문구는 전역 토스트.
 */
export function useStartSetupJob(sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: startSetupKey(sprintId),
    mutationFn: () => startSetupJob(sprintId),
    onSuccess: (job: Job) => {
      queryClient.setQueryData(qaKeys.job(job.id), job);
      queryClient.setQueryData<Sprint>(qaKeys.sprint(sprintId), (prev) =>
        prev ? { ...prev, latestSetupJobId: job.id } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprintLists() });
      toast.success(TOAST_COPY.SETUP_STARTED);
    },
    onError: (error) => {
      if (error instanceof QaApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
      }
    },
  });
}

/** 배너와 준비 화면의 시작 버튼이 서로의 진행 중 상태를 보도록 — 두 번 눌러 409 가 나지 않게 한다. */
export function useIsStartingSetupJob(sprintId: number): boolean {
  return useIsMutating({ mutationKey: startSetupKey(sprintId) }) > 0;
}

/** 작업 취소 (A-2 #7). 409 = 이미 끝난 작업 → 작업을 다시 조회한다(A-3). */
export function useCancelJob(jobId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelJob(jobId),
    onSuccess: (job: Job) => {
      queryClient.setQueryData(qaKeys.job(job.id), job);
      toast.success(TOAST_COPY.JOB_CANCEL_REQUESTED);
    },
    onError: (error) => {
      if (error instanceof QaApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: qaKeys.job(jobId) });
      }
    },
  });
}

// ---------- 체크 항목 (A-2 #9~#11) ----------

/** 응답 항목으로 캐시의 그 항목만 바꾼다 — 새 version 을 들고 있어야 다음 변경이 409 가 되지 않는다(D9-2). */
function withItem(checklist: Checklist | undefined, item: ChecklistItem): Checklist | undefined {
  if (!checklist) return checklist;
  return {
    ...checklist,
    features: checklist.features.map((f) =>
      f.feature.id !== item.featureId
        ? f
        : {
            ...f,
            items: f.items.some((i) => i.id === item.id)
              ? f.items.map((i) => (i.id === item.id ? item : i))
              : [...f.items, item],
          },
    ),
  };
}

function applyItem(queryClient: QueryClient, sprintId: number, item: ChecklistItem) {
  queryClient.setQueryData<Checklist>(qaKeys.checklist(sprintId), (prev) => withItem(prev, item));
  // 검토 전 개수·다음 할 일이 바뀐다
  void queryClient.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
  void queryClient.invalidateQueries({ queryKey: qaKeys.sprintLists() });
}

/**
 * 항목 변경 실패 공통 처리 (A-3 #9·#10). 409(version 불일치·REVIEW 아님) → 체크리스트·스프린트를 다시 조회하고
 * F-5 STALE. 422(자동 분류 불가)는 호출한 화면이 입력 아래 등에 표시하므로 여기서 알리지 않는다.
 * 그 밖은 오류 토스트(재발급 실패로 이미 안내한 경우 제외).
 */
export function handleItemMutationError(
  queryClient: QueryClient,
  sprintId: number,
  error: unknown,
): void {
  if (error instanceof QaApiError) {
    if (error.sessionEnded || error.status === 422) return;
    if (error.status === 409) {
      void queryClient.invalidateQueries({ queryKey: qaKeys.checklist(sprintId) });
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
      toast.error(ERROR_COPY.STALE);
      return;
    }
  }
  showErrorToast(error);
}

export function useUpdateChecklistItem(sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: number; body: ChecklistItemUpdateBody }) =>
      updateChecklistItem(itemId, body),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (item) => applyItem(queryClient, sprintId, item),
    onError: (error) => handleItemMutationError(queryClient, sprintId, error),
  });
}

export function useCreateChecklistItem(sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ChecklistItemCreateBody) => createChecklistItem(sprintId, body),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (item) => applyItem(queryClient, sprintId, item),
    onError: (error) => handleItemMutationError(queryClient, sprintId, error),
  });
}

/**
 * 기능 단위 "이 기능 항목 모두 확정" (QA_SPEC 결정 #8). API 가 항목 단위라 PATCH 를 **순차** 호출하고,
 * 하나라도 실패하면 거기서 멈춘다. 매번 캐시의 최신 version 으로 보낸다. onProgress 로 {i}/{n} 을 알린다.
 */
export function useConfirmFeatureItems(sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemIds,
      onProgress,
    }: {
      itemIds: number[];
      onProgress: (done: number) => void;
    }) => {
      for (const [index, itemId] of itemIds.entries()) {
        const current = queryClient
          .getQueryData<Checklist>(qaKeys.checklist(sprintId))
          ?.features.flatMap((f) => f.items)
          .find((i) => i.id === itemId);
        if (!current || current.reviewState !== 'PROPOSED') continue;
        const item = await updateChecklistItem(itemId, {
          reviewState: 'CONFIRMED',
          version: current.version,
        });
        queryClient.setQueryData<Checklist>(qaKeys.checklist(sprintId), (prev) =>
          withItem(prev, item),
        );
        onProgress(index + 1);
      }
    },
    meta: { skipGlobalErrorToast: true },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprintLists() });
    },
    onError: (error) => handleItemMutationError(queryClient, sprintId, error),
  });
}

/**
 * 체크리스트 확정 (A-2 #11). 성공 → 응답 sprint 로 캐시 갱신, 체크리스트 다시 조회, F-6 토스트.
 * 409(검토 전 남음·version 불일치) → 스프린트·체크리스트 다시 조회(A-3). 오류 문구는 전역 토스트.
 */
export function useConfirmChecklist(sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { startAutoRun?: boolean; version: number }) =>
      confirmChecklist(sprintId, body),
    onSuccess: ({ sprint }) => {
      queryClient.setQueryData(qaKeys.sprint(sprintId), sprint);
      void queryClient.invalidateQueries({ queryKey: qaKeys.checklist(sprintId) });
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprintLists() });
      toast.success(TOAST_COPY.CHECKLIST_CONFIRMED);
    },
    onError: (error) => {
      if (error instanceof QaApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
        void queryClient.invalidateQueries({ queryKey: qaKeys.checklist(sprintId) });
      }
    },
  });
}

// ---------- 체크 셀·스프린트 종료 (A-2 #12·#4) ----------

/** 응답 셀로 그 셀만 바꾼다 (결정 #10 — 낙관적 갱신 없음). */
function withCell(checklist: Checklist | undefined, cell: CheckCell): Checklist | undefined {
  if (!checklist) return checklist;
  return {
    ...checklist,
    features: checklist.features.map((f) => ({
      ...f,
      items: f.items.map((i) =>
        i.id !== cell.itemId
          ? i
          : { ...i, cells: i.cells.map((c) => (c.part === cell.part ? cell : c)) },
      ),
    })),
  };
}

/**
 * 셀 상태 변경 (A-2 #12, QA_SPEC B-4·결정 #10). 셀마다 이 훅을 써서 요청 중 스피너가 그 셀에만 돈다.
 * 성공 → 응답 셀로 그 셀만 갱신 + 스프린트 무효화(진행률·안내) + 그 셀 이력 무효화.
 * 409 → STALE + 체크리스트 다시 조회. 422(자동 판정·해당 없음 셀 — 정상 흐름에서는 없음) → 다시 조회 + 오류 토스트.
 */
export function useUpdateCheckCell(sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      part,
      state,
      version,
    }: {
      itemId: number;
      part: Part;
      state: Exclude<CellState, 'NOT_APPLICABLE'>;
      version: number;
    }) => updateCheckCell(itemId, part, { state, version }),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (cell) => {
      queryClient.setQueryData<Checklist>(qaKeys.checklist(sprintId), (prev) =>
        withCell(prev, cell),
      );
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprintLists() });
      void queryClient.invalidateQueries({ queryKey: qaKeys.cellHistory(cell.itemId, cell.part) });
    },
    onError: (error) => {
      if (error instanceof QaApiError && error.status === 422) {
        void queryClient.invalidateQueries({ queryKey: qaKeys.checklist(sprintId) });
        showErrorToast(error);
        return;
      }
      handleItemMutationError(queryClient, sprintId, error);
    },
  });
}

/**
 * 스프린트 종료 (A-2 #4). 성공 → 응답 sprint 로 캐시 갱신, 체크리스트 다시 조회(셀 읽기 전용), F-6 토스트.
 * 409 → 스프린트를 다시 조회해 guide.blockers 가 막힌 이유를 보여 주게 한다(A-3). 오류 문구는 전역 토스트.
 */
export function useCloseSprint(sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (version: number) => closeSprint(sprintId, version),
    onSuccess: (sprint) => {
      queryClient.setQueryData(qaKeys.sprint(sprintId), sprint);
      void queryClient.invalidateQueries({ queryKey: qaKeys.checklist(sprintId) });
      void queryClient.invalidateQueries({ queryKey: qaKeys.sprintLists() });
      toast.success(TOAST_COPY.SPRINT_CLOSED);
    },
    onError: (error) => {
      if (error instanceof QaApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: qaKeys.sprint(sprintId) });
      }
    },
  });
}
