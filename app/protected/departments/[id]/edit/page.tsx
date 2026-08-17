import { notFound } from "next/navigation";

import { requireUser } from "@/lib/hr/auth";
import { getDepartment, listDepartmentOptions } from "@/lib/hr/departments";
import { getI18n } from "@/lib/i18n/server";

import { updateDepartment } from "../../actions";
import { DepartmentForm } from "../../department-form";

export default async function EditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { dict } = await getI18n();

  const [department, parentOptions] = await Promise.all([
    getDepartment(id),
    listDepartmentOptions(),
  ]);

  if (!department) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">
        {dict.common.edit} · {department.name_en}
      </h1>
      <DepartmentForm
        action={updateDepartment}
        department={department}
        parentOptions={parentOptions}
      />
    </div>
  );
}
