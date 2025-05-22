"use client";

import { create } from "zustand";
import { signIn, signOut, getSession } from "next-auth/react";
import { showSuccess, showError, showInfo } from "@/lib/toast";
import { UserRoles } from "@/lib/types";
import { console } from "node:inspector";
import { getNodeEnv } from "@/app/api/_services/env.service";



interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
}

interface AppState {
  auth: AuthState;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  homeData: any | null;
  fetchHomeData: () => Promise<void>;
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
  isLoading: false, // ← Changed to false by default
  error: null,
  isHydrated: false,
  homeData: null,

  fetchHomeData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/home-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add auth headers if needed
          ...(get().auth.isAuthenticated && {
            Authorization: `Bearer ${get().auth.user?.token}`,
          }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      set({
        homeData: data,
        isLoading: false,
      });

      console.log("[Store] Home data fetched successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch data";
      console.error("[Store] Failed to fetch home data:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
        homeData: null,
      });
    }
  },

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
            user: session.user as any,
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

    const nodeEnv = await getNodeEnv();
    try {
      const provider =
        nodeEnv === "development" ? "mock" : "backend";

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
