"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assignmentAsOf, changesBetween } from "@/lib/hr/assignments";
import { formatDate, localizedName, personName } from "@/lib/hr/format";
import type { AssignmentWithManager } from "@/lib/hr/types";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function AssignmentTimeline({
  assignments,
  hireDate,
}: {
  /** Full history, newest first. */
  assignments: AssignmentWithManager[];
  hireDate: string;
}) {
  const { dict, locale } = useI18n();

  // Empty means "show the whole history". The lookup is pure and the history is
  // already loaded, so scrubbing dates costs no round trip.
  const [asOf, setAsOf] = useState("");

  const beforeHire = asOf !== "" && asOf < hireDate;
  const inForce = asOf === "" || beforeHire ? null : assignmentAsOf(assignments, asOf);

  if (assignments.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        {dict.history.empty}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ---- as-of lookup ------------------------------------------------ */}
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold">{dict.history.asOfTitle}</h3>
          <p className="text-xs text-muted-foreground">{dict.history.asOfHelp}</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="as-of" className="text-xs">
              {dict.history.asOfLabel}
            </Label>
            <Input
              id="as-of"
              type="date"
              dir="ltr"
              className="w-auto"
              value={asOf}
              onChange={(event) => setAsOf(event.target.value)}
            />
          </div>
          {asOf !== "" && (
            <Button variant="ghost" size="sm" onClick={() => setAsOf("")}>
              {dict.history.asOfClear}
            </Button>
          )}
        </div>

        {asOf !== "" && (
          <div className="rounded-md bg-muted/50 p-3">
            {beforeHire ? (
              <p className="text-sm text-muted-foreground">
                {dict.history.asOfBeforeHire}
              </p>
            ) : inForce ? (
              <dl className="grid gap-3 sm:grid-cols-3">
                <Detail
                  label={dict.employees.department}
                  value={localizedName(inForce.department, locale)}
                />
                <Detail
                  label={dict.employees.jobTitle}
                  value={localizedName(inForce.job_title, locale)}
                />
                <Detail
                  label={dict.employees.manager}
                  value={
                    inForce.manager?.person
                      ? personName(inForce.manager.person, locale)
                      : dict.employees.noManager
                  }
                />
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                {dict.history.asOfNone}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ---- timeline, newest first -------------------------------------- */}
      <ol className="flex flex-col">
        {assignments.map((assignment, index) => {
          const older = assignments[index + 1];
          const changes = older ? changesBetween(assignment, older) : [];
          const isOldest = index === assignments.length - 1;
          const isCurrent = assignment.valid_to === null;
          const isMatch = inForce?.id === assignment.id;
          const isLast = index === assignments.length - 1;

          return (
            <li key={assignment.id} className="flex gap-4">
              {/* rail — flex order flips automatically in RTL */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "mt-2 h-3 w-3 shrink-0 rounded-full border-2",
                    isCurrent
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40 bg-background",
                  )}
                />
                {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
              </div>

              <div className={cn("flex-1", isLast ? "pb-0" : "pb-6")}>
                <div
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border p-4 transition-colors",
                    isMatch && "border-primary ring-1 ring-primary",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {localizedName(assignment.job_title, locale)}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {localizedName(assignment.department, locale)}
                    </span>

                    {isCurrent && (
                      <Badge variant="default">{dict.history.current}</Badge>
                    )}
                    {isMatch && (
                      <Badge variant="outline">{dict.history.asOfInForce}</Badge>
                    )}
                  </div>

                  <dl className="grid gap-3 sm:grid-cols-3">
                    <Detail
                      label={dict.history.from}
                      value={formatDate(assignment.valid_from, locale)}
                    />
                    <Detail
                      label={dict.history.to}
                      value={
                        assignment.valid_to
                          ? formatDate(assignment.valid_to, locale)
                          : dict.history.ongoing
                      }
                    />
                    <Detail
                      label={dict.employees.manager}
                      value={
                        assignment.manager?.person
                          ? personName(assignment.manager.person, locale)
                          : dict.employees.noManager
                      }
                    />
                  </dl>

                  {/* What actually changed, so the reader doesn't diff by eye. */}
                  {isOldest ? (
                    <p className="text-xs text-muted-foreground">
                      {dict.history.initial}
                    </p>
                  ) : (
                    changes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {dict.history.changed}:
                        </span>
                        {changes.map((change) => (
                          <Badge key={change} variant="secondary">
                            {change === "department"
                              ? dict.history.changedDepartment
                              : change === "jobTitle"
                                ? dict.history.changedJobTitle
                                : dict.history.changedManager}
                          </Badge>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
