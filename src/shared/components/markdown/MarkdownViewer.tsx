import { remarkPlugins } from '@/shared/lib/markdown';
import ReactMarkdown, { type Components } from 'react-markdown';

/**
 * 'chat' variant (RAVVIT_SPEC §A-2 Data):
 * - 링크를 새 탭으로 연다. 같은 탭으로 이동하면 관리자 페이지를 떠나 대화가 소실된다.
 * - 코드·표가 좁은 대화 컬럼을 넘칠 때 **블록 내부에서** 가로 스크롤한다(컬럼 밖 넘침 금지).
 * 기본값 'default' 라 공지·문제 본문의 렌더 결과는 그대로다.
 */
const chatComponents: Components = {
  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
  pre: ({ node: _node, ...props }) => (
    <div className="overflow-x-auto">
      <pre {...props} />
    </div>
  ),
  table: ({ node: _node, ...props }) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
};

interface MarkdownViewerProps {
  content: string;
  variant?: 'default' | 'chat';
}

export function MarkdownViewer({ content, variant = 'default' }: MarkdownViewerProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        components={variant === 'chat' ? chatComponents : undefined}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
