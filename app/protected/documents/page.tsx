import { requireUser } from "@/lib/hr/auth";
import { listDocuments } from "@/lib/hr/documents";
import { todayInRiyadh } from "@/lib/hr/format";
import { getI18n } from "@/lib/i18n/server";

import { DocumentsDashboard } from "./documents-dashboard";

export default async function DocumentsPage() {
  await requireUser();
  const { dict } = await getI18n();

  const documents = await listDocuments();

  // Resolved once, on the server, and passed down. If the client computed its
  // own "today" the two renders could disagree across midnight in Riyadh and
  // React would flag a hydration mismatch.
  const today = todayInRiyadh();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{dict.documents.title}</h1>
        <p className="text-sm text-muted-foreground">
          {dict.documents.subtitle}
        </p>
      </header>

      <DocumentsDashboard documents={documents} today={today} />
    </div>
  );
}
