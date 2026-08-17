import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Plus, UserMinus, UserPlus } from "lucide-react";

import { AssignmentTimeline } from "@/components/hr/assignment-timeline";
import { DocumentStatusBadge } from "@/components/hr/document-status-badge";
import { UndoTerminationForm } from "@/components/hr/undo-termination-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/hr/auth";
import { listDocumentsForPerson } from "@/lib/hr/documents";
import { currentAssignment, getEmployee } from "@/lib/hr/employees";
import {
  formatDate,
  localizedName,
  personName,
  todayInRiyadh,
} from "@/lib/hr/format";
import { getI18n } from "@/lib/i18n/server";

import { undoTermination } from "../actions";

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { dict, locale } = await getI18n();

  const employee = await getEmployee(id);
  if (!employee) notFound();

  const assignment = currentAssignment(employee.assignments);
  const person = employee.person;

  // Documents hang off the person, not this employment — a passport survives
  // leaving and being rehired (rule 3).
  const documents = person ? await listDocumentsForPerson(person.id) : [];
  const today = todayInRiyadh();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href="/protected/employees">
            {/* rtl:rotate-180 — a "back" arrow points the other way in Arabic. */}
            <ArrowLeft size={16} className="rtl:rotate-180" />
            {dict.employees.title}
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{personName(person, locale)}</h1>
          <Badge variant={employee.status === "active" ? "default" : "secondary"}>
            {dict.status[employee.status]}
          </Badge>
          <div className="ms-auto flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/protected/employees/${employee.id}/edit`}>
                <Pencil size={14} />
                {dict.common.edit}
              </Link>
            </Button>

            {/* Which action is offered follows from the state of the record:
                a live employment can be ended, an ended one can be followed by
                a new period. Neither is ever shown when the server would
                refuse it. */}
            {employee.termination_date ? (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/protected/employees/${employee.id}/rehire`}>
                  <UserPlus size={14} />
                  {dict.termination.rehire}
                </Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/protected/employees/${employee.id}/terminate`}>
                  <UserMinus size={14} />
                  {dict.termination.terminate}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {assignment && (
          <p className="text-sm text-muted-foreground">
            {localizedName(assignment.job_title, locale)} ·{" "}
            {localizedName(assignment.department, locale)}
          </p>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="border-b pb-2 text-base font-semibold">
          {dict.employees.personDetails}
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Detail
            label={dict.employees.firstNameEn}
            value={person?.first_name_en ?? dict.common.none}
          />
          <Detail
            label={dict.employees.lastNameEn}
            value={person?.last_name_en ?? dict.common.none}
          />
          <Detail
            label={dict.employees.nationality}
            value={person?.nationality ?? dict.common.none}
          />
          <Detail
            label={dict.employees.nationalId}
            value={person?.national_id ?? dict.common.none}
          />
          <Detail
            label={dict.employees.dateOfBirth}
            value={formatDate(person?.date_of_birth, locale)}
          />
          <Detail
            label={dict.employees.email}
            value={person?.email ?? dict.common.none}
          />
          <Detail
            label={dict.employees.phone}
            value={person?.phone ?? dict.common.none}
          />
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="border-b pb-2 text-base font-semibold">
          {dict.employees.employmentDetails}
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Detail
            label={dict.employees.hireDate}
            value={formatDate(employee.hire_date, locale)}
          />
          <Detail
            label={dict.employees.employmentType}
            value={dict.employmentType[employee.employment_type]}
          />
          <Detail
            label={dict.employees.status}
            value={dict.status[employee.status]}
          />
        </dl>
      </section>

      {employee.termination_date && (
        <section className="flex flex-col gap-4 rounded-lg border border-muted-foreground/30 bg-muted/30 p-5">
          <h2 className="text-base font-semibold">
            {dict.termination.sectionTitle}
          </h2>

          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label={dict.termination.endedOn}
              value={formatDate(employee.termination_date, locale)}
            />
            <Detail
              label={dict.termination.reasonLabel}
              value={
                employee.termination_reason
                  ? dict.terminationReason[employee.termination_reason]
                  : dict.common.none
              }
            />
            {employee.termination_notes && (
              <Detail
                label={dict.termination.notesLabel}
                value={employee.termination_notes}
              />
            )}
          </dl>

          <div className="border-t pt-4">
            <UndoTerminationForm
              action={undoTermination}
              employmentId={employee.id}
            />
          </div>
        </section>
      )}

      {/* The timeline supersedes a separate "current assignment" block — the
          current row is simply the first entry, badged as such. Keeping both
          would show the same facts twice and let them drift apart. */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 border-b pb-2">
          <h2 className="text-base font-semibold">{dict.history.title}</h2>
          <p className="text-sm text-muted-foreground">
            {dict.history.subtitle}
          </p>
        </div>

        <AssignmentTimeline
          assignments={employee.assignments}
          hireDate={employee.hire_date}
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">
              {dict.documents.sectionTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {dict.documents.sectionHelp}
            </p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/protected/employees/${employee.id}/documents/new`}>
              <Plus size={14} />
              {dict.documents.add}
            </Link>
          </Button>
        </div>

        {documents.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {dict.documents.emptyForPerson}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {documents.map((document) => (
              <li
                key={document.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    {dict.documentType[document.document_type]}
                    {document.document_type === "other" &&
                      document.description && <> · {document.description}</>}
                  </span>
                  <span className="text-xs text-muted-foreground" dir="auto">
                    {document.document_number ?? dict.common.none} ·{" "}
                    {dict.documents.expiryDate}:{" "}
                    {formatDate(document.expiry_date, locale)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <DocumentStatusBadge
                    expiryDate={document.expiry_date}
                    today={today}
                  />
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={`/protected/employees/${employee.id}/documents/${document.id}`}
                    >
                      {dict.common.edit}
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
