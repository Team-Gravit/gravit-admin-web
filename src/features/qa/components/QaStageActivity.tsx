import { LoaderCircle } from 'lucide-react';
import { QaNotice } from '@/features/qa/components/QaNotice';
export function QaStageActivity({ children }: { children: string }) {
  return (
    <QaNotice>
      <span role="status" className="flex items-center gap-2">
        <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        {children}
      </span>
    </QaNotice>
  );
}
