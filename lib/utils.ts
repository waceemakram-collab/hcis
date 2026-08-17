import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Kept for compatibility with the starter components that still reference it.
 * Prefer importing `hasSupabaseEnv` from `lib/supabase/env` directly.
 *
 * The original version of this checked only NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
 * so a project configured with NEXT_PUBLIC_SUPABASE_ANON_KEY read as "not
 * configured" and the UI silently disabled its own sign-in buttons.
 */
export { hasSupabaseEnv as hasEnvVars } from "@/lib/supabase/env";
