import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * The landing point for every link Supabase emails out: the admin invite, and
 * a password reset. `verifyOtp` exchanges the one-time token in the URL for a
 * real session, then we send the person somewhere useful.
 *
 * Two things here are deliberate:
 *
 *   1. `?next=` is run through safeNextPath(). Without it, a crafted link could
 *      set next=https://evil.example and Next's redirect() would happily bounce
 *      the freshly-authenticated user off-site. Relative same-origin paths only.
 *
 *   2. An `invite` or `recovery` link goes to /auth/update-password, not to the
 *      app. Someone opening an invite has a session but no password they know —
 *      dropping them on the dashboard leaves an account nobody can sign back
 *      into once the link expires.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!token_hash || !type) {
    redirect(`/auth/error?error=${encodeURIComponent("Missing token")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  const destination =
    type === "invite" || type === "recovery"
      ? "/auth/update-password"
      : safeNextPath(searchParams.get("next"));

  redirect(destination);
}
