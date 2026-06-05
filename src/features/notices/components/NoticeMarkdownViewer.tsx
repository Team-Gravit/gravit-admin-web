import ReactMarkdown from 'react-markdown';
import { remarkPlugins } from '@/shared/lib/markdown';

/** 공지 본문 마크다운 뷰어 (04 §9-10). GFM, HTML 비허용(XSS 방지, react-markdown 기본). */
export function NoticeMarkdownViewer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={remarkPlugins}>{content}</ReactMarkdown>
    </div>
  );
}
