import { createClient } from "@/lib/supabase/server";
import type { DocumentWithPerson, HrDocument } from "./types";

/** Read paths only. Mutations live in `app/protected/documents/actions.ts`. */

const COLUMNS =
  "id, person_id, document_type, description, document_number, issuing_country, issue_date, expiry_date, created_at";

/**
 * Every document, with enough of the person attached to render the dashboard.
 *
 * `employments` comes along so the caller can tell current staff from leavers
 * and link the row to the right employment record. Filtering happens in the
 * page rather than the query: the toggle for "include former employees" is
 * client-side, so both sets have to be present.
 */
export async function listDocuments(): Promise<DocumentWithPerson[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
        ${COLUMNS},
        person:persons!documents_person_id_fkey (
          id, first_name_en, last_name_en, first_name_ar, last_name_ar,
          employments:employments!employments_person_id_fkey ( id, termination_date )
        )
      `,
    )
    .order("expiry_date", { ascending: true })
    .returns<DocumentWithPerson[]>();

  if (error) throw new Error(`Failed to load documents: ${error.message}`);
  return data ?? [];
}

/** One person's documents, soonest expiry first. */
export async function listDocumentsForPerson(
  personId: string,
): Promise<HrDocument[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select(COLUMNS)
    .eq("person_id", personId)
    .order("expiry_date", { ascending: true })
    .returns<HrDocument[]>();

  if (error) throw new Error(`Failed to load documents: ${error.message}`);
  return data ?? [];
}

export async function getDocument(id: string): Promise<HrDocument | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle<HrDocument>();

  if (error) throw new Error(`Failed to load document: ${error.message}`);
  return data;
}
