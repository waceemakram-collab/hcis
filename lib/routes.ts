/** Where a successful sign-in lands. Single source of truth — login, sign-up
 *  confirmation, and the root redirect all read this. */
export const AFTER_LOGIN_PATH = "/protected/departments";

export const LOGIN_PATH = "/auth/login";

/** Only allow same-origin relative paths from `?next=`, so a crafted link
 *  cannot bounce someone to another site after login. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value) return AFTER_LOGIN_PATH;
  if (!value.startsWith("/") || value.startsWith("//")) return AFTER_LOGIN_PATH;
  if (value.startsWith(LOGIN_PATH)) return AFTER_LOGIN_PATH;
  return value;
}
