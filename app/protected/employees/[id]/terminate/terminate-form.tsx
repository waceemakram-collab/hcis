"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field, FormError, SubmitButton, fieldError } from "@/components/hr/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IDLE_STATE, type ActionState } from "@/lib/hr/action-state";
import { todayInRiyadh } from "@/lib/hr/format";
import { TERMINATION_REASONS } from "@/lib/hr/types";
import { useI18n } from "@/lib/i18n/provider";

export function TerminateForm({
  action,
  employmentId,
  hireDate,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  employmentId: string;
  hireDate: string;
}) {
  const { dict } = useI18n();
  const [state, formAction] = useActionState(action, IDLE_STATE);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <input type="hidden" name="employment_id" value={employmentId} />

      <FormError state={state} />

      <Field
        name="termination_date"
        label={dict.termination.lastWorkingDay}
        required
        hint={dict.termination.lastWorkingDayHelp}
        error={fieldError(state, "termination_date")}
      >
        <Input
          id="termination_date"
          name="termination_date"
          type="date"
          dir="ltr"
          required
          min={hireDate}
          defaultValue={todayInRiyadh()}
        />
      </Field>

      <Field
        name="termination_reason"
        label={dict.termination.reason}
        required
        error={fieldError(state, "termination_reason")}
      >
        <Select
          id="termination_reason"
          name="termination_reason"
          required
          defaultValue=""
        >
          <option value="" disabled>
            {dict.common.none}
          </option>
          {TERMINATION_REASONS.map((value) => (
            <option key={value} value={value}>
              {dict.terminationReason[value]}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        name="termination_notes"
        label={dict.termination.notes}
        hint={dict.termination.notesHelp}
      >
        <Input id="termination_notes" name="termination_notes" />
      </Field>

      <Field name="reason" label={dict.common.reason}>
        <Input
          id="reason"
          name="reason"
          placeholder={dict.common.reasonPlaceholder}
        />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton label={dict.termination.confirm} />
        <Button variant="ghost" asChild>
          <Link href={`/protected/employees/${employmentId}`}>
            {dict.common.cancel}
          </Link>
        </Button>
      </div>
    </form>
  );
}
