"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field, FormError, SubmitButton, fieldError } from "@/components/hr/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IDLE_STATE, type ActionState } from "@/lib/hr/action-state";
import { localizedName } from "@/lib/hr/format";
import type { Department } from "@/lib/hr/types";
import { useI18n } from "@/lib/i18n/provider";

export function DepartmentForm({
  action,
  department,
  parentOptions,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  department?: Department;
  parentOptions: Department[];
}) {
  const { dict, locale } = useI18n();
  const [state, formAction] = useActionState(action, IDLE_STATE);

  // A department cannot be its own parent. Deeper loops are caught server-side.
  const options = parentOptions.filter((d) => d.id !== department?.id);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      {department && <input type="hidden" name="id" value={department.id} />}

      <FormError state={state} />

      <Field
        name="name_en"
        label={dict.departments.nameEn}
        required
        error={fieldError(state, "name_en")}
      >
        <Input
          id="name_en"
          name="name_en"
          defaultValue={department?.name_en ?? ""}
          required
          dir="ltr"
        />
      </Field>

      <Field name="name_ar" label={dict.departments.nameAr}>
        <Input
          id="name_ar"
          name="name_ar"
          defaultValue={department?.name_ar ?? ""}
          dir="rtl"
        />
      </Field>

      <Field
        name="parent_id"
        label={dict.departments.parent}
        error={fieldError(state, "parent_id")}
      >
        <Select
          id="parent_id"
          name="parent_id"
          defaultValue={department?.parent_id ?? ""}
        >
          <option value="">{dict.departments.noParent}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {localizedName(option, locale)}
            </option>
          ))}
        </Select>
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
          <Link href="/protected/departments">{dict.common.cancel}</Link>
        </Button>
      </div>
    </form>
  );
}
