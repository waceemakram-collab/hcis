"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DocumentStatusBadge } from "@/components/hr/document-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  countByStatus,
  daysUntil,
  documentStatus,
  isCurrentlyEmployed,
  linkableEmploymentId,
} from "@/lib/hr/document-status";
import { formatDate, personName } from "@/lib/hr/format";
import type { DocumentWithPerson } from "@/lib/hr/types";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type Window = "all" | "expired" | 30 | 60 | 90;

export function DocumentsDashboard({
  documents,
  today,
}: {
  documents: DocumentWithPerson[];
  /** Riyadh "today", computed on the server so both renders agree. */
  today: string;
}) {
  const { dict, locale } = useI18n();
  const [window, setWindow] = useState<Window>("all");
  const [includeFormer, setIncludeFormer] = useState(false);

  // Leavers are hidden by default: an expired passport for someone who left two
  // years ago is not actionable, and a red list nobody can clear gets ignored.
  const scoped = useMemo(
    () => documents.filter((d) => includeFormer || isCurrentlyEmployed(d)),
    [documents, includeFormer],
  );

  const visible = useMemo(() => {
    if (window === "all") return scoped;
    if (window === "expired") {
      return scoped.filter((d) => documentStatus(d.expiry_date, today) === "expired");
    }
    return scoped.filter((d) => {
      const days = daysUntil(d.expiry_date, today);
      return days >= 0 && days <= window;
    });
  }, [scoped, window, today]);

  const counts = useMemo(() => countByStatus(scoped, today), [scoped, today]);

  const filters: { value: Window; label: string; count?: number }[] = [
    { value: "all", label: dict.documents.windowAll, count: scoped.length },
    { value: "expired", label: dict.documents.windowExpired, count: counts.expired },
    { value: 30, label: dict.documents.window30 },
    { value: 60, label: dict.documents.window60 },
    { value: 90, label: dict.documents.window90 },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={String(filter.value)}
              size="sm"
              variant={window === filter.value ? "default" : "outline"}
              onClick={() => setWindow(filter.value)}
            >
              {filter.label}
              {filter.count !== undefined && (
                <span className="opacity-70">({filter.count})</span>
              )}
            </Button>
          ))}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={includeFormer}
            onChange={(event) => setIncludeFormer(event.target.checked)}
          />
          {dict.documents.includeFormer}
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {documents.length === 0
            ? dict.documents.empty
            : dict.documents.emptyFiltered}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.documents.employee}</TableHead>
              <TableHead>{dict.documents.type}</TableHead>
              <TableHead>{dict.documents.number}</TableHead>
              <TableHead>{dict.documents.expiryDate}</TableHead>
              <TableHead>{dict.documentStatus.ok}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((document) => {
              const employmentId = linkableEmploymentId(document);
              const former = !isCurrentlyEmployed(document);

              return (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-wrap items-center gap-2">
                      {employmentId ? (
                        <Link
                          href={`/protected/employees/${employmentId}`}
                          className="underline underline-offset-4"
                        >
                          {personName(document.person, locale)}
                        </Link>
                      ) : (
                        personName(document.person, locale)
                      )}
                      {former && (
                        <Badge variant="secondary">
                          {dict.documents.formerEmployee}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dict.documentType[document.document_type]}
                    {document.document_type === "other" &&
                      document.description && <> · {document.description}</>}
                  </TableCell>
                  <TableCell className="text-muted-foreground" dir="ltr">
                    {document.document_number ?? dict.common.none}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-muted-foreground",
                      documentStatus(document.expiry_date, today) === "expired" &&
                        "text-red-700 dark:text-red-400",
                    )}
                  >
                    {formatDate(document.expiry_date, locale)}
                  </TableCell>
                  <TableCell>
                    <DocumentStatusBadge
                      expiryDate={document.expiry_date}
                      today={today}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
