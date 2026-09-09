/**
 * 유저 메시지 (RAVVIT_SPEC §B-2). 우측 정렬 + 배경 채운 말풍선.
 * 발신자 라벨·아바타는 두지 않는다 — 정렬과 배경만으로 구분한다.
 */
export function UserMessageItem({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-full whitespace-pre-wrap break-words rounded-lg bg-hover px-3 py-2 text-body text-foreground">
        {content}
      </p>
    </div>
  );
}
