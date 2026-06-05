/** 입력 하단 에러 메시지 (04 §9-2): 12px, text-destructive. */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-caption text-destructive">{message}</p>;
}
