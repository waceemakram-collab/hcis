import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Guarantees an authenticated user. The proxy already gates `/protected`, but
 * Server Actions are independently addressable HTTP endpoints — they do not
 * inherit a page's protection, so each mutation re-checks for itself.
 *
 * Current phase is admin-only: anyone who can log in is an HR admin. There is
 * deliberately no role check here (CLAUDE.md).
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");
  return user;
}
