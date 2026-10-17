/** Notion 페이지 ID 에서 하이픈을 뺀 공개 URL (QA_SPEC B-1). */
export function notionPageUrl(notionPageId: string): string {
  return `https://www.notion.so/${notionPageId.replace(/-/g, '')}`;
}

/** Figma 노드 링크 — node-id 의 ':' 를 '-' 로 (QA_SPEC B-3). */
export function figmaNodeUrl(fileKey: string, nodeId: string): string {
  return `https://www.figma.com/design/${fileKey}?node-id=${nodeId.replace(/:/g, '-')}`;
}
