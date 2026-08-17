import type { Locale } from "@/lib/i18n/config";
import type { PersonName } from "./types";

/**
 * Picks the localized name, falling back to English when the Arabic value is
 * missing. Arabic is optional everywhere (CLAUDE.md rule 4), so every read path
 * must tolerate its absence rather than rendering a blank cell.
 */
export function localizedName(
  row: { name_en: string; name_ar: string | null } | null | undefined,
  locale: Locale,
): string {
  if (!row) return "—";
  if (locale === "ar" && row.name_ar?.trim()) return row.name_ar;
  return row.name_en;
}

export function personName(
  person: PersonName | null | undefined,
  locale: Locale,
): string {
  if (!person) return "—";

  if (locale === "ar") {
    const first = person.first_name_ar?.trim();
    const last = person.last_name_ar?.trim();
    if (first && last) return `${first} ${last}`;
  }

  return `${person.first_name_en} ${person.last_name_en}`;
}

/**
 * Gregorian dates in both locales, Western digits. Labour contracts and Zoho
 * both use Gregorian — do not switch to Hijri without an explicit decision
 * (CLAUDE.md rule 4).
 */
export function formatDate(
  value: string | null | undefined,
  locale: Locale,
): string {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(
    locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB",
    { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" },
  ).format(date);
}

/**
 * "in 45 days" / "بعد ٤٥ يومًا" — but with Western digits, per rule 4.
 *
 * Uses Intl.RelativeTimeFormat rather than concatenating a number with a "days"
 * label. Arabic pluralises on singular / dual / few / many, so a hand-built
 * string is wrong for most numbers; Intl gets it right in both languages for
 * free. Switches to months past two months so long horizons stay readable.
 */
export function formatRelativeDays(days: number, locale: Locale): string {
  const rtf = new Intl.RelativeTimeFormat(
    locale === "ar" ? "ar-u-nu-latn" : "en",
    { numeric: "auto" },
  );

  if (Math.abs(days) >= 60) {
    return rtf.format(Math.round(days / 30), "month");
  }
  return rtf.format(days, "day");
}

/** Today in Riyadh, as a `yyyy-mm-dd` string suitable for a date input default. */
export function todayInRiyadh(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
