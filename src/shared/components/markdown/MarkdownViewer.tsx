import ReactMarkdown from 'react-markdown';
import { remarkPlugins } from '@/shared/lib/markdown';

/**
 * 마크다운 뷰어 (공용, 04 §9-10). 공지 본문·문제 본문 렌더에 사용.
 * GFM 지원, raw HTML 비허용(react-markdown 기본값 = XSS 안전).
 */
export function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={remarkPlugins}>{content}</ReactMarkdown>
    </div>
  );
}
