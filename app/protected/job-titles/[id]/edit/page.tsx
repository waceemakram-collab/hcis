import { notFound } from "next/navigation";

import { requireUser } from "@/lib/hr/auth";
import { getJobTitle } from "@/lib/hr/job-titles";
import { getI18n } from "@/lib/i18n/server";

import { updateJobTitle } from "../../actions";
import { JobTitleForm } from "../../job-title-form";

export default async function EditJobTitlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { dict } = await getI18n();

  const jobTitle = await getJobTitle(id);
  if (!jobTitle) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">
        {dict.common.edit} · {jobTitle.name_en}
      </h1>
      <JobTitleForm action={updateJobTitle} jobTitle={jobTitle} />
    </div>
  );
}
