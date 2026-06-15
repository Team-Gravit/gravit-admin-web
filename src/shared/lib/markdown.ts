import remarkGfm from 'remark-gfm';

/**
 * 마크다운 렌더 공용 설정 (04 §9-10, D6).
 * GFM 지원. HTML 렌더링은 허용 안 함(XSS 방지) — react-markdown 기본값 유지.
 * 사용처: shared/components/markdown (MarkdownViewer·MarkdownEditor — 공지/문제 본문).
 */
export const remarkPlugins = [remarkGfm];
