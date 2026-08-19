/**
 * Supabase connection details, resolved from the environment.
 *
 * Supabase is mid-rename: the dashboard used to call this the **anon** key and
 * now calls it the **publishable** key, and which one you see depends on when
 * the project was created. Both are the same thing for our purposes, so we
 * accept either variable name rather than making you match the starter's guess.
 *
 * These must be written as literal `process.env.X` member accesses. Next inlines
 * `NEXT_PUBLIC_*` at build time by textual substitution, so a computed lookup
 * like `process.env[name]` silently yields undefined in the browser bundle.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_URL = url;
export const SUPABASE_KEY = key;

/** True when both values are present. */
export const hasSupabaseEnv = Boolean(url && key);

/**
 * Returns the connection details or throws with an actionable message.
 *
 * Deliberately loud. The starter's habit was to notice missing config and
 * quietly render a disabled button, which looks identical to a broken click
 * handler and costs an afternoon to diagnose. Fail with the answer instead.
 */
/**
 * Catches config that is *present but wrong* — the failure mode that costs the
 * most time, because the browser reports it only as a generic "Failed to fetch"
 * from deep inside supabase-js, with no hint that the cause is a typo.
 *
 * Returns a problem description, or null when the values look sane.
 */
function describeMalformedConfig(rawUrl: string, rawKey: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return `NEXT_PUBLIC_SUPABASE_URL is not a valid URL: ${JSON.stringify(rawUrl)}`;
  }

  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
    return `NEXT_PUBLIC_SUPABASE_URL should start with https:// — got ${parsed.protocol}//`;
  }

  // The other way this goes wrong: pasting the *dashboard* URL
  // (https://supabase.com/dashboard/project/<ref>) instead of the API URL.
  // Both are valid https URLs; only one is an API endpoint.
  if (parsed.hostname === "supabase.com" || parsed.hostname.endsWith(".supabase.com")) {
    return `NEXT_PUBLIC_SUPABASE_URL is set to a supabase.com address (${rawUrl}). That is the dashboard, not the API. The value you want looks like https://<project-ref>.supabase.co — find it under Project Settings → API.`;
  }

  if (parsed.pathname !== "/" && parsed.pathname !== "") {
    return `NEXT_PUBLIC_SUPABASE_URL should be a bare origin with no path, but it has one: "${parsed.pathname}". Use https://<project-ref>.supabase.co and nothing after it.`;
  }

  // A Supabase project ref is the leading label of the hostname, and it is a
  // run of lowercase letters and digits — never hyphens, never uppercase.
  //
  // This check exists because of a real production incident: the deployment
  // guide's placeholder, "https://your-prod-ref.supabase.co", was pasted into
  // Vercel verbatim. It is a syntactically perfect https URL, so everything
  // below waved it through, and the only symptom the browser gave was a bare
  // "Failed to fetch" from inside supabase-js — no hint that the hostname
  // simply did not exist.
  //
  // The length floor is deliberately loose (refs are longer than this) rather
  // than pinned to an exact count: the point is to reject placeholders and
  // truncation, not to encode a number Supabase never promised.
  if (parsed.hostname.endsWith(".supabase.co")) {
    const ref = parsed.hostname.split(".")[0];

    if (!/^[a-z0-9]+$/.test(ref)) {
      return `NEXT_PUBLIC_SUPABASE_URL points at "${ref}.supabase.co", but a Supabase project ref contains only lowercase letters and digits. This looks like a placeholder or a hand-typed value, not a real project URL. Copy it from Project Settings → API in the Supabase dashboard.`;
    }

    if (ref.length < 15) {
      return `NEXT_PUBLIC_SUPABASE_URL points at "${ref}.supabase.co", but that project ref is too short (${ref.length} characters) to be real — the value is probably truncated. Re-copy it from Project Settings → API.`;
    }
  }

  // Legacy anon keys are JWTs; the newer publishable keys (sb_publishable_…)
  // are not, so only JWT-shaped values get the structural check.
  if (rawKey.startsWith("eyJ")) {
    const segments = rawKey.split(".");
    if (segments.length !== 3) {
      return `The Supabase key looks like a JWT but has ${segments.length} segments instead of 3 — it is probably truncated. Re-copy it from the dashboard.`;
    }
    try {
      // atob, not Buffer: this module is imported by lib/supabase/client.ts and
      // therefore runs in the browser, where Buffer does not exist. JWT segments
      // are base64url, so translate the two differing characters first.
      const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64)) as { ref?: string };

      if (payload.ref && payload.ref !== parsed.hostname.split(".")[0]) {
        return `The Supabase key belongs to project "${payload.ref}" but NEXT_PUBLIC_SUPABASE_URL points at "${parsed.hostname.split(".")[0]}". They must be the same project.`;
      }
    } catch {
      return "The Supabase key is JWT-shaped but its payload will not decode — the value is corrupted, not merely wrong. Re-copy it from the Supabase dashboard with the copy button rather than by hand.";
    }
  }

  return null;
}

export function requireSupabaseEnv(): { url: string; key: string } {
  if (!url || !key) {
    throw new Error(
      [
        "Supabase environment variables are missing.",
        "",
        "Set these in .env.local, then restart the dev server:",
        "  NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co",
        "  NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon / publishable key>",
        "",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is accepted as an alias for the",
        "second one. Both are read; whichever you set is used.",
        "",
        `Currently: URL is ${url ? "set" : "MISSING"}, key is ${key ? "set" : "MISSING"}.`,
      ].join("\n"),
    );
  }

  const malformed = describeMalformedConfig(url, key);
  if (malformed) {
    throw new Error(
      [
        "Supabase is configured, but the values look wrong.",
        "",
        malformed,
        "",
        "Copy both values fresh from the Supabase dashboard:",
        "  Project Settings → API  (use the copy buttons — do not retype).",
      ].join("\n"),
    );
  }

  return { url, key };
}
