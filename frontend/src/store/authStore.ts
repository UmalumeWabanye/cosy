import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  university: string;
  fundingType: string;
  verifiedStudent?: boolean;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, isAuthenticated: false, token: null }),
    }),
    {
      name: 'auth-store',
    }
  )
);