import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * DS-01 디자인 토큰 정의 (값 권위: spec/DS-01 §1~4).
 * - 색 값(HSL 트리플)은 globals.css 의 CSS 변수에 정의되고, 여기서 hsl(var(--x)) 로 참조한다.
 * - 이 파일은 token-lint allow 대상이므로 토큰 정의가 허용된다.
 * - DS-01 토큰명 ↔ Tailwind 클래스 **명명 매핑의 권위 = .claude/rules/ui-conventions.md**
 *   ('text-primary' 가 shadcn primary(브랜드 보라)와 충돌하는 등 매핑·주의는 거기서 확인. 여기 중복 금지.)
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // shadcn/ui 시맨틱 토큰
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          // 포인트 배경 (DS-01 1-1: 8% / 12% opacity)
          subtle: 'hsl(var(--primary) / 0.08)',
          badge: 'hsl(var(--primary) / 0.12)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // DS-01 1-2 중립 표면
        surface: 'hsl(var(--surface))',
        page: 'hsl(var(--page))',
        hover: 'hsl(var(--hover))',

        // DS-01 1-2 중립 텍스트 스케일 (text-primary=foreground 와 충돌 회피용 fg 네임스페이스)
        fg: {
          DEFAULT: 'hsl(var(--foreground))',
          secondary: 'hsl(var(--fg-secondary))',
          muted: 'hsl(var(--muted-foreground))',
          disabled: 'hsl(var(--fg-disabled))',
        },

        // DS-01 1-3 시맨틱(의미별) text/bg 쌍
        success: { text: 'hsl(var(--success-text))', bg: 'hsl(var(--success-bg))' },
        warning: { text: 'hsl(var(--warning-text))', bg: 'hsl(var(--warning-bg))' },
        danger: { text: 'hsl(var(--danger-text))', bg: 'hsl(var(--danger-bg))' },
        info: { text: 'hsl(var(--info-text))', bg: 'hsl(var(--info-bg))' },
        // DS accent(주관식)/muted(DRAFT 등) — shadcn accent/muted 와 구분 위해 -ds 접미
        'accent-ds': { text: 'hsl(var(--accent-ds-text))', bg: 'hsl(var(--accent-ds-bg))' },
        'muted-ds': { text: 'hsl(var(--muted-ds-text))', bg: 'hsl(var(--muted-ds-bg))' },
      },
      borderRadius: {
        // shadcn 표준: --radius(8px)=card, -2px(6px)=button/input
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        // DS-01 4: 활성 메뉴 좌측 3px (변경 입력 좌측 4px 는 기본 border-4)
        '3': '3px',
      },
      spacing: {
        // DS-01 3: 레이아웃 고정 치수 (arbitrary px 회피)
        sidebar: '240px',
        header: '56px',
      },
      width: {
        sidebar: '240px',
      },
      height: {
        header: '56px',
      },
      maxWidth: {
        content: '1200px',
        'login-card': '400px',
        modal: '400px',
        'modal-wide': '480px',
      },
      minWidth: {
        viewport: '1280px',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // DS-01 2: 타이포 토큰
        display: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h1: ['24px', { lineHeight: '32px', fontWeight: '700' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h3: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
};

export default config;
