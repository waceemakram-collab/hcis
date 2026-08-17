import Link from "next/link";
import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getI18n } from "@/lib/i18n/server";

/**
 * Every route under /protected calls `requireUser()`, which reads the session
 * cookie and asks Supabase who the user is. That is uncached per-user data, so
 * `cacheComponents` reports the navigation as non-instant.
 *
 * The report is accurate and the answer is "yes, on purpose": an HR system may
 * not serve one employee's record from another's prefetch. Declaring it here
 * covers the whole subtree — departments, employees, job titles, dashboard.
 *
 * `instant`, not `dynamic`. They are different axes: `dynamic` controls
 * static-vs-dynamic rendering (these routes are already dynamic), while
 * `instant` is what this navigation-prefetch diagnostic actually reads.
 */
export const instant = false;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dict } = await getI18n();

  const links = [
    { href: "/protected", label: dict.nav.dashboard },
    { href: "/protected/employees", label: dict.nav.employees },
    { href: "/protected/documents", label: dict.nav.documents },
    { href: "/protected/departments", label: dict.nav.departments },
    { href: "/protected/job-titles", label: dict.nav.jobTitles },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center">
        <nav className="flex w-full justify-center border-b border-b-foreground/10">
          <div className="flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 p-3 px-5 text-sm">
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/protected" className="font-semibold">
                {dict.common.appName}
              </Link>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {/* No EnvVarWarning here. The starter rendered disabled sign-in
                  buttons when config looked missing, which is indistinguishable
                  from a broken app. Missing config now throws with instructions
                  from lib/supabase/env.ts. */}
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </nav>

        <div className="flex w-full max-w-6xl flex-1 flex-col gap-8 p-5 py-10">
          {children}
        </div>

        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-8 text-center text-xs">
          <p className="text-muted-foreground">{dict.common.appName}</p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
