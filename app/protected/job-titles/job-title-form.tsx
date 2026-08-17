"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field, FormError, SubmitButton, fieldError } from "@/components/hr/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IDLE_STATE, type ActionState } from "@/lib/hr/action-state";
import type { JobTitle } from "@/lib/hr/types";
import { useI18n } from "@/lib/i18n/provider";

export function JobTitleForm({
  action,
  jobTitle,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  jobTitle?: JobTitle;
}) {
  const { dict } = useI18n();
  const [state, formAction] = useActionState(action, IDLE_STATE);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      {jobTitle && <input type="hidden" name="id" value={jobTitle.id} />}

      <FormError state={state} />

      <Field
        name="name_en"
        label={dict.jobTitles.nameEn}
        required
        error={fieldError(state, "name_en")}
      >
        <Input
          id="name_en"
          name="name_en"
          defaultValue={jobTitle?.name_en ?? ""}
          required
          dir="ltr"
        />
      </Field>

      <Field name="name_ar" label={dict.jobTitles.nameAr}>
        <Input
          id="name_ar"
          name="name_ar"
          defaultValue={jobTitle?.name_ar ?? ""}
          dir="rtl"
        />
      </Field>

      <Field name="reason" label={dict.common.reason}>
        <Input
          id="reason"
          name="reason"
          placeholder={dict.common.reasonPlaceholder}
        />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton />
        <Button variant="ghost" asChild>
          <Link href="/protected/job-titles">{dict.common.cancel}</Link>
        </Button>
      </div>
    </form>
  );
}
