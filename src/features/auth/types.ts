export type ProviderId = 'GOOGLE' | 'KAKAO' | 'NAVER';

export type Role = 'ADMIN' | 'USER';

export interface AdminProfile {
  adminId: number;
  nickname: string;
  email: string;
  profileImgNumber: number;
}

export interface AuthState {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  setAdmin: (admin: AdminProfile) => void;
  reset: () => void;
}
