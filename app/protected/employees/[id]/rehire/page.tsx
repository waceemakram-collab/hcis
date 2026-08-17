import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/hr/auth";
import { listDepartmentOptions } from "@/lib/hr/departments";
import { getEmployee, listManagerOptions } from "@/lib/hr/employees";
import { formatDate, personName } from "@/lib/hr/format";
import { listJobTitles } from "@/lib/hr/job-titles";
import { getI18n } from "@/lib/i18n/server";

import { rehireEmployment } from "../../actions";
import { RehireForm } from "./rehire-form";

export default async function RehirePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { dict, locale } = await getI18n();

  const employee = await getEmployee(id);
  if (!employee?.person) notFound();

  // A second employment is only legal once the previous one has ended —
  // `employments_one_active_per_person` enforces it, so don't offer the form.
  if (!employee.termination_date) redirect(`/protected/employees/${id}`);

  const [departments, jobTitles, managers] = await Promise.all([
    listDepartmentOptions(),
    listJobTitles(),
    listManagerOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href={`/protected/employees/${id}`}>
            <ArrowLeft size={16} className="rtl:rotate-180" />
            {personName(employee.person, locale)}
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{dict.termination.rehireTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {dict.termination.rehireHelp}
          </p>
          <p className="text-sm text-muted-foreground">
            {dict.termination.previousEnded}:{" "}
            {formatDate(employee.termination_date, locale)}
          </p>
        </div>
      </header>

      <RehireForm
        action={rehireEmployment}
        personId={employee.person.id}
        previousEmploymentId={id}
        previousTerminationDate={employee.termination_date}
        departments={departments}
        jobTitles={jobTitles}
        managers={managers}
      />
    </div>
  );
}
