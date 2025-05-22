"use client";

import { create } from "zustand";
import { signIn, signOut, getSession } from "next-auth/react";
import { showSuccess, showError, showInfo } from "@/lib/toast";
import { UserRoles } from "@/lib/types";

interface User {
  id: string;
  fullname: string;
  userame: string;
  email: string;
  profilePic: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AppState {
  auth: AuthState;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadSession: () => Promise<void>;
  login: (
    username: string,
    password: string,
    returnUrl?: string
  ) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
  hasRole: (role: UserRoles) => boolean;
  setHydrated: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  auth: { user: null, isAuthenticated: false },
  isLoading: true, // Start with loading true
  error: null,
  isHydrated: false,

  setHydrated: () => set({ isHydrated: true }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => {
    if (error) {
      showError(error);
    }
    set({ error });
  },

  loadSession: async () => {
    set({ isLoading: true });
    try {
      const session = await getSession();
      if (session?.user) {
        set({
          auth: {
            user: session.user as User,
            isAuthenticated: true,
          },
          isLoading: false,
        });
      } else {
        set({
          auth: { user: null, isAuthenticated: false },
          isLoading: false,
        });
      }
    } catch (error) {
      showError("Failed to load session");
      set({
        error: "Failed to load session",
        isLoading: false,
        auth: { user: null, isAuthenticated: false },
      });
    }
  },

  login: async (username, password, returnUrl) => {
    set({ isLoading: true, error: null });
    try {
      const provider =
        process.env.NODE_ENV === "development" ? "mock" : "backend";

      const result = await signIn(provider, {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        showError(`Login failed: ${result.error}`);
        set({ error: result.error, isLoading: false });
        return { success: false };
      } else {
        showSuccess(`Welcome back, ${username}!`);
        await get().loadSession();
        return { success: true };
      }
    } catch (error) {
      showError("Login failed due to an unexpected error");
      set({ error: "Login failed", isLoading: false });
      return { success: false };
    }
  },

  logout: async () => {
    try {
      await signOut({ redirect: false });
      set({
        auth: { user: null, isAuthenticated: false },
        error: null,
      });
      showInfo("You have been logged out");
    } catch (error) {
      showError("Logout failed");
      set({ error: "Logout failed" });
    }
  },

  hasRole: (role: UserRoles) => {
    const { user } = get().auth;
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set({
      auth: { user: null, isAuthenticated: false },
      isLoading: false,
      error: null,
    });
  },
}));
