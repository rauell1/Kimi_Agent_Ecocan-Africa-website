'use client';
import { create } from "zustand";

export type AppRole = "admin" | "coordinator" | "field_officer" | "viewer";

interface AuthState {
  user: { id: string; email: string; displayName?: string; role?: string } | null;
  roles: AppRole[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  signOut: () => void;
  setUser: (user: { id: string; email: string; displayName?: string; role?: string } | null, roles?: AppRole[]) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  roles: [],
  loading: false,
  hasRole: (role) => get().roles.includes(role),
  hasAnyRole: (rs) => rs.some((r) => get().roles.includes(r)),
  signOut: () => set({ user: null, roles: [] }),
  setUser: (user, roles) => {
    const resolvedRoles = roles && roles.length > 0
      ? roles
      : user
        ? [user.role as AppRole ?? "viewer"]
        : [];
    set({ user, roles: resolvedRoles, loading: false });
  },
}));
