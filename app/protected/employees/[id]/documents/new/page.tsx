import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/hr/auth";
import { getEmployee } from "@/lib/hr/employees";
import { personName } from "@/lib/hr/format";
import { getI18n } from "@/lib/i18n/server";

import { createDocument } from "../../../../documents/actions";
import { DocumentForm } from "../document-form";

export default async function NewDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { dict, locale } = await getI18n();

  const employee = await getEmployee(id);
  if (!employee?.person) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href={`/protected/employees/${id}`}>
            <ArrowLeft size={16} className="rtl:rotate-180" />
            {personName(employee.person, locale)}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{dict.documents.addTitle}</h1>
      </header>

      <DocumentForm
        action={createDocument}
        personId={employee.person.id}
        employmentId={id}
      />
    </div>
  );
}
