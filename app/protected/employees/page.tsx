import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/hr/auth";
import { listEmployees } from "@/lib/hr/employees";
import { getI18n } from "@/lib/i18n/server";

import { EmployeesList } from "./employees-list";

export default async function EmployeesPage() {
  await requireUser();
  const { dict } = await getI18n();
  const employees = await listEmployees();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{dict.employees.title}</h1>
          <p className="text-sm text-muted-foreground">
            {dict.employees.subtitle}
          </p>
        </div>
        <Button asChild>
          <Link href="/protected/employees/new">
            <Plus size={16} />
            {dict.employees.newTitle}
          </Link>
        </Button>
      </header>

      <EmployeesList employees={employees} />
    </div>
  );
}
