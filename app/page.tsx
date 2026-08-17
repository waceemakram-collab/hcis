import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * There is no public marketing surface on an internal HR system. The root just
 * routes: into the app if you have a session, to the login page if you don't.
 * (This replaced the Next/Supabase starter landing page.)
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/protected/departments" : "/auth/login");
}
