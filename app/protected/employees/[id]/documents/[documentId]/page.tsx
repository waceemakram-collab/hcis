import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/hr/auth";
import { getDocument } from "@/lib/hr/documents";
import { getEmployee } from "@/lib/hr/employees";
import { personName } from "@/lib/hr/format";
import { getI18n } from "@/lib/i18n/server";

import { updateDocument } from "../../../../documents/actions";
import { DocumentForm } from "../document-form";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string; documentId: string }>;
}) {
  await requireUser();
  const { id, documentId } = await params;
  const { dict, locale } = await getI18n();

  const [employee, document] = await Promise.all([
    getEmployee(id),
    getDocument(documentId),
  ]);

  if (!employee?.person || !document) notFound();

  // A document reached through the wrong employee's URL would let one person's
  // record be edited from another's page. Refuse rather than quietly allow it.
  if (document.person_id !== employee.person.id) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href={`/protected/employees/${id}`}>
            <ArrowLeft size={16} className="rtl:rotate-180" />
            {personName(employee.person, locale)}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{dict.documents.editTitle}</h1>
      </header>

      <DocumentForm
        action={updateDocument}
        personId={employee.person.id}
        employmentId={id}
        document={document}
      />
    </div>
  );
}
