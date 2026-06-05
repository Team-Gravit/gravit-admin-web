/**
 * 401 reissue 단일 비행 큐 (04 §6-4).
 * reissue(=POST /auth/refresh) 가 진행 중일 때 도착하는 다른 401 요청은 여기서 대기하다가,
 * 재발급 완료 시 새 accessToken(또는 실패 시 null)을 일괄 전달받는다.
 * (axios 호출은 client.ts 가 소유 — 순환 의존 회피용 순수 큐.)
 */
type Waiter = (token: string | null) => void;

let isReissuing = false;
let waiters: Waiter[] = [];

export const reissueQueue = {
  get isReissuing(): boolean {
    return isReissuing;
  },
  begin(): void {
    isReissuing = true;
  },
  end(): void {
    isReissuing = false;
  },
  /** 재발급 완료까지 대기. 성공 시 새 accessToken, 실패 시 null 수신. */
  subscribe(): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      waiters.push(resolve);
    });
  },
  /** 대기 중인 요청들에 결과를 일괄 전달. */
  publish(token: string | null): void {
    const current = waiters;
    waiters = [];
    current.forEach((resolve) => resolve(token));
  },
};
