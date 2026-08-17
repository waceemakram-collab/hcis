// Row shapes for the HCIS tables. Hand-written rather than generated so the
// domain rules stay readable; regenerate from Supabase later if it becomes a chore.

export const EMPLOYMENT_TYPES = ["full_time", "part_time", "contractor"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_STATUSES = ["active", "on_leave", "terminated"] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const TERMINATION_REASONS = [
  "resignation",
  "end_of_contract",
  "dismissal",
  "death",
  "other",
] as const;
export type TerminationReason = (typeof TERMINATION_REASONS)[number];

export type Department = {
  id: string;
  name_en: string;
  name_ar: string | null;
  parent_id: string | null;
  created_at: string;
};

export type DepartmentWithParent = Department & {
  parent: Pick<Department, "id" | "name_en" | "name_ar"> | null;
};

export type JobTitle = {
  id: string;
  name_en: string;
  name_ar: string | null;
  created_at: string;
};

/** A human being. NOT an employee — see CLAUDE.md rule 3. */
export type Person = {
  id: string;
  first_name_en: string;
  last_name_en: string;
  first_name_ar: string | null;
  last_name_ar: string | null;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  national_id: string | null;
  date_of_birth: string | null;
  created_at: string;
};

export type PersonName = Pick<
  Person,
  "id" | "first_name_en" | "last_name_en" | "first_name_ar" | "last_name_ar"
>;

/** A period of being employed. `termination_date` is the last working day, inclusive. */
export type Employment = {
  id: string;
  person_id: string;
  hire_date: string;
  termination_date: string | null;
  termination_reason: TerminationReason | null;
  termination_notes: string | null;
  employment_type: EmploymentType;
  status: EmploymentStatus;
  created_at: string;
};

/** Effective-dated org placement. Range is half-open: [valid_from, valid_to). */
export type Assignment = {
  id: string;
  employment_id: string;
  department_id: string;
  job_title_id: string;
  manager_employment_id: string | null;
  valid_from: string;
  valid_to: string | null;
};

export type AssignmentExpanded = Assignment & {
  department: Pick<Department, "id" | "name_en" | "name_ar"> | null;
  job_title: Pick<JobTitle, "id" | "name_en" | "name_ar"> | null;
};

/** An employment row joined to its person and its current assignment.
 *  This is the "employee" view — employee is derived, never stored. */
export type EmployeeListRow = Employment & {
  person: PersonName | null;
  assignments: AssignmentExpanded[];
};

/** An assignment with its manager resolved — one entry in the history timeline. */
export type AssignmentWithManager = AssignmentExpanded & {
  manager: (Pick<Employment, "id"> & { person: PersonName | null }) | null;
};

export type EmployeeDetail = Employment & {
  person: Person | null;
  /** Full history, newest first. */
  assignments: AssignmentWithManager[];
};

/** Shorthand for the manager dropdown. */
export type ManagerOption = {
  id: string;
  person: PersonName | null;
};

/* --- documents ------------------------------------------------------------ */

export const DOCUMENT_TYPES = [
  "passport",
  "residency_permit",
  "labour_card",
  "other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/**
 * Named `HrDocument`, not `Document` — `Document` is a DOM global, and shadowing
 * it produces baffling type errors in any file that also touches the browser.
 */
export type HrDocument = {
  id: string;
  person_id: string;
  document_type: DocumentType;
  description: string | null;
  document_number: string | null;
  issuing_country: string | null;
  issue_date: string | null;
  expiry_date: string;
  created_at: string;
};

/** A document plus enough of the person to render a row and link to them.
 *  `employments` is carried so the dashboard can tell current staff from
 *  leavers, and so the row can link to the right employment record. */
export type DocumentWithPerson = HrDocument & {
  person:
    | (PersonName & {
        employments: { id: string; termination_date: string | null }[];
      })
    | null;
};
