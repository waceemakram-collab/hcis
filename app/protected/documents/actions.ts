"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/hr/auth";
import { writeAudit } from "@/lib/hr/audit";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/hr/types";
import {
  failure,
  optionalText,
  type ActionState,
} from "@/lib/hr/action-state";

const COLUMNS =
  "id, person_id, document_type, description, document_number, issuing_country, issue_date, expiry_date, created_at";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isDocumentType(value: string | null): value is DocumentType {
  return value !== null && (DOCUMENT_TYPES as readonly string[]).includes(value);
}

type Parsed = {
  documentType: DocumentType;
  description: string | null;
  documentNumber: string | null;
  issuingCountry: string | null;
  issueDate: string | null;
  expiryDate: string;
};

/** Shared validation. Returns either the parsed values or an ActionState to
 *  hand straight back to the form. */
function parse(formData: FormData): Parsed | ActionState {
  const documentType = optionalText(formData.get("document_type"));
  const issueDate = optionalText(formData.get("issue_date"));
  const expiryDate = optionalText(formData.get("expiry_date"));

  const fieldErrors: Record<string, "required" | "invalidDate"> = {};

  if (!isDocumentType(documentType)) fieldErrors.document_type = "required";
  if (!expiryDate) fieldErrors.expiry_date = "required";
  else if (!ISO_DATE.test(expiryDate)) fieldErrors.expiry_date = "invalidDate";
  if (issueDate && !ISO_DATE.test(issueDate)) fieldErrors.issue_date = "invalidDate";

  // The DB has the same check, but catching it here names the offending field
  // instead of returning a generic constraint violation.
  if (issueDate && expiryDate && expiryDate < issueDate) {
    fieldErrors.expiry_date = "invalidDate";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return failure("required", fieldErrors);
  }
  if (!isDocumentType(documentType) || !expiryDate) {
    return failure("generic");
  }

  return {
    documentType,
    description: optionalText(formData.get("description")),
    documentNumber: optionalText(formData.get("document_number")),
    issuingCountry: optionalText(formData.get("issuing_country")),
    issueDate,
    expiryDate,
  };
}

function isActionState(value: Parsed | ActionState): value is ActionState {
  return "status" in value;
}

export async function createDocument(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const personId = optionalText(formData.get("person_id"));
  const employmentId = optionalText(formData.get("employment_id"));
  const reason = optionalText(formData.get("reason"));

  if (!personId || !employmentId) return failure("generic");

  const parsed = parse(formData);
  if (isActionState(parsed)) return parsed;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      person_id: personId,
      document_type: parsed.documentType,
      description: parsed.description,
      document_number: parsed.documentNumber,
      issuing_country: parsed.issuingCountry,
      issue_date: parsed.issueDate,
      expiry_date: parsed.expiryDate,
    })
    .select(COLUMNS)
    .single();

  if (error || !data) return failure("generic");

  await writeAudit({
    tableName: "documents",
    recordId: data.id,
    action: "insert",
    after: data,
    reason,
  });

  revalidatePath("/protected/documents");
  revalidatePath(`/protected/employees/${employmentId}`);
  redirect(`/protected/employees/${employmentId}`);
}

/**
 * Updates a document in place — including renewals.
 *
 * Waseem chose in-place updates over inserting a new row per renewal. The
 * consequence is that a superseded passport or Iqama number lives only in
 * `audit_log`'s before/after, not in a queryable table. That is real coverage
 * for an audit, but it is not visible in the UI, which is why `before` is read
 * and recorded here rather than skipped.
 */
export async function updateDocument(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const documentId = optionalText(formData.get("document_id"));
  const employmentId = optionalText(formData.get("employment_id"));
  const reason = optionalText(formData.get("reason"));

  if (!documentId || !employmentId) return failure("generic");

  const parsed = parse(formData);
  if (isActionState(parsed)) return parsed;

  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase
    .from("documents")
    .select(COLUMNS)
    .eq("id", documentId)
    .maybeSingle();

  if (beforeError || !before) return failure("generic");

  const { data: after, error } = await supabase
    .from("documents")
    .update({
      document_type: parsed.documentType,
      description: parsed.description,
      document_number: parsed.documentNumber,
      issuing_country: parsed.issuingCountry,
      issue_date: parsed.issueDate,
      expiry_date: parsed.expiryDate,
    })
    .eq("id", documentId)
    .select(COLUMNS)
    .single();

  if (error || !after) return failure("generic");

  await writeAudit({
    tableName: "documents",
    recordId: documentId,
    action: "update",
    before,
    after,
    reason,
  });

  revalidatePath("/protected/documents");
  revalidatePath(`/protected/employees/${employmentId}`);
  redirect(`/protected/employees/${employmentId}`);
}
