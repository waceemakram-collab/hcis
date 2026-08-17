import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/hr/auth";
import { listDepartmentOptions } from "@/lib/hr/departments";
import {
  currentAssignment,
  getEmployee,
  listManagerOptions,
} from "@/lib/hr/employees";
import { personName } from "@/lib/hr/format";
import { listJobTitles } from "@/lib/hr/job-titles";
import { getI18n } from "@/lib/i18n/server";

import { changeAssignment, updatePerson } from "../../actions";
import { AssignmentForm } from "./assignment-form";
import { PersonForm } from "./person-form";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { dict, locale } = await getI18n();

  const employee = await getEmployee(id);
  if (!employee) notFound();

  const [departments, jobTitles, managers] = await Promise.all([
    listDepartmentOptions(),
    listJobTitles(),
    // Nobody manages themselves — the DB has a check for it, but the dropdown
    // shouldn't offer it in the first place.
    listManagerOptions(id),
  ]);

  const current = currentAssignment(employee.assignments);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href={`/protected/employees/${id}`}>
            <ArrowLeft size={16} className="rtl:rotate-180" />
            {personName(employee.person, locale)}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{dict.edit.title}</h1>
      </header>

      {/* Two separate forms, two separate actions. Keeping them apart makes it
          impossible to be unsure which kind of write you are performing:
          personal details update in place, assignments are effective-dated. */}
      <section className="rounded-lg border p-5">
        {employee.person && (
          <PersonForm
            action={updatePerson}
            person={employee.person}
            employmentId={id}
          />
        )}
      </section>

      <section className="rounded-lg border p-5">
        {current ? (
          <AssignmentForm
            action={changeAssignment}
            employmentId={id}
            current={current}
            departments={departments}
            jobTitles={jobTitles}
            managers={managers}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {dict.errors.noCurrentAssignment}
          </p>
        )}
      </section>
    </div>
  );
}
