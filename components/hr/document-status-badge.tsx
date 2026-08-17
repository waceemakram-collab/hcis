"use client";

import { AlertTriangle, CalendarClock, CheckCircle2, XCircle } from "lucide-react";

import {
  daysUntil,
  documentStatus,
  type DocumentStatus,
} from "@/lib/hr/document-status";
import { formatRelativeDays } from "@/lib/hr/format";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Colour is never the only signal: every badge carries a word and an icon too.
 * Roughly one man in twelve has some form of colour-vision deficiency, and this
 * screen is the one that stops an Iqama lapsing — it has to survive being
 * printed in greyscale and glanced at by someone who doesn't see red/green.
 */
const STYLES: Record<DocumentStatus, string> = {
  expired:
    "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
  critical:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  upcoming:
    "border-border bg-muted text-muted-foreground",
  ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

const ICONS: Record<DocumentStatus, typeof XCircle> = {
  expired: XCircle,
  critical: AlertTriangle,
  upcoming: CalendarClock,
  ok: CheckCircle2,
};

export function DocumentStatusBadge({
  expiryDate,
  today,
  showCountdown = true,
  className,
}: {
  expiryDate: string;
  /** Computed server-side so server and client agree across midnight. */
  today: string;
  showCountdown?: boolean;
  className?: string;
}) {
  const { dict, locale } = useI18n();

  const status = documentStatus(expiryDate, today);
  const days = daysUntil(expiryDate, today);
  const Icon = ICONS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        STYLES[status],
        className,
      )}
    >
      <Icon size={13} aria-hidden />
      <span>{dict.documentStatus[status]}</span>
      {showCountdown && (
        <span className="font-normal opacity-80" dir="auto">
          · {formatRelativeDays(days, locale)}
        </span>
      )}
    </span>
  );
}
