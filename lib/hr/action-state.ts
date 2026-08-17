import type { Dictionary } from "@/lib/i18n/config";

/** Server Actions return error *keys*, never English sentences — the client
 *  resolves them against the active dictionary so failures are bilingual too
 *  (CLAUDE.md rule 4). */
export type ErrorKey = keyof Dictionary["errors"];

export type ActionState =
  | { status: "idle" }
  | {
      status: "error";
      errorKey: ErrorKey;
      fieldErrors?: Record<string, ErrorKey>;
    };

export const IDLE_STATE: ActionState = { status: "idle" };

export function failure(
  errorKey: ErrorKey,
  fieldErrors?: Record<string, ErrorKey>,
): ActionState {
  return { status: "error", errorKey, fieldErrors };
}

/** Trims a form value and returns null when it is empty, so that blank optional
 *  inputs land in the database as NULL rather than as an empty string. */
export function optionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function requiredText(value: FormDataEntryValue | null): string | null {
  const text = optionalText(value);
  return text;
}

/** Postgres error codes we translate into user-facing messages. */
export const PG_UNIQUE_VIOLATION = "23505";
export const PG_EXCLUSION_VIOLATION = "23P01";
