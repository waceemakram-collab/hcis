import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function AuthButton() {
  const { dict } = await getI18n();
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/auth/login">{dict.auth.signIn}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline" dir="ltr">
        {typeof user.email === "string" ? user.email : ""}
      </span>
      <LogoutButton />
    </div>
  );
}
