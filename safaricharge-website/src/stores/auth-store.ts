import { create } from 'zustand';

export type UserRole = 'DRIVER' | 'ADMIN' | 'FLEET_MANAGER' | 'EMPLOYEE';
export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatar: string | null;
  phone: string | null;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry: string | null;
  hasPaidAccess: boolean;
  accessPermissions: string[];
  securityLevel?: string | null;
  isEmailVerified?: boolean;
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  initialize: () => Promise<void>;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'loading',

  async initialize() {
    if (typeof window === 'undefined') {
      return;
    }

    if (get().status === 'authenticated' && get().user) {
      return;
    }

    set({ status: 'loading' });

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        set({ user: null, status: 'unauthenticated' });
        return;
      }

      const responseData = await response.json();
      set({ user: responseData.user as User, status: 'authenticated' });
    } catch {
      set({ user: null, status: 'unauthenticated' });
    }
  },

  login(user) {
    set({ user, status: 'authenticated' });
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      set({ user: null, status: 'unauthenticated' });
    }
  },

  updateUser(userData) {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },

  clear() {
    set({ user: null, status: 'unauthenticated' });
  },
}));

export const useUser = () => useAuthStore((state) => state.user);
export const useAuthStatus = () => useAuthStore((state) => state.status);
export const useIsAuthenticated = () => useAuthStore((state) => state.status === 'authenticated');
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useSubscriptionPlan = () => useAuthStore((state) => state.user?.subscriptionPlan);

export const useIsAdmin = () => {
  const role = useUserRole();
  return role === 'ADMIN';
};

export const useHasPaidAccess = () => {
  const user = useUser();
  if (user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') {
    return true;
  }

  return user?.hasPaidAccess || user?.subscriptionPlan === 'PREMIUM' || user?.subscriptionPlan === 'ENTERPRISE';
};

export const useCanAccessBattery = () => {
  const user = useUser();
  if (user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') {
    return true;
  }

  return user?.subscriptionPlan === 'PREMIUM';
};

export const useCanAccessAnalytics = () => {
  const user = useUser();
  return user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';
};

export const useIsEmployee = () => {
  const role = useUserRole();
  return role === 'EMPLOYEE';
};

export const useCanAccessFleet = () => {
  const user = useUser();
  return user?.role === 'ADMIN' || user?.role === 'FLEET_MANAGER' || user?.role === 'EMPLOYEE';
};

export const useCanAccessUserManagement = () => {
  const user = useUser();
  return user?.role === 'ADMIN';
};

export const useCanAccessEmployeeApproval = () => {
  const user = useUser();
  return user?.role === 'ADMIN';
};

export const useIsFleetManager = () => {
  const role = useUserRole();
  return role === 'FLEET_MANAGER';
};

export const useCanManageFleet = () => {
  const role = useUserRole();
  return role === 'FLEET_MANAGER';
};

export const useCanViewAllFleets = () => {
  const user = useUser();
  return user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';
};
