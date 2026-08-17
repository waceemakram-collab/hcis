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
import { Select } from "@/components/ui/select";
import { IDLE_STATE, type ActionState } from "@/lib/hr/action-state";
import { dayAfter } from "@/lib/hr/assignments";
import { localizedName, personName, todayInRiyadh } from "@/lib/hr/format";
import {
  EMPLOYMENT_TYPES,
  type Department,
  type JobTitle,
  type ManagerOption,
} from "@/lib/hr/types";
import { useI18n } from "@/lib/i18n/provider";

export function RehireForm({
  action,
  personId,
  previousEmploymentId,
  previousTerminationDate,
  departments,
  jobTitles,
  managers,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  personId: string;
  previousEmploymentId: string;
  previousTerminationDate: string;
  departments: Department[];
  jobTitles: JobTitle[];
  managers: ManagerOption[];
}) {
  const { dict, locale } = useI18n();
  const [state, formAction] = useActionState(action, IDLE_STATE);

  // Nobody starts before their previous employment ended. That date is the last
  // working day, inclusive, so the earliest legal restart is the day after.
  const earliest = dayAfter(previousTerminationDate);
  const today = todayInRiyadh();
  const defaultHireDate = today > earliest ? today : earliest;

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      <input type="hidden" name="person_id" value={personId} />

      <FormError state={state} />

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
              dir="ltr"
              required
              min={earliest}
              defaultValue={defaultHireDate}
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
              required
              defaultValue="full_time"
            >
              {EMPLOYMENT_TYPES.map((value) => (
                <option key={value} value={value}>
                  {dict.employmentType[value]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

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
        </div>
      </section>

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
          <Link href={`/protected/employees/${previousEmploymentId}`}>
            {dict.common.cancel}
          </Link>
        </Button>
      </div>
    </form>
  );
}
