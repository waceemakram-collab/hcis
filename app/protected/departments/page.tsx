import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/hr/auth";
import { listDepartments } from "@/lib/hr/departments";
import { localizedName } from "@/lib/hr/format";
import { getI18n } from "@/lib/i18n/server";

export default async function DepartmentsPage() {
  await requireUser();
  const { dict, locale } = await getI18n();
  const departments = await listDepartments();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{dict.departments.title}</h1>
          <p className="text-sm text-muted-foreground">
            {dict.departments.subtitle}
          </p>
        </div>
        <Button asChild>
          <Link href="/protected/departments/new">
            <Plus size={16} />
            {dict.departments.newTitle}
          </Link>
        </Button>
      </header>

      {departments.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {dict.departments.empty}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.departments.columnName}</TableHead>
              <TableHead>{dict.departments.columnParent}</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">
                  {localizedName(department, locale)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {department.parent
                    ? localizedName(department.parent, locale)
                    : dict.common.none}
                </TableCell>
                <TableCell className="text-end">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/protected/departments/${department.id}/edit`}>
                      {dict.common.edit}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
