import { requireUser } from "@/lib/hr/auth";
import { listDepartmentOptions } from "@/lib/hr/departments";
import { listManagerOptions } from "@/lib/hr/employees";
import { listJobTitles } from "@/lib/hr/job-titles";
import { getI18n } from "@/lib/i18n/server";

import { createEmployee } from "../actions";
import { EmployeeForm } from "../employee-form";

export default async function NewEmployeePage() {
  await requireUser();
  const { dict } = await getI18n();

  const [departments, jobTitles, managers] = await Promise.all([
    listDepartmentOptions(),
    listJobTitles(),
    listManagerOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{dict.employees.newTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {dict.employees.newSubtitle}
        </p>
      </header>

      <EmployeeForm
        action={createEmployee}
        departments={departments}
        jobTitles={jobTitles}
        managers={managers}
      />
    </div>
  );
}
