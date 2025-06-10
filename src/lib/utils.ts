import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple class strings and Tailwind classes together,
 * resolving conflicts in favor of the last class specified
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UserData {
  email?: string;
  [key: string]: unknown;
}

/**
 * Sanitizes user data for client-side consumption
 * Ensures sensitive data is not exposed in browser console logs
 */
export function sanitizeUserData(userData: UserData | null) {
  if (!userData) return null;

  // Create a new object with only safe properties
  return {
    isAuthenticated: true,
    username: userData.email ? userData.email.split("@")[0] : "User",
  };
}
