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
  livingPreference?: 'individual' | 'shared' | 'noPreference';
  city?: string;
  province?: string;
  propertyType?: string;
  numberOfProperties?: string;
  isVerified?: boolean;
  profileComplete?: boolean;
  notificationPreferences?: {
    emailApplicationUpdates?: boolean;
    emailAllocationUpdates?: boolean;
    emailMoveInReminders?: boolean;
    emailLandlordAlerts?: boolean;
    emailNewListings?: boolean;
    pushApplicationUpdates?: boolean;
    pushMessages?: boolean;
    pushAllocationUpdates?: boolean;
  };
  studentOnboarding?: {
    completed?: boolean;
    budgetMin?: number | null;
    budgetMax?: number | null;
    campus?: string;
    commutePreference?: 'walk' | 'shuttle' | 'any';
    moveInDate?: string | null;
    roomPreference?: 'Single' | 'Sharing' | 'Ensuite' | 'Bachelor' | 'Any';
  };
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
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('showLandlordWizard');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
