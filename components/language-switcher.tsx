"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setLocale } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/provider";

export function LanguageSwitcher() {
  const { locale, dict } = useI18n();
  const [pending, startTransition] = useTransition();

  const next = locale === "en" ? "ar" : "en";
  const label = next === "ar" ? dict.common.arabic : dict.common.english;

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={`${dict.common.language}: ${label}`}
      onClick={() => startTransition(() => setLocale(next))}
    >
      <Languages size={16} />
      {label}
    </Button>
  );
}
