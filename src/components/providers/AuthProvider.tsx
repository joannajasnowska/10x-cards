import React, { useEffect, type ReactNode } from "react";
import { useAuthStore, type User } from "../../stores/authStore";

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  isSSR?: boolean;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialUser = null, isSSR = false }) => {
  const { initialize, setUser, user, isAuthenticated, isSessionValid } = useAuthStore();

  useEffect(() => {
    // On client-side mount, synchronize with server state
    if (!isSSR && typeof window !== "undefined") {
      if (initialUser && (!user || user.email !== initialUser.email)) {
        // Server says user is authenticated, sync with store
        setUser(initialUser);
      } else if (!initialUser && isAuthenticated && isSessionValid()) {
        // Server says no user, but store thinks user is authenticated with valid session
        // Initialize to validate session with server
        initialize();
      } else if (!initialUser && isAuthenticated && !isSessionValid()) {
        // Local session expired, initialize to refresh or logout
        initialize();
      } else if (!initialUser && !isAuthenticated) {
        // Both server and client agree there's no user
        // This is fine, do nothing
      } else {
        // Initialize to ensure consistency
        initialize();
      }
    }
  }, [initialUser, isSSR, initialize, setUser, user, isAuthenticated, isSessionValid]);

  return <>{children}</>;
};

// Hook to safely use auth store with SSR support
export const useAuth = () => {
  const authState = useAuthStore();

  return {
    ...authState,
    // Helper methods
    isLoggedIn: authState.isAuthenticated && authState.isSessionValid(),
    userDisplayName: authState.user?.email?.split("@")[0] || "User",
  };
};
