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
import { dayAfter } from "@/lib/hr/assignments";
import { formatDate, localizedName, personName, todayInRiyadh } from "@/lib/hr/format";
import type {
  AssignmentWithManager,
  Department,
  JobTitle,
  ManagerOption,
} from "@/lib/hr/types";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type Mode = "change" | "correction";

function ModeCard({
  value,
  selected,
  onSelect,
  title,
  help,
}: {
  value: Mode;
  selected: Mode;
  onSelect: (mode: Mode) => void;
  title: string;
  help: string;
}) {
  const isSelected = selected === value;

  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors",
        isSelected ? "border-primary bg-accent/50" : "hover:bg-accent/30",
      )}
    >
      <div className="flex items-center gap-2">
        <input
          type="radio"
          name="mode"
          value={value}
          checked={isSelected}
          onChange={() => onSelect(value)}
        />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <span className="text-xs text-muted-foreground">{help}</span>
    </label>
  );
}

export function AssignmentForm({
  action,
  employmentId,
  current,
  departments,
  jobTitles,
  managers,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  employmentId: string;
  current: AssignmentWithManager;
  departments: Department[];
  jobTitles: JobTitle[];
  managers: ManagerOption[];
}) {
  const { dict, locale } = useI18n();
  const [state, formAction] = useActionState(action, IDLE_STATE);
  const [mode, setMode] = useState<Mode>("change");

  const earliest = dayAfter(current.valid_from);
  const today = todayInRiyadh();
  const defaultEffective = today > earliest ? today : earliest;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="employment_id" value={employmentId} />

      <SectionHeading
        title={dict.edit.assignmentSection}
        help={dict.edit.assignmentHelp}
      />

      <FormError state={state} />

      <div className="rounded-md bg-muted/50 p-3 text-sm">
        <span className="text-muted-foreground">
          {dict.edit.currentValues}:{" "}
        </span>
        {localizedName(current.job_title, locale)} ·{" "}
        {localizedName(current.department, locale)} ·{" "}
        {current.manager?.person
          ? personName(current.manager.person, locale)
          : dict.employees.noManager}
        <span className="text-muted-foreground">
          {" "}
          — {dict.edit.currentSince} {formatDate(current.valid_from, locale)}
        </span>
      </div>

      {/* The distinction that keeps history honest. */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">
          {dict.edit.modeLabel}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeCard
            value="change"
            selected={mode}
            onSelect={setMode}
            title={dict.edit.modeChange}
            help={dict.edit.modeChangeHelp}
          />
          <ModeCard
            value="correction"
            selected={mode}
            onSelect={setMode}
            title={dict.edit.modeCorrection}
            help={dict.edit.modeCorrectionHelp}
          />
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="department_id"
          label={dict.employees.department}
          required
          error={fieldError(state, "department_id")}
        >
          <Select
            id="department_id"
            name="department_id"
            required
            defaultValue={current.department_id}
          >
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
          <Select
            id="job_title_id"
            name="job_title_id"
            required
            defaultValue={current.job_title_id}
          >
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
            defaultValue={current.manager_employment_id ?? ""}
          >
            <option value="">{dict.employees.noManager}</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {personName(manager.person, locale)}
              </option>
            ))}
          </Select>
        </Field>

        {/* Only a real change has an effective date. A correction rewrites a
            record that was never right, so it does not start on a new day. */}
        {mode === "change" && (
          <Field
            name="effective_from"
            label={dict.edit.effectiveFrom}
            required
            hint={dict.edit.effectiveFromHelp}
            error={fieldError(state, "effective_from")}
          >
            <Input
              id="effective_from"
              name="effective_from"
              type="date"
              dir="ltr"
              required
              min={earliest}
              defaultValue={defaultEffective}
            />
          </Field>
        )}
      </div>

      <Field name="reason" label={dict.common.reason} className="max-w-xl">
        <Input
          id="reason"
          name="reason"
          placeholder={dict.common.reasonPlaceholder}
        />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton label={dict.edit.saveAssignment} />
        <Button variant="ghost" asChild>
          <Link href={`/protected/employees/${employmentId}`}>
            {dict.common.cancel}
          </Link>
        </Button>
      </div>
    </form>
  );
}
