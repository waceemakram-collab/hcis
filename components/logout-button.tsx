"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { LOGIN_PATH } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const { dict } = useI18n();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const logout = async () => {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(LOGIN_PATH);
    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={logout} disabled={pending}>
      {dict.auth.signOut}
    </Button>
  );
}
