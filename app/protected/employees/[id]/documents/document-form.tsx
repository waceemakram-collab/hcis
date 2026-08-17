"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Field, FormError, SubmitButton, fieldError } from "@/components/hr/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IDLE_STATE, type ActionState } from "@/lib/hr/action-state";
import { DOCUMENT_TYPES, type DocumentType, type HrDocument } from "@/lib/hr/types";
import { useI18n } from "@/lib/i18n/provider";

export function DocumentForm({
  action,
  personId,
  employmentId,
  document,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  personId: string;
  employmentId: string;
  /** Absent when adding. */
  document?: HrDocument;
}) {
  const { dict } = useI18n();
  const [state, formAction] = useActionState(action, IDLE_STATE);
  const [type, setType] = useState<DocumentType>(
    document?.document_type ?? "passport",
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <input type="hidden" name="person_id" value={personId} />
      <input type="hidden" name="employment_id" value={employmentId} />
      {document && (
        <input type="hidden" name="document_id" value={document.id} />
      )}

      <FormError state={state} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="document_type"
          label={dict.documents.type}
          required
          error={fieldError(state, "document_type")}
        >
          <Select
            id="document_type"
            name="document_type"
            required
            value={type}
            onChange={(event) => setType(event.target.value as DocumentType)}
          >
            {DOCUMENT_TYPES.map((value) => (
              <option key={value} value={value}>
                {dict.documentType[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          name="document_number"
          label={dict.documents.number}
          error={fieldError(state, "document_number")}
        >
          <Input
            id="document_number"
            name="document_number"
            dir="ltr"
            defaultValue={document?.document_number ?? ""}
          />
        </Field>

        {/* Only meaningful for a free-text type — asking for a description of
            "Passport" would just be noise. */}
        {type === "other" && (
          <Field
            name="description"
            label={dict.documents.description}
            hint={dict.documents.descriptionHelp}
            className="sm:col-span-2"
          >
            <Input
              id="description"
              name="description"
              defaultValue={document?.description ?? ""}
            />
          </Field>
        )}

        <Field
          name="issuing_country"
          label={dict.documents.issuingCountry}
          hint={dict.documents.issuingCountryHelp}
        >
          <Input
            id="issuing_country"
            name="issuing_country"
            dir="ltr"
            maxLength={2}
            placeholder="SA"
            className="uppercase"
            defaultValue={document?.issuing_country ?? ""}
          />
        </Field>

        <Field
          name="issue_date"
          label={dict.documents.issueDate}
          error={fieldError(state, "issue_date")}
        >
          <Input
            id="issue_date"
            name="issue_date"
            type="date"
            dir="ltr"
            defaultValue={document?.issue_date ?? ""}
          />
        </Field>

        <Field
          name="expiry_date"
          label={dict.documents.expiryDate}
          required
          hint={dict.documents.expiryDateHelp}
          error={fieldError(state, "expiry_date")}
        >
          <Input
            id="expiry_date"
            name="expiry_date"
            type="date"
            dir="ltr"
            required
            defaultValue={document?.expiry_date ?? ""}
          />
        </Field>
      </div>

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
          <Link href={`/protected/employees/${employmentId}`}>
            {dict.common.cancel}
          </Link>
        </Button>
      </div>
    </form>
  );
}
