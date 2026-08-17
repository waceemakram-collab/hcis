"use client";

import { createContext, useContext } from "react";

import { dirFor, type Dictionary, type Locale } from "./config";

type I18nValue = {
  locale: Locale;
  dict: Dictionary;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, dict, dir: dirFor(locale) }}>
      {children}
    </I18nContext.Provider>
  );
}

/** Dictionary access for Client Components. Server Components should use
 *  `getI18n()` from `lib/i18n/server` instead. */
export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside <I18nProvider>.");
  }
  return value;
}
