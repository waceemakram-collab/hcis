"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { LOCALE_COOKIE, isLocale, type Locale } from "./config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Switches UI language. Sets the cookie and re-renders the whole tree so that
 *  `dir` on <html> flips with it. */
export async function setLocale(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
