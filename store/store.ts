"use client";

import { create } from "zustand";
import { signIn, signOut, getSession } from "next-auth/react";
import { showSuccess, showError, showInfo } from "@/lib/toast";
import { UserRoles } from "@/lib/types";

interface User {
  id: string;
  name: string; // Changed from fullname to match NextAuth
  username: string; // Fixed typo from userame
  email: string;
  profilePic: string;
  token?: string;
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
  loginWithGoogle: () => Promise<{ success: boolean }>;
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
        const user: User = {
          id: (session.user as any).id || session.user.email || "",
          name: session.user.name || "",
          username: (session.user as any).username || "",
          email: session.user.email || "",
          profilePic:
            (session.user as any).profilePic ||
            session.user.image ||
            "/api/placeholder/100/100",
          roles: (session.user as any).roles || ["User"],
        };

        set({
          auth: {
            user,
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
      console.error("Session load error:", error);
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
      // Determine provider based on environment
      const isDevelopment = process.env.NODE_ENV === "development";
      showInfo(isDevelopment ? 'True' : 'False')
      const provider = isDevelopment ? "mock" : "backend";

      const result = await signIn(provider, {
        username,
        password,
        redirect: false,
        callbackUrl: returnUrl || "/dashboard",
      });

      if (result?.error) {
        const errorMessage =
          result.error === "CredentialsSignin"
            ? "Invalid username or password"
            : `Login failed: ${result.error}`;

        showError(errorMessage);
        set({ error: errorMessage, isLoading: false });
        return { success: false };
      } else if (result?.ok) {
        showSuccess(`Welcome back, ${username}!`);
        await get().loadSession();
        return { success: true };
      } else {
        showError("Login failed - please try again");
        set({ error: "Login failed", isLoading: false });
        return { success: false };
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Login failed due to an unexpected error");
      set({ error: "Login failed", isLoading: false });
      return { success: false };
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        showError(`Google login failed: ${result.error}`);
        set({ error: result.error, isLoading: false });
        return { success: false };
      } else if (result?.ok) {
        showSuccess("Successfully signed in with Google!");
        await get().loadSession();
        return { success: true };
      } else {
        showError("Google login failed - please try again");
        set({ error: "Google login failed", isLoading: false });
        return { success: false };
      }
    } catch (error) {
      console.error("Google login error:", error);
      showError("Google login failed due to an unexpected error");
      set({ error: "Google login failed", isLoading: false });
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
      console.error("Logout error:", error);
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
