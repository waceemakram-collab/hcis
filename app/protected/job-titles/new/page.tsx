import { requireUser } from "@/lib/hr/auth";
import { getI18n } from "@/lib/i18n/server";

import { createJobTitle } from "../actions";
import { JobTitleForm } from "../job-title-form";

export default async function NewJobTitlePage() {
  await requireUser();
  const { dict } = await getI18n();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{dict.jobTitles.newTitle}</h1>
      <JobTitleForm action={createJobTitle} />
    </div>
  );
}
