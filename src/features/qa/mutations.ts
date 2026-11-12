import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { showErrorToast } from '@/shared/api/errorHandler';
import { QaApiError } from '@/shared/api/qaClient';
import * as api from '@/features/qa/api';
import { qaKeys } from '@/features/qa/queries';
import { ERROR_COPY, NOTICE_COPY, TOAST_COPY } from '@/features/qa/copy';
import type {
  CellState,
  Checklist,
  DesignReview,
  ManualCellState,
  Part,
  Reflection,
  Round,
} from '@/features/qa/schemas';

/** All aggregate rates come back from the server; never recompute progress in the UI. */
export function refreshSprint(client: QueryClient, id: number) {
  return Promise.all([
    client.invalidateQueries({ queryKey: qaKeys.sprint(id) }),
    client.invalidateQueries({ queryKey: qaKeys.sprintLists() }),
    client.invalidateQueries({ queryKey: qaKeys.checklists(id) }),
    client.invalidateQueries({ queryKey: qaKeys.design(id) }),
    client.invalidateQueries({ queryKey: qaKeys.reflections(id) }),
  ]);
}
function mutationError(client: QueryClient, id: number, error: unknown) {
  if (error instanceof QaApiError && error.sessionEnded) return;
  if (error instanceof QaApiError && error.status === 409) {
    void refreshSprint(client, id);
    if (error.code === 'GLOBAL_4091') return toast.error(ERROR_COPY.STALE);
    if (error.code === 'REFLECTION_4091')
      return toast.error(`${error.message} ${NOTICE_COPY.REFLECTION_CHANGED}`);
  }
  showErrorToast(error);
}
const meta = { skipGlobalErrorToast: true };
export function useCreateSprint() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.createSprint,
    meta,
    onSuccess: (sprint) => {
      client.setQueryData(qaKeys.sprint(sprint.id), sprint);
      void client.invalidateQueries({ queryKey: qaKeys.sprintLists() });
    },
  });
}
export function useStartSetupJob(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (version: number) => api.startSetupJob(id, version),
    meta,
    onSuccess: async ({ jobId }) => {
      // Start returns only an ID. Fetch the existing JobResponse instead of inventing fields.
      await refreshSprint(client, id);
      void client.invalidateQueries({ queryKey: qaKeys.job(jobId) });
      toast.success(TOAST_COPY.SETUP_STARTED);
    },
    onError: (error) => mutationError(client, id, error),
  });
}
export function useCancelJob(sprintId: number, jobId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.cancelJob(jobId),
    meta,
    onSuccess: async (job) => {
      client.setQueryData(qaKeys.job(job.id), job);
      await refreshSprint(client, sprintId);
      toast.success(TOAST_COPY.JOB_CANCEL_REQUESTED);
    },
    onError: (error) => mutationError(client, sprintId, error),
  });
}
export function useReflectionDecision(sprintId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      version,
    }: {
      id: number;
      action: 'approve' | 'reject';
      version: number;
    }) => api.decideReflection(id, action, version),
    meta,
    onSuccess: (item) => {
      client.setQueryData<Reflection[]>(qaKeys.reflections(sprintId), (prev) =>
        prev?.map((r) => (r.id === item.id ? item : r)),
      );
    },
    onError: (error) => mutationError(client, sprintId, error),
    // 502 persists FAILED + a new version in the DB, so refetch on failures as well (P6).
    onSettled: () => refreshSprint(client, sprintId),
  });
}
export function useCreateChecklistItem(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: api.ChecklistItemCreateBody) => api.createChecklistItem(id, body),
    meta,
    onSuccess: async () => {
      await refreshSprint(client, id);
      toast.success(TOAST_COPY.ITEM_CREATED);
    },
    onError: (error) => mutationError(client, id, error),
  });
}
export function useUpdateChecklistItem(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: number; body: api.ChecklistItemUpdateBody }) =>
      api.updateChecklistItem(itemId, body),
    meta,
    onSuccess: async (item) => {
      await refreshSprint(client, id);
      void client.invalidateQueries({ queryKey: ['qa', 'cellHistory', item.id] });
      toast.success(TOAST_COPY.ITEM_UPDATED);
    },
    onError: (error) => mutationError(client, id, error),
  });
}
export function useDeleteChecklistItem(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, version }: { itemId: number; version: number }) =>
      api.deleteChecklistItem(itemId, version),
    meta,
    onSuccess: async () => {
      await refreshSprint(client, id);
      toast.success(TOAST_COPY.ITEM_DELETED);
    },
    onError: (error) => mutationError(client, id, error),
  });
}
export function useUpdateCheckCell(id: number, round: Round) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      part,
      state,
      version,
    }: {
      itemId: number;
      part: Part;
      state: ManualCellState;
      version: number;
    }) => api.updateCheckCell(itemId, part, state, version),
    meta,
    onSuccess: async (cell, { itemId, part }) => {
      client.setQueryData<Checklist>(
        qaKeys.checklist(id, round),
        (prev) =>
          prev && {
            ...prev,
            features: prev.features.map((f) => ({
              ...f,
              items: f.items.map((i) =>
                i.id !== itemId
                  ? i
                  : { ...i, cells: i.cells.map((c) => (c.part === part ? cell : c)) },
              ),
            })),
          },
      );
      await refreshSprint(client, id);
      void client.invalidateQueries({ queryKey: qaKeys.cellHistory(itemId, part) });
    },
    onError: (error) => mutationError(client, id, error),
  });
}
export function useUpdateDesignItem(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      state,
      version,
    }: {
      itemId: number;
      state: CellState;
      version: number;
    }) => api.updateDesignItem(itemId, state, version),
    meta,
    onSuccess: async (item) => {
      client.setQueryData<DesignReview>(
        qaKeys.design(id),
        (prev) =>
          prev && {
            ...prev,
            features: prev.features.map((f) => ({
              ...f,
              items: f.items.map((i) => (i.id === item.id ? item : i)),
            })),
          },
      );
      await refreshSprint(client, id);
      void client.invalidateQueries({ queryKey: qaKeys.designHistory(item.id) });
    },
    onError: (error) => mutationError(client, id, error),
  });
}
export function useCloseSprint(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (version: number) => api.closeSprint(id, version),
    meta,
    onSuccess: async (sprint) => {
      client.setQueryData(qaKeys.sprint(id), sprint);
      await refreshSprint(client, id);
      toast.success(TOAST_COPY.SPRINT_CLOSED);
    },
    onError: (error) => mutationError(client, id, error),
  });
}
export function useEditDesignItem(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: number; body: api.DesignItemUpdateBody }) =>
      api.editDesignItem(itemId, body),
    meta,
    onSuccess: async (item) => {
      await refreshSprint(client, id);
      void client.invalidateQueries({ queryKey: qaKeys.designHistory(item.id) });
      toast.success(TOAST_COPY.ITEM_UPDATED);
    },
    onError: (error) => mutationError(client, id, error),
  });
}
export function useDeleteDesignItem(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, version }: { itemId: number; version: number }) =>
      api.deleteDesignItem(itemId, version),
    meta,
    onSuccess: async () => {
      await refreshSprint(client, id);
      toast.success(TOAST_COPY.ITEM_DELETED);
    },
    onError: (error) => mutationError(client, id, error),
  });
}
