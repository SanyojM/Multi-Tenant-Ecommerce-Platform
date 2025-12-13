import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Store {
  id: string;
  name: string;
  logoUrl: string | null;
  isActive: boolean;
  domain?: string | null;
  domainStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: 'SUPER_ADMIN' | 'STORE_OWNER';
  storeId: string | null;
  store: Store | null;
}

interface AdminAuthState {
  admin: AdminUser | null;
  selectedStoreId: string | null;
  isAuthenticated: boolean;
  login: (admin: AdminUser) => void;
  logout: () => void;
  setSelectedStore: (storeId: string) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      selectedStoreId: null,
      isAuthenticated: false,

      login: (admin) => set({ 
        admin, 
        isAuthenticated: true,
        // For store owners, auto-select their store
        selectedStoreId: admin.role === 'STORE_OWNER' ? admin.storeId : null,
      }),

      logout: () => set({ 
        admin: null, 
        selectedStoreId: null,
        isAuthenticated: false 
      }),

      setSelectedStore: (storeId) => set({ selectedStoreId: storeId }),
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);
