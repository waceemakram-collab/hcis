import Link from "next/link";
import { Building2, FileClock, IdCard, Users } from "lucide-react";

import { requireUser } from "@/lib/hr/auth";
import { getI18n } from "@/lib/i18n/server";

export default async function DashboardPage() {
  await requireUser();
  const { dict } = await getI18n();

  const cards = [
    {
      href: "/protected/employees",
      title: dict.nav.employees,
      body: dict.dashboard.employeesCard,
      Icon: Users,
    },
    {
      href: "/protected/documents",
      title: dict.nav.documents,
      body: dict.documents.dashboardCard,
      Icon: FileClock,
    },
    {
      href: "/protected/departments",
      title: dict.nav.departments,
      body: dict.dashboard.departmentsCard,
      Icon: Building2,
    },
    {
      href: "/protected/job-titles",
      title: dict.nav.jobTitles,
      body: dict.dashboard.jobTitlesCard,
      Icon: IdCard,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{dict.dashboard.title}</h1>
        <p className="text-muted-foreground">{dict.dashboard.subtitle}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, title, body, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-2 rounded-lg border p-5 transition-colors hover:bg-accent"
          >
            <Icon size={20} className="text-muted-foreground" />
            <span className="font-medium">{title}</span>
            <span className="text-sm text-muted-foreground">{body}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
