import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * shadcn/ui sonner Toaster (라이트 모드 전용 — next-themes 미사용).
 * 우상단, 3초 자동 dismiss (04 §9-3). 헤더(56px) + 로그아웃 버튼과 겹치지 않게 top offset 으로 헤더 아래 배치.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      offset={{ top: 72 }}
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
