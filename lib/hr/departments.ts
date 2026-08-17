import { createClient } from "@/lib/supabase/server";
import type { Department, DepartmentWithParent } from "./types";

/** Read paths only. Mutations live in `app/protected/departments/actions.ts`. */

/**
 * Departments with their parent resolved.
 *
 * The parent is stitched together in JavaScript rather than with a PostgREST
 * embed (`parent:departments!departments_parent_id_fkey(...)`). A self-referencing
 * embed has to be resolved from PostgREST's cached schema, which goes stale after
 * a migration and fails with "Could not find a relationship between 'departments'
 * and 'departments' in the schema cache" until the cache reloads.
 *
 * Not worth that fragility here: this is a small reference table we already read
 * in full, so building the lookup locally is one round trip instead of an embed,
 * and it cannot break on a cache refresh.
 */
export async function listDepartments(): Promise<DepartmentWithParent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("id, name_en, name_ar, parent_id, created_at")
    .order("name_en", { ascending: true })
    .returns<Department[]>();

  if (error) throw new Error(`Failed to load departments: ${error.message}`);

  const rows = data ?? [];
  const byId = new Map(rows.map((row) => [row.id, row]));

  return rows.map((row) => {
    const parent = row.parent_id ? byId.get(row.parent_id) : undefined;
    return {
      ...row,
      parent: parent
        ? { id: parent.id, name_en: parent.name_en, name_ar: parent.name_ar }
        : null,
    };
  });
}

/** Flat list for <select> options. */
export async function listDepartmentOptions(): Promise<Department[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("id, name_en, name_ar, parent_id, created_at")
    .order("name_en", { ascending: true })
    .returns<Department[]>();

  if (error) throw new Error(`Failed to load departments: ${error.message}`);
  return data ?? [];
}

export async function getDepartment(id: string): Promise<Department | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("id, name_en, name_ar, parent_id, created_at")
    .eq("id", id)
    .maybeSingle<Department>();

  if (error) throw new Error(`Failed to load department: ${error.message}`);
  return data;
}

/**
 * Walks up the parent chain to check whether `candidateParentId` sits beneath
 * `departmentId`. The database blocks a department being its own parent, but a
 * longer cycle (A -> B -> A) has to be caught here — see CLAUDE.md.
 */
export async function wouldCreateCycle(
  departmentId: string,
  candidateParentId: string | null,
): Promise<boolean> {
  if (!candidateParentId) return false;
  if (candidateParentId === departmentId) return true;

  const all = await listDepartmentOptions();
  const parentOf = new Map(all.map((d) => [d.id, d.parent_id]));

  let cursor: string | null = candidateParentId;
  const seen = new Set<string>();

  while (cursor) {
    if (cursor === departmentId) return true;
    if (seen.has(cursor)) return true; // pre-existing cycle; refuse to add to it
    seen.add(cursor);
    cursor = parentOf.get(cursor) ?? null;
  }

  return false;
}
