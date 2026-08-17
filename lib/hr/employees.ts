import { createClient } from "@/lib/supabase/server";
import type {
  EmployeeDetail,
  EmployeeListRow,
  ManagerOption,
} from "./types";

/**
 * Read paths only. Mutations live in `app/protected/employees/actions.ts`.
 *
 * Note on identity: an "employee" is keyed by EMPLOYMENT id, not person id.
 * "Employee" is a derived state — a person who holds an employment (CLAUDE.md
 * rule 3) — and a rehired person legitimately appears twice, once per period.
 * Assignments hang off the employment, so this is also what Sessions 2 and 3
 * need to navigate history.
 *
 * `assignments` has two foreign keys to `employments` (the employee and their
 * manager), so every embed below names the constraint explicitly. Without the
 * hint PostgREST cannot tell which relationship is meant and errors out.
 */

const LIST_SELECT = `
  id, person_id, hire_date, termination_date, termination_reason, termination_notes, employment_type, status, created_at,
  person:persons!employments_person_id_fkey (
    id, first_name_en, last_name_en, first_name_ar, last_name_ar
  ),
  assignments:assignments!assignments_employment_id_fkey (
    id, employment_id, department_id, job_title_id, manager_employment_id,
    valid_from, valid_to,
    department:departments!assignments_department_id_fkey ( id, name_en, name_ar ),
    job_title:job_titles!assignments_job_title_id_fkey ( id, name_en, name_ar )
  )
`;

/** Employment rows joined to the person and their CURRENT assignment only. */
export async function listEmployees(): Promise<EmployeeListRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("employments")
    .select(LIST_SELECT)
    // valid_to IS NULL means "current" — see CLAUDE.md rule 2. This filters the
    // embedded array, so an employment with no current assignment still appears
    // (with an empty array) rather than dropping out of the list.
    .is("assignments.valid_to", null)
    .order("hire_date", { ascending: false })
    .returns<EmployeeListRow[]>();

  if (error) throw new Error(`Failed to load employees: ${error.message}`);
  return data ?? [];
}

/** One employment with the full person record and its ENTIRE assignment history,
 *  newest first. Session 2 renders the timeline from this. */
export async function getEmployee(id: string): Promise<EmployeeDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("employments")
    .select(
      `
        id, person_id, hire_date, termination_date, termination_reason, termination_notes, employment_type, status, created_at,
        person:persons!employments_person_id_fkey (
          id, first_name_en, last_name_en, first_name_ar, last_name_ar,
          email, phone, nationality, national_id, date_of_birth, created_at
        ),
        assignments:assignments!assignments_employment_id_fkey (
          id, employment_id, department_id, job_title_id, manager_employment_id,
          valid_from, valid_to,
          department:departments!assignments_department_id_fkey ( id, name_en, name_ar ),
          job_title:job_titles!assignments_job_title_id_fkey ( id, name_en, name_ar ),
          manager:employments!assignments_manager_employment_id_fkey (
            id,
            person:persons!employments_person_id_fkey (
              id, first_name_en, last_name_en, first_name_ar, last_name_ar
            )
          )
        )
      `,
    )
    .eq("id", id)
    .order("valid_from", { ascending: false, referencedTable: "assignments" })
    .maybeSingle<EmployeeDetail>();

  if (error) throw new Error(`Failed to load employee: ${error.message}`);
  return data;
}

/**
 * Effective-dating helpers now live in `./assignments` so that Client Components
 * can use them — this module imports `lib/supabase/server`, which cannot be
 * bundled for the browser. Re-exported here so existing call sites keep working.
 */
export {
  assignmentAsOf,
  currentAssignment,
  changesBetween,
  newestFirst,
  type AssignmentChange,
} from "./assignments";

/** Candidates for the manager dropdown: everyone currently employed. */
export async function listManagerOptions(
  excludeEmploymentId?: string,
): Promise<ManagerOption[]> {
  const supabase = await createClient();

  let query = supabase
    .from("employments")
    .select(
      `
        id,
        person:persons!employments_person_id_fkey (
          id, first_name_en, last_name_en, first_name_ar, last_name_ar
        )
      `,
    )
    .is("termination_date", null);

  if (excludeEmploymentId) {
    query = query.neq("id", excludeEmploymentId);
  }

  const { data, error } = await query.returns<ManagerOption[]>();

  if (error) throw new Error(`Failed to load managers: ${error.message}`);
  return data ?? [];
}
