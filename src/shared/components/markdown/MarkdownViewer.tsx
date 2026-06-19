import { remarkPlugins } from '@/shared/lib/markdown';
import ReactMarkdown from 'react-markdown';

export function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={remarkPlugins}>{content}</ReactMarkdown>
    </div>
  );
}
