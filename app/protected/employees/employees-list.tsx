"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
import { currentAssignment } from "@/lib/hr/assignments";
import { formatDate, localizedName, personName } from "@/lib/hr/format";
import type { EmployeeListRow } from "@/lib/hr/types";
import { useI18n } from "@/lib/i18n/provider";

export function EmployeesList({ employees }: { employees: EmployeeListRow[] }) {
  const { dict, locale } = useI18n();
  const [showFormer, setShowFormer] = useState(false);

  // Leavers are hidden by default, matching the document dashboard. Without
  // this the list becomes mostly people who no longer work here.
  const visible = useMemo(
    () => employees.filter((e) => showFormer || e.termination_date === null),
    [employees, showFormer],
  );

  const formerCount = employees.length - employees.filter((e) => e.termination_date === null).length;

  return (
    <div className="flex flex-col gap-4">
      {formerCount > 0 && (
        <label className="flex cursor-pointer items-center gap-2 self-start text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showFormer}
            onChange={(event) => setShowFormer(event.target.checked)}
          />
          {dict.employees.showFormer} ({formerCount})
        </label>
      )}

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {employees.length === 0
            ? dict.employees.empty
            : dict.documents.emptyFiltered}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.employees.columnName}</TableHead>
              <TableHead>{dict.employees.columnJobTitle}</TableHead>
              <TableHead>{dict.employees.columnDepartment}</TableHead>
              <TableHead>{dict.employees.columnHireDate}</TableHead>
              <TableHead>{dict.employees.columnStatus}</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((employee) => {
              const assignment = currentAssignment(employee.assignments);

              return (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {personName(employee.person, locale)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {assignment
                      ? localizedName(assignment.job_title, locale)
                      : dict.common.none}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {assignment
                      ? localizedName(assignment.department, locale)
                      : dict.common.none}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(employee.hire_date, locale)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        employee.status === "active" ? "default" : "secondary"
                      }
                    >
                      {dict.status[employee.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/protected/employees/${employee.id}`}>
                        {dict.common.view}
                      </Link>
                    </Button>
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
