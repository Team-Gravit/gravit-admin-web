import remarkGfm from 'remark-gfm';

/**
 * 공지 본문 마크다운 렌더 공용 설정 (04 §9-10).
 * GFM 지원. HTML 렌더링은 허용 안 함(XSS 방지) — react-markdown 기본값 유지.
 * 사용처: features/notices/components/NoticeMarkdownViewer (Step 4).
 */
export const remarkPlugins = [remarkGfm];
