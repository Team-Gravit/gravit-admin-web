import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSprint } from '@/features/qa/api';
import { qaKeys } from '@/features/qa/queries';
import type { Sprint } from '@/features/qa/schemas';

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
