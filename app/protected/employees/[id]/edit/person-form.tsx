"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  Field,
  FormError,
  SectionHeading,
  SubmitButton,
  fieldError,
} from "@/components/hr/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IDLE_STATE, type ActionState } from "@/lib/hr/action-state";
import type { Person } from "@/lib/hr/types";
import { useI18n } from "@/lib/i18n/provider";

export function PersonForm({
  action,
  person,
  employmentId,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  person: Person;
  employmentId: string;
}) {
  const { dict } = useI18n();
  const [state, formAction] = useActionState(action, IDLE_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="person_id" value={person.id} />
      <input type="hidden" name="employment_id" value={employmentId} />

      <SectionHeading
        title={dict.edit.personSection}
        help={dict.edit.personHelp}
      />

      <FormError state={state} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="first_name_en"
          label={dict.employees.firstNameEn}
          required
          error={fieldError(state, "first_name_en")}
        >
          <Input
            id="first_name_en"
            name="first_name_en"
            dir="ltr"
            required
            defaultValue={person.first_name_en}
          />
        </Field>

        <Field
          name="last_name_en"
          label={dict.employees.lastNameEn}
          required
          error={fieldError(state, "last_name_en")}
        >
          <Input
            id="last_name_en"
            name="last_name_en"
            dir="ltr"
            required
            defaultValue={person.last_name_en}
          />
        </Field>

        <Field name="first_name_ar" label={dict.employees.firstNameAr}>
          <Input
            id="first_name_ar"
            name="first_name_ar"
            dir="rtl"
            defaultValue={person.first_name_ar ?? ""}
          />
        </Field>

        <Field name="last_name_ar" label={dict.employees.lastNameAr}>
          <Input
            id="last_name_ar"
            name="last_name_ar"
            dir="rtl"
            defaultValue={person.last_name_ar ?? ""}
          />
        </Field>

        <Field name="email" label={dict.employees.email}>
          <Input
            id="email"
            name="email"
            type="email"
            dir="ltr"
            defaultValue={person.email ?? ""}
          />
        </Field>

        <Field name="phone" label={dict.employees.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            defaultValue={person.phone ?? ""}
          />
        </Field>

        <Field name="nationality" label={dict.employees.nationality}>
          <Input
            id="nationality"
            name="nationality"
            dir="ltr"
            maxLength={2}
            className="uppercase"
            defaultValue={person.nationality ?? ""}
          />
        </Field>

        <Field
          name="national_id"
          label={dict.employees.nationalId}
          error={fieldError(state, "national_id")}
        >
          <Input
            id="national_id"
            name="national_id"
            dir="ltr"
            defaultValue={person.national_id ?? ""}
          />
        </Field>

        <Field
          name="date_of_birth"
          label={dict.employees.dateOfBirth}
          error={fieldError(state, "date_of_birth")}
        >
          <Input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            dir="ltr"
            defaultValue={person.date_of_birth ?? ""}
          />
        </Field>
      </div>

      <Field name="reason" label={dict.common.reason} className="max-w-xl">
        <Input
          id="reason"
          name="reason"
          placeholder={dict.common.reasonPlaceholder}
        />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton label={dict.edit.savePerson} />
        <Button variant="ghost" asChild>
          <Link href={`/protected/employees/${employmentId}`}>
            {dict.common.cancel}
          </Link>
        </Button>
      </div>
    </form>
  );
}
