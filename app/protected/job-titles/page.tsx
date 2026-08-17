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
import { localizedName } from "@/lib/hr/format";
import { listJobTitles } from "@/lib/hr/job-titles";
import { getI18n } from "@/lib/i18n/server";

export default async function JobTitlesPage() {
  await requireUser();
  const { dict, locale } = await getI18n();
  const jobTitles = await listJobTitles();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{dict.jobTitles.title}</h1>
          <p className="text-sm text-muted-foreground">
            {dict.jobTitles.subtitle}
          </p>
        </div>
        <Button asChild>
          <Link href="/protected/job-titles/new">
            <Plus size={16} />
            {dict.jobTitles.newTitle}
          </Link>
        </Button>
      </header>

      {jobTitles.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {dict.jobTitles.empty}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.jobTitles.columnName}</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobTitles.map((jobTitle) => (
              <TableRow key={jobTitle.id}>
                <TableCell className="font-medium">
                  {localizedName(jobTitle, locale)}
                </TableCell>
                <TableCell className="text-end">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/protected/job-titles/${jobTitle.id}/edit`}>
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
