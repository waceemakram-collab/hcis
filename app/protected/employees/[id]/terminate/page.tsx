import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/hr/auth";
import { getEmployee } from "@/lib/hr/employees";
import { personName } from "@/lib/hr/format";
import { getI18n } from "@/lib/i18n/server";

import { terminateEmployment } from "../../actions";
import { TerminateForm } from "./terminate-form";

export default async function TerminatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { dict, locale } = await getI18n();

  const employee = await getEmployee(id);
  if (!employee) notFound();

  // Already ended — there is nothing to do here, and the form would only offer
  // an action the server would refuse.
  if (employee.termination_date) redirect(`/protected/employees/${id}`);

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
          <h1 className="text-2xl font-bold">{dict.termination.title}</h1>
          <p className="text-sm text-muted-foreground">
            {dict.termination.help}
          </p>
        </div>
      </header>

      <TerminateForm
        action={terminateEmployment}
        employmentId={id}
        hireDate={employee.hire_date}
      />
    </div>
  );
}
