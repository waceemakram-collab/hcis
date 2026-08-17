import type { DocumentWithPerson, HrDocument } from "./types";

/**
 * Pure expiry logic. **No server imports** — this is used by the dashboard,
 * which filters in the browser.
 *
 * Every function takes `today` as an argument rather than reading the clock.
 * The server renders the first paint and the client renders afterwards; if each
 * called `new Date()` independently they could disagree across midnight and
 * React would report a hydration mismatch. The server computes today once (in
 * Riyadh) and passes it down.
 */

export const DOCUMENT_STATUSES = [
  "expired",
  "critical",
  "upcoming",
  "ok",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

/** Whole days from `today` to `date`. Negative once the date has passed. */
export function daysUntil(date: string, today: string): number {
  const from = new Date(`${today}T00:00:00Z`).getTime();
  const to = new Date(`${date}T00:00:00Z`).getTime();
  return Math.round((to - from) / 86_400_000);
}

/**
 * Four tiers, not three. The brief named three colours but three windows
 * (30/60/90), which do not line up: something 80 days out is neither "expiring
 * soon" nor comfortably fine.
 *
 *   expired   already lapsed          — red
 *   critical  0–30 days               — amber
 *   upcoming  31–90 days              — neutral
 *   ok        more than 90 days       — green
 *
 * A document expiring *today* counts as critical, not expired: it is still
 * valid for the rest of the day.
 */
export function documentStatus(expiryDate: string, today: string): DocumentStatus {
  const days = daysUntil(expiryDate, today);
  if (days < 0) return "expired";
  if (days <= 30) return "critical";
  if (days <= 90) return "upcoming";
  return "ok";
}

/** Sort key so the most urgent document is always first. */
export function byUrgency(a: HrDocument, b: HrDocument): number {
  return a.expiry_date.localeCompare(b.expiry_date);
}

/** True when the person holds an employment that has not ended. */
export function isCurrentlyEmployed(document: DocumentWithPerson): boolean {
  return (
    document.person?.employments.some((e) => e.termination_date === null) ?? false
  );
}

/** The employment to link to — the open one if there is one, else the most
 *  recent, so a leaver's row is still clickable. */
export function linkableEmploymentId(
  document: DocumentWithPerson,
): string | null {
  const employments = document.person?.employments ?? [];
  return (
    employments.find((e) => e.termination_date === null)?.id ??
    employments[0]?.id ??
    null
  );
}

/** Counts per tier, for the dashboard summary. */
export function countByStatus(
  documents: HrDocument[],
  today: string,
): Record<DocumentStatus, number> {
  const counts: Record<DocumentStatus, number> = {
    expired: 0,
    critical: 0,
    upcoming: 0,
    ok: 0,
  };
  for (const document of documents) {
    counts[documentStatus(document.expiry_date, today)] += 1;
  }
  return counts;
}
