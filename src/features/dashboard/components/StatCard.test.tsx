import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Users } from 'lucide-react';
import { renderWithProviders } from '@/test/render';
import { StatCard } from '@/features/dashboard/components/StatCard';

describe('StatCard', () => {
  it('전달된 라벨과 수치를 읽고 지정된 관리 화면으로 연결해요', () => {
    renderWithProviders(
      <MemoryRouter><StatCard label="원문_CODE" value={12345} linkLabel="유저 관리" to="/users" icon={Users} /></MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /원문_CODE/ });
    expect(link).toHaveAttribute('href', '/users');
    expect(link).toHaveTextContent('12,345');
    expect(link).toHaveTextContent('유저 관리 →');
  });
  it('0도 빈 상태로 바꾸지 않고 수치로 표시해요', () => {
    renderWithProviders(
      <MemoryRouter><StatCard label="미해결 신고" value={0} linkLabel="신고 관리" to="/reports" icon={Users} /></MemoryRouter>,
    );
    expect(screen.getByText('0')).toBeVisible();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/reports');
  });
});
