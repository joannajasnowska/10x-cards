import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import React from "react";

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Session management
  sessionExpiry: number | null;
  lastActivity: number;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateActivity: () => void;
  checkSessionExpiry: () => boolean;
  isSessionValid: () => boolean;

  // Auth actions
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;

  // Initialization
  initialize: () => Promise<void>;

  // Utilities
  reset: () => void;
}

// Default session duration: 1 hour (matching Supabase config)
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpiry: null,
      lastActivity: Date.now(),

      // State setters
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
          sessionExpiry: user ? Date.now() + SESSION_DURATION : null,
          lastActivity: Date.now(),
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      updateActivity: () => {
        const now = Date.now();
        set({ lastActivity: now });

        // Extend session if user is active
        const { user, sessionExpiry } = get();
        if (user && sessionExpiry) {
          set({ sessionExpiry: now + SESSION_DURATION });
        }
      },

      checkSessionExpiry: () => {
        const { sessionExpiry } = get();
        if (!sessionExpiry) return false;

        return Date.now() > sessionExpiry;
      },

      isSessionValid: () => {
        const { user, sessionExpiry } = get();
        if (!user || !sessionExpiry) return false;

        return Date.now() < sessionExpiry;
      },

      // Auth actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const formData = new FormData();
          formData.append("email", credentials.email);
          formData.append("password", credentials.password);

          const response = await fetch("/api/auth/login", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Login failed");
          }

          if (data.success && data.user) {
            // Login successful
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              sessionExpiry: new Date(data.sessionExpiry).getTime(),
              lastActivity: Date.now(),
            });
          } else {
            throw new Error("Invalid response from server");
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          // Call logout API
          const response = await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Logout failed");
          }

          // Clear state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            sessionExpiry: null,
            lastActivity: Date.now(),
          });

          // Redirect to login
          window.location.href = "/login";
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Logout failed",
          });
        }
      },

      refreshSession: async () => {
        try {
          // First try dedicated refresh endpoint
          const refreshResponse = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              // Token refreshed successfully, update session expiry
              set({
                sessionExpiry: new Date(refreshData.sessionExpiry).getTime(),
                lastActivity: Date.now(),
                error: null,
              });
              return;
            }
          }

          // Fallback to status check if refresh fails
          const response = await fetch("/api/auth/status");

          if (response.ok) {
            const data = await response.json();

            if (data.isAuthenticated && data.userEmail) {
              // Session is valid, extend session expiry
              const currentUser = get().user;
              if (currentUser) {
                set({
                  user: {
                    ...currentUser,
                    email: data.userEmail, // Update with fresh email from server
                  },
                  sessionExpiry: Date.now() + SESSION_DURATION,
                  lastActivity: Date.now(),
                  error: null,
                });
              } else {
                // Reconstruct user object if somehow missing
                const user: User = {
                  id: "",
                  email: data.userEmail,
                };
                set({
                  user,
                  isAuthenticated: true,
                  sessionExpiry: Date.now() + SESSION_DURATION,
                  lastActivity: Date.now(),
                  error: null,
                });
              }
            } else {
              // Session invalid, logout
              get().logout();
            }
          } else {
            // Session invalid, logout
            get().logout();
          }
        } catch {
          // console.error("Session refresh failed:", error);
          // Don't immediately logout on network errors, give user a chance
          set({
            error: "Połączenie z serwerem zostało utracone. Sprawdź połączenie internetowe.",
          });
        }
      },

      initialize: async () => {
        set({ isLoading: true });

        try {
          // Check if session is expired
          if (get().checkSessionExpiry()) {
            get().logout();
            return;
          }

          // Validate current session with server
          const response = await fetch("/api/auth/status");

          if (response.ok) {
            const data = await response.json();

            if (data.isAuthenticated && data.userEmail) {
              // Session is valid, update user data
              const user: User = {
                id: "", // We don't expose full user ID in status endpoint
                email: data.userEmail, // Use full email from server
              };

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                sessionExpiry: Date.now() + SESSION_DURATION,
                lastActivity: Date.now(),
              });
            } else {
              // No valid session
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                sessionExpiry: null,
              });
            }
          } else {
            throw new Error("Failed to check session status");
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : "Initialization failed",
            sessionExpiry: null,
          });
        }
      },

      reset: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          sessionExpiry: null,
          lastActivity: Date.now(),
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// Activity monitoring hook
export const useActivityMonitor = () => {
  const { updateActivity, checkSessionExpiry, logout, refreshSession, user } = useAuthStore();

  // Check session expiry and refresh tokens periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (user && checkSessionExpiry()) {
        // Try to refresh session before logging out
        refreshSession().catch(() => {
          logout();
        });
      }
    }, ACTIVITY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user, checkSessionExpiry, refreshSession, logout]);

  // Update activity on user interactions
  const handleActivity = React.useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  // Attach activity listeners
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const events = ["click", "keypress", "scroll", "mousemove"];

      events.forEach((event) => {
        window.addEventListener(event, handleActivity);
      });

      return () => {
        events.forEach((event) => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [handleActivity]);

  return { handleActivity };
};
