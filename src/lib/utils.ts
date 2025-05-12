import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple class strings and Tailwind classes together,
 * resolving conflicts in favor of the last class specified
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
