import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student' | 'landlord';
  phone?: string;
  whatsapp?: string;
  university?: string;
  course?: string;
  yearOfStudy?: string;
  fundingType?: string;
  avatar?: string;
  idNumber?: string;
  city?: string;
  province?: string;
  propertyType?: string;
  numberOfProperties?: string;
  isVerified?: boolean;
  profileComplete?: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
