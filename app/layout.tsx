import type { Metadata } from "next";
import { Geist, Noto_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { dirFor, getDictionary } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Expertise Wave HCIS",
  description: "Internal human capital information system.",
};

/**
 * `next.config.ts` sets `cacheComponents: true`, under which Next tries to
 * prerender a static shell and reports any uncached runtime data as a
 * "Blocking Route".
 *
 * This route legitimately blocks. The UI language lives in a cookie (rule 4 —
 * a toggle, not `/en/` and `/ar/` routes), and `dir` has to be on <html>, which
 * cannot be wrapped in Suspense. So the cookie must be read before the shell
 * exists. Declaring that here is the honest fix.
 *
 * Do NOT "fix" this by wrapping `cookies()` in try/catch. Under cacheComponents
 * that call throws Next's internal prerender-abort signal rather than an
 * ordinary error; swallowing it would bake DEFAULT_LOCALE into the shell and
 * the Arabic toggle would silently stop working in production.
 *
 * Nothing is lost: every page is behind auth, and `requireUser()` reads cookies
 * too, so no route in this app was ever prerenderable.
 */
export const instant = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

// Geist has no Arabic glyphs. Without this, Arabic falls back to whatever the OS
// picks and looks broken next to the Latin UI.
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  display: "swap",
  subsets: ["arabic"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} dir={dirFor(locale)} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${notoArabic.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider locale={locale} dict={dict}>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
