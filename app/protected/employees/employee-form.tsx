"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  Field,
  FormError,
  SectionHeading,
  SubmitButton,
  fieldError,
} from "@/components/hr/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IDLE_STATE, type ActionState } from "@/lib/hr/action-state";
import { formatDate, localizedName, personName, todayInRiyadh } from "@/lib/hr/format";
import {
  EMPLOYMENT_TYPES,
  type Department,
  type JobTitle,
  type ManagerOption,
} from "@/lib/hr/types";
import { useI18n } from "@/lib/i18n/provider";

export function EmployeeForm({
  action,
  departments,
  jobTitles,
  managers,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  departments: Department[];
  jobTitles: JobTitle[];
  managers: ManagerOption[];
}) {
  const { dict, locale } = useI18n();
  const [state, formAction] = useActionState(action, IDLE_STATE);

  // Mirrored into state only so the assignment section can show which date the
  // first assignment will start on. The server uses the submitted hire_date.
  const [hireDate, setHireDate] = useState(todayInRiyadh());

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-8">
      <FormError state={state} />

      {/* ---------------------------------------------------------------- */}
      <section className="flex flex-col gap-5">
        <SectionHeading
          title={dict.employees.sectionPerson}
          help={dict.employees.sectionPersonHelp}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="first_name_en"
            label={dict.employees.firstNameEn}
            required
            error={fieldError(state, "first_name_en")}
          >
            <Input id="first_name_en" name="first_name_en" required dir="ltr" />
          </Field>

          <Field
            name="last_name_en"
            label={dict.employees.lastNameEn}
            required
            error={fieldError(state, "last_name_en")}
          >
            <Input id="last_name_en" name="last_name_en" required dir="ltr" />
          </Field>

          <Field name="first_name_ar" label={dict.employees.firstNameAr}>
            <Input id="first_name_ar" name="first_name_ar" dir="rtl" />
          </Field>

          <Field name="last_name_ar" label={dict.employees.lastNameAr}>
            <Input id="last_name_ar" name="last_name_ar" dir="rtl" />
          </Field>

          <Field name="email" label={dict.employees.email}>
            <Input id="email" name="email" type="email" dir="ltr" />
          </Field>

          <Field name="phone" label={dict.employees.phone}>
            <Input id="phone" name="phone" type="tel" dir="ltr" />
          </Field>

          <Field name="nationality" label={dict.employees.nationality}>
            <Input
              id="nationality"
              name="nationality"
              dir="ltr"
              maxLength={2}
              placeholder="SA"
              className="uppercase"
            />
          </Field>

          <Field
            name="national_id"
            label={dict.employees.nationalId}
            error={fieldError(state, "national_id")}
          >
            <Input id="national_id" name="national_id" dir="ltr" />
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
            />
          </Field>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="flex flex-col gap-5">
        <SectionHeading
          title={dict.employees.sectionEmployment}
          help={dict.employees.sectionEmploymentHelp}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="hire_date"
            label={dict.employees.hireDate}
            required
            error={fieldError(state, "hire_date")}
          >
            <Input
              id="hire_date"
              name="hire_date"
              type="date"
              required
              dir="ltr"
              value={hireDate}
              onChange={(event) => setHireDate(event.target.value)}
            />
          </Field>

          <Field
            name="employment_type"
            label={dict.employees.employmentType}
            required
            error={fieldError(state, "employment_type")}
          >
            <Select
              id="employment_type"
              name="employment_type"
              defaultValue="full_time"
              required
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {dict.employmentType[type]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="flex flex-col gap-5">
        <SectionHeading
          title={dict.employees.sectionAssignment}
          help={dict.employees.sectionAssignmentHelp}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="department_id"
            label={dict.employees.department}
            required
            error={fieldError(state, "department_id")}
          >
            <Select id="department_id" name="department_id" required defaultValue="">
              <option value="" disabled>
                {dict.common.none}
              </option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {localizedName(department, locale)}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            name="job_title_id"
            label={dict.employees.jobTitle}
            required
            error={fieldError(state, "job_title_id")}
          >
            <Select id="job_title_id" name="job_title_id" required defaultValue="">
              <option value="" disabled>
                {dict.common.none}
              </option>
              {jobTitles.map((jobTitle) => (
                <option key={jobTitle.id} value={jobTitle.id}>
                  {localizedName(jobTitle, locale)}
                </option>
              ))}
            </Select>
          </Field>

          <Field name="manager_employment_id" label={dict.employees.manager}>
            <Select
              id="manager_employment_id"
              name="manager_employment_id"
              defaultValue=""
            >
              <option value="">{dict.employees.noManager}</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {personName(manager.person, locale)}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-col justify-end gap-1.5 pb-1">
            <span className="text-sm text-muted-foreground">
              {dict.employees.effectiveFrom}
            </span>
            <span className="text-sm font-medium">
              {hireDate ? formatDate(hireDate, locale) : dict.common.none}
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <Field name="reason" label={dict.common.reason} className="max-w-xl">
        <Input
          id="reason"
          name="reason"
          placeholder={dict.common.reasonPlaceholder}
        />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton label={dict.common.create} />
        <Button variant="ghost" asChild>
          <Link href="/protected/employees">{dict.common.cancel}</Link>
        </Button>
      </div>
    </form>
  );
}
