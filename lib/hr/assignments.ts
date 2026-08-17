import type { AssignmentExpanded, AssignmentWithManager } from "./types";

/**
 * Pure effective-dating logic. **No imports from `lib/supabase/server`** — this
 * module is imported by Client Components (the history timeline), and pulling a
 * server module into the browser bundle breaks the build. Query functions live
 * in `employees.ts`; the reasoning about validity ranges lives here.
 *
 * The range is half-open: [valid_from, valid_to). See CLAUDE.md rule 2.
 */

/**
 * The assignment in force on a given date.
 *
 * Note `valid_to > on`, not `>=`. On a changeover day the NEW assignment is the
 * one in force — the old row's `valid_to` and the new row's `valid_from` are the
 * same date, and the day belongs to the new one.
 */
/**
 * The day after `iso`.
 *
 * The workhorse of converting between the two date conventions in this schema:
 * `employments.termination_date` is INCLUSIVE (the last working day) while
 * assignment ranges are HALF-OPEN. So an assignment that should cover someone's
 * final day ends at `dayAfter(termination_date)`, not at the termination date
 * itself — setting them equal would leave the employee with no assignment on
 * the last day they worked, and any end-of-service calculation run against that
 * date would find nothing.
 */
export function dayAfter(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function assignmentAsOf<T extends AssignmentExpanded>(
  assignments: T[],
  on: string,
): T | null {
  return (
    assignments.find(
      (a) => a.valid_from <= on && (a.valid_to === null || a.valid_to > on),
    ) ?? null
  );
}

/** The current assignment — the open-ended one. */
export function currentAssignment<T extends AssignmentExpanded>(
  assignments: T[],
): T | null {
  return assignments.find((a) => a.valid_to === null) ?? null;
}

export type AssignmentChange = "department" | "jobTitle" | "manager";

/**
 * What actually changed between two consecutive assignments.
 *
 * Without this a timeline is a wall of near-identical rows and the reader has to
 * diff them by eye. `newer` and `older` are adjacent entries in the
 * newest-first history.
 */
export function changesBetween(
  newer: AssignmentWithManager,
  older: AssignmentWithManager,
): AssignmentChange[] {
  const changes: AssignmentChange[] = [];

  if (newer.department_id !== older.department_id) changes.push("department");
  if (newer.job_title_id !== older.job_title_id) changes.push("jobTitle");
  if (newer.manager_employment_id !== older.manager_employment_id) {
    changes.push("manager");
  }

  return changes;
}

/** Sorts a history newest-first. The query already orders this way; this keeps
 *  the guarantee if a caller ever assembles a list some other way. */
export function newestFirst<T extends AssignmentExpanded>(assignments: T[]): T[] {
  return [...assignments].sort((a, b) => b.valid_from.localeCompare(a.valid_from));
}
