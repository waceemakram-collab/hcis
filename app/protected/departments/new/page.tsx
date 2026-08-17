import { requireUser } from "@/lib/hr/auth";
import { listDepartmentOptions } from "@/lib/hr/departments";
import { getI18n } from "@/lib/i18n/server";

import { createDepartment } from "../actions";
import { DepartmentForm } from "../department-form";

export default async function NewDepartmentPage() {
  await requireUser();
  const { dict } = await getI18n();
  const parentOptions = await listDepartmentOptions();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{dict.departments.newTitle}</h1>
      <DepartmentForm action={createDepartment} parentOptions={parentOptions} />
    </div>
  );
}
