"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/hr/auth";
import { writeAudit } from "@/lib/hr/audit";
import { dayAfter } from "@/lib/hr/assignments";
import { createClient } from "@/lib/supabase/server";
import {
  EMPLOYMENT_TYPES,
  TERMINATION_REASONS,
  type EmploymentType,
  type TerminationReason,
} from "@/lib/hr/types";
import {
  PG_EXCLUSION_VIOLATION,
  PG_UNIQUE_VIOLATION,
  failure,
  optionalText,
  type ActionState,
} from "@/lib/hr/action-state";

const PERSON_COLUMNS =
  "id, first_name_en, last_name_en, first_name_ar, last_name_ar, email, phone, nationality, national_id, date_of_birth, created_at";
const EMPLOYMENT_COLUMNS =
  "id, person_id, hire_date, termination_date, termination_reason, termination_notes, employment_type, status, created_at";
const ASSIGNMENT_COLUMNS =
  "id, employment_id, department_id, job_title_id, manager_employment_id, valid_from, valid_to";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isEmploymentType(value: string | null): value is EmploymentType {
  return value !== null && (EMPLOYMENT_TYPES as readonly string[]).includes(value);
}

/**
 * Creates a person, their employment, and their first assignment — in that order.
 *
 * Supabase's client has no transaction, so this is three writes. That is
 * tolerable *because of* rule 3: a person with no employment is a legitimate
 * domain state, not corruption. If step two fails we are left with a person
 * record, which is a real thing that can be completed later — not a broken row.
 * The action says so plainly rather than pretending nothing happened.
 */
export async function createEmployee(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  // --- the person -----------------------------------------------------------
  const firstNameEn = optionalText(formData.get("first_name_en"));
  const lastNameEn = optionalText(formData.get("last_name_en"));
  const firstNameAr = optionalText(formData.get("first_name_ar"));
  const lastNameAr = optionalText(formData.get("last_name_ar"));
  const email = optionalText(formData.get("email"));
  const phone = optionalText(formData.get("phone"));
  const nationality = optionalText(formData.get("nationality"));
  const nationalId = optionalText(formData.get("national_id"));
  const dateOfBirth = optionalText(formData.get("date_of_birth"));

  // --- the employment -------------------------------------------------------
  const hireDate = optionalText(formData.get("hire_date"));
  const employmentType = optionalText(formData.get("employment_type"));

  // --- the assignment -------------------------------------------------------
  const departmentId = optionalText(formData.get("department_id"));
  const jobTitleId = optionalText(formData.get("job_title_id"));
  const managerEmploymentId = optionalText(formData.get("manager_employment_id"));

  const reason = optionalText(formData.get("reason"));

  const fieldErrors: Record<string, "required" | "invalidDate"> = {};
  if (!firstNameEn) fieldErrors.first_name_en = "required";
  if (!lastNameEn) fieldErrors.last_name_en = "required";
  if (!hireDate) fieldErrors.hire_date = "required";
  else if (!ISO_DATE.test(hireDate)) fieldErrors.hire_date = "invalidDate";
  if (!isEmploymentType(employmentType)) fieldErrors.employment_type = "required";
  if (!departmentId) fieldErrors.department_id = "required";
  if (!jobTitleId) fieldErrors.job_title_id = "required";
  if (dateOfBirth && !ISO_DATE.test(dateOfBirth)) {
    fieldErrors.date_of_birth = "invalidDate";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return failure("required", fieldErrors);
  }

  // Narrowing for TypeScript — the checks above already guarantee these.
  if (
    !firstNameEn ||
    !lastNameEn ||
    !hireDate ||
    !isEmploymentType(employmentType) ||
    !departmentId ||
    !jobTitleId
  ) {
    return failure("generic");
  }

  const supabase = await createClient();

  // 1. The person.
  const { data: person, error: personError } = await supabase
    .from("persons")
    .insert({
      first_name_en: firstNameEn,
      last_name_en: lastNameEn,
      first_name_ar: firstNameAr,
      last_name_ar: lastNameAr,
      email,
      phone,
      nationality,
      national_id: nationalId,
      date_of_birth: dateOfBirth,
    })
    .select(PERSON_COLUMNS)
    .single();

  if (personError || !person) {
    if (personError?.code === PG_UNIQUE_VIOLATION) {
      return failure("duplicateNationalId", {
        national_id: "duplicateNationalId",
      });
    }
    return failure("generic");
  }

  await writeAudit({
    tableName: "persons",
    recordId: person.id,
    action: "insert",
    after: person,
    reason,
  });

  // 2. The employment. Status is always 'active' on creation — a brand-new
  // employment that is already terminated is a data-migration case, not a
  // create-form case, and the CHECK constraint would reject it anyway.
  const { data: employment, error: employmentError } = await supabase
    .from("employments")
    .insert({
      person_id: person.id,
      hire_date: hireDate,
      employment_type: employmentType,
      status: "active",
    })
    .select(EMPLOYMENT_COLUMNS)
    .single();

  if (employmentError || !employment) {
    return failure("personCreatedButNot");
  }

  await writeAudit({
    tableName: "employments",
    recordId: employment.id,
    action: "insert",
    after: employment,
    reason,
  });

  // 3. The first assignment. It starts on the hire date by definition — someone
  // is placed in the org from the day they are employed — so valid_from is not
  // a separate input. valid_to stays NULL: this is the current assignment
  // (CLAUDE.md rule 2).
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .insert({
      employment_id: employment.id,
      department_id: departmentId,
      job_title_id: jobTitleId,
      manager_employment_id: managerEmploymentId,
      valid_from: hireDate,
      valid_to: null,
    })
    .select(ASSIGNMENT_COLUMNS)
    .single();

  if (assignmentError || !assignment) {
    if (assignmentError?.code === PG_EXCLUSION_VIOLATION) {
      return failure("overlappingAssignment");
    }
    return failure("personCreatedButNot");
  }

  await writeAudit({
    tableName: "assignments",
    recordId: assignment.id,
    action: "insert",
    after: assignment,
    reason,
  });

  revalidatePath("/protected/employees");
  redirect(`/protected/employees/${employment.id}`);
}

/* ===========================================================================
 * Session 3 — editing
 * ======================================================================== */

/**
 * Updates the person. A straight in-place UPDATE, on purpose.
 *
 * `persons` describes a human being, not a validity-ranged relationship
 * (CLAUDE.md rule 3), so there is nothing to effective-date here. The audit log
 * carries the before/after, which is the right level of history for these facts.
 */
export async function updatePerson(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const personId = optionalText(formData.get("person_id"));
  const employmentId = optionalText(formData.get("employment_id"));
  const reason = optionalText(formData.get("reason"));

  if (!personId || !employmentId) return failure("generic");

  const firstNameEn = optionalText(formData.get("first_name_en"));
  const lastNameEn = optionalText(formData.get("last_name_en"));
  const dateOfBirth = optionalText(formData.get("date_of_birth"));

  const fieldErrors: Record<string, "required" | "invalidDate"> = {};
  if (!firstNameEn) fieldErrors.first_name_en = "required";
  if (!lastNameEn) fieldErrors.last_name_en = "required";
  if (dateOfBirth && !ISO_DATE.test(dateOfBirth)) {
    fieldErrors.date_of_birth = "invalidDate";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return failure("required", fieldErrors);
  }

  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase
    .from("persons")
    .select(PERSON_COLUMNS)
    .eq("id", personId)
    .maybeSingle();

  if (beforeError || !before) return failure("generic");

  const { data: after, error } = await supabase
    .from("persons")
    .update({
      first_name_en: firstNameEn,
      last_name_en: lastNameEn,
      first_name_ar: optionalText(formData.get("first_name_ar")),
      last_name_ar: optionalText(formData.get("last_name_ar")),
      email: optionalText(formData.get("email")),
      phone: optionalText(formData.get("phone")),
      nationality: optionalText(formData.get("nationality")),
      national_id: optionalText(formData.get("national_id")),
      date_of_birth: dateOfBirth,
    })
    .eq("id", personId)
    .select(PERSON_COLUMNS)
    .single();

  if (error || !after) {
    if (error?.code === PG_UNIQUE_VIOLATION) {
      return failure("duplicateNationalId", {
        national_id: "duplicateNationalId",
      });
    }
    return failure("generic");
  }

  await writeAudit({
    tableName: "persons",
    recordId: personId,
    action: "update",
    before,
    after,
    reason,
  });

  revalidatePath(`/protected/employees/${employmentId}`);
  redirect(`/protected/employees/${employmentId}`);
}

/**
 * Changes — or corrects — where someone sits in the org.
 *
 * Two genuinely different operations behind one form, because conflating them
 * corrupts history in opposite directions:
 *
 *   change     The facts changed on a date. Close the current row at that date
 *              and open a new one. The old row stays. (CLAUDE.md rule 2.)
 *   correction The current row was always wrong. Fix it in place. No new
 *              timeline entry — inventing a "move" that never happened would be
 *              just as false as overwriting a real one.
 */
export async function changeAssignment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const employmentId = optionalText(formData.get("employment_id"));
  const mode = optionalText(formData.get("mode"));
  const departmentId = optionalText(formData.get("department_id"));
  const jobTitleId = optionalText(formData.get("job_title_id"));
  const managerEmploymentId = optionalText(formData.get("manager_employment_id"));
  const effectiveFrom = optionalText(formData.get("effective_from"));
  const reason = optionalText(formData.get("reason"));

  if (!employmentId) return failure("generic");
  if (!departmentId) return failure("required", { department_id: "required" });
  if (!jobTitleId) return failure("required", { job_title_id: "required" });

  const supabase = await createClient();

  // Read the open row from the database rather than trusting a hidden field —
  // the client should not get to nominate which record counts as "current".
  const { data: current, error: currentError } = await supabase
    .from("assignments")
    .select(ASSIGNMENT_COLUMNS)
    .eq("employment_id", employmentId)
    .is("valid_to", null)
    .maybeSingle();

  if (currentError) return failure("generic");
  if (!current) return failure("noCurrentAssignment");

  const unchanged =
    current.department_id === departmentId &&
    current.job_title_id === jobTitleId &&
    (current.manager_employment_id ?? null) === (managerEmploymentId ?? null);

  // Refuse to write a history entry that records no change. An timeline full of
  // identical consecutive rows is worse than no timeline.
  if (unchanged) return failure("nothingChanged");

  // --- correction: fix the current row in place ----------------------------
  if (mode === "correction") {
    const { data: corrected, error: correctError } = await supabase
      .from("assignments")
      .update({
        department_id: departmentId,
        job_title_id: jobTitleId,
        manager_employment_id: managerEmploymentId,
      })
      .eq("id", current.id)
      .select(ASSIGNMENT_COLUMNS)
      .single();

    if (correctError || !corrected) return failure("generic");

    await writeAudit({
      tableName: "assignments",
      recordId: current.id,
      action: "update",
      before: current,
      after: corrected,
      reason,
    });

    revalidatePath(`/protected/employees/${employmentId}`);
    redirect(`/protected/employees/${employmentId}`);
  }

  // --- change: close the current row, open a new one ------------------------
  if (!effectiveFrom || !ISO_DATE.test(effectiveFrom)) {
    return failure("required", { effective_from: "required" });
  }

  // The new row starts where the old one ends. Starting on or before the day the
  // current row began would give the old row a zero-length or inverted range,
  // which the `assignments_valid_range` check rejects anyway.
  if (effectiveFrom <= current.valid_from) {
    return failure("effectiveDateTooEarly", {
      effective_from: "effectiveDateTooEarly",
    });
  }

  // Order matters: the exclusion constraint forbids two open-ended rows for one
  // employment, so the current row has to be closed before the new one exists.
  const { data: closed, error: closeError } = await supabase
    .from("assignments")
    .update({ valid_to: effectiveFrom })
    .eq("id", current.id)
    .select(ASSIGNMENT_COLUMNS)
    .single();

  if (closeError || !closed) return failure("generic");

  await writeAudit({
    tableName: "assignments",
    recordId: current.id,
    action: "update",
    before: current,
    after: closed,
    reason,
  });

  const { data: opened, error: openError } = await supabase
    .from("assignments")
    .insert({
      employment_id: employmentId,
      department_id: departmentId,
      job_title_id: jobTitleId,
      manager_employment_id: managerEmploymentId,
      valid_from: effectiveFrom,
      valid_to: null,
    })
    .select(ASSIGNMENT_COLUMNS)
    .single();

  if (openError || !opened) {
    // Supabase JS has no transaction, so compensate by hand: reopen the row we
    // just closed. Leaving an employee with no current assignment is a worse
    // state than the edit simply having failed.
    const { data: reopened } = await supabase
      .from("assignments")
      .update({ valid_to: null })
      .eq("id", current.id)
      .select(ASSIGNMENT_COLUMNS)
      .single();

    if (!reopened) return failure("assignmentLeftClosed");

    // The rollback is itself a data change, so it is audited too (rule 5).
    await writeAudit({
      tableName: "assignments",
      recordId: current.id,
      action: "update",
      before: closed,
      after: reopened,
      reason: "Rolled back: the replacement assignment could not be created.",
    });

    if (openError?.code === PG_EXCLUSION_VIOLATION) {
      return failure("overlappingAssignment");
    }
    return failure("generic");
  }

  await writeAudit({
    tableName: "assignments",
    recordId: opened.id,
    action: "insert",
    after: opened,
    reason,
  });

  revalidatePath(`/protected/employees/${employmentId}`);
  redirect(`/protected/employees/${employmentId}`);
}

/* ===========================================================================
 * Session 5 — termination, undo, rehire
 * ======================================================================== */

function isTerminationReason(value: string | null): value is TerminationReason {
  return (
    value !== null && (TERMINATION_REASONS as readonly string[]).includes(value)
  );
}

/**
 * Ends an employment.
 *
 * `termination_date` is the last working day, INCLUSIVE. Assignment ranges are
 * half-open, so the open assignment is closed at `dayAfter(termination_date)` —
 * not at the termination date itself. Setting them equal would leave the person
 * with no assignment on the final day they worked, and an end-of-service
 * settlement queried "as of" that date would come back empty.
 */
export async function terminateEmployment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const employmentId = optionalText(formData.get("employment_id"));
  const terminationDate = optionalText(formData.get("termination_date"));
  const terminationReason = optionalText(formData.get("termination_reason"));
  const terminationNotes = optionalText(formData.get("termination_notes"));
  const auditReason = optionalText(formData.get("reason"));

  if (!employmentId) return failure("generic");

  const fieldErrors: Record<string, "required" | "invalidDate"> = {};
  if (!terminationDate) fieldErrors.termination_date = "required";
  else if (!ISO_DATE.test(terminationDate)) {
    fieldErrors.termination_date = "invalidDate";
  }
  if (!isTerminationReason(terminationReason)) {
    fieldErrors.termination_reason = "required";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return failure("required", fieldErrors);
  }
  if (!terminationDate || !isTerminationReason(terminationReason)) {
    return failure("generic");
  }

  const supabase = await createClient();

  const { data: employment, error: employmentError } = await supabase
    .from("employments")
    .select(EMPLOYMENT_COLUMNS)
    .eq("id", employmentId)
    .maybeSingle();

  if (employmentError || !employment) return failure("generic");
  if (employment.termination_date) return failure("alreadyTerminated");

  if (terminationDate < employment.hire_date) {
    return failure("terminationBeforeHire", {
      termination_date: "terminationBeforeHire",
    });
  }

  const { data: openAssignment } = await supabase
    .from("assignments")
    .select(ASSIGNMENT_COLUMNS)
    .eq("employment_id", employmentId)
    .is("valid_to", null)
    .maybeSingle();

  // Closing at dayAfter(terminationDate) must still leave a positive-length
  // range. Catch it here so the operator sees which field is wrong rather than
  // an opaque check-constraint violation.
  if (openAssignment && terminationDate < openAssignment.valid_from) {
    return failure("terminationBeforeAssignmentStart", {
      termination_date: "terminationBeforeAssignmentStart",
    });
  }

  // 1. End the employment. Status, date and reason move together — the CHECK
  // constraints require all three to agree.
  const { data: terminated, error: terminateError } = await supabase
    .from("employments")
    .update({
      status: "terminated",
      termination_date: terminationDate,
      termination_reason: terminationReason,
      termination_notes: terminationNotes,
    })
    .eq("id", employmentId)
    .select(EMPLOYMENT_COLUMNS)
    .single();

  if (terminateError || !terminated) return failure("generic");

  await writeAudit({
    tableName: "employments",
    recordId: employmentId,
    action: "update",
    before: employment,
    after: terminated,
    reason: auditReason,
  });

  // 2. Close the open assignment so history does not run past the end of
  // employment.
  if (openAssignment) {
    const { data: closed, error: closeError } = await supabase
      .from("assignments")
      .update({ valid_to: dayAfter(terminationDate) })
      .eq("id", openAssignment.id)
      .select(ASSIGNMENT_COLUMNS)
      .single();

    if (closeError || !closed) {
      // No transaction available, so undo step 1 by hand. A terminated
      // employment whose assignment is still open is a contradiction; a failed
      // termination is merely an inconvenience.
      const { data: reverted } = await supabase
        .from("employments")
        .update({
          status: employment.status,
          termination_date: null,
          termination_reason: null,
          termination_notes: null,
        })
        .eq("id", employmentId)
        .select(EMPLOYMENT_COLUMNS)
        .single();

      if (!reverted) return failure("terminationLeftInconsistent");

      await writeAudit({
        tableName: "employments",
        recordId: employmentId,
        action: "update",
        before: terminated,
        after: reverted,
        reason: "Rolled back: the open assignment could not be closed.",
      });

      return failure("generic");
    }

    await writeAudit({
      tableName: "assignments",
      recordId: openAssignment.id,
      action: "update",
      before: openAssignment,
      after: closed,
      reason: auditReason,
    });
  }

  revalidatePath("/protected/employees");
  revalidatePath("/protected/documents");
  redirect(`/protected/employees/${employmentId}`);
}

/**
 * Reverses a termination entered by mistake.
 *
 * Reopens the assignment FIRST. If that fails nothing has changed at all and
 * the operator can simply try again — whereas reopening the employment first
 * and then failing would leave someone active with no current assignment. Do
 * the reversible half first.
 */
export async function undoTermination(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const employmentId = optionalText(formData.get("employment_id"));
  const auditReason = optionalText(formData.get("reason"));
  if (!employmentId) return failure("generic");

  const supabase = await createClient();

  const { data: employment, error: employmentError } = await supabase
    .from("employments")
    .select(EMPLOYMENT_COLUMNS)
    .eq("id", employmentId)
    .maybeSingle();

  if (employmentError || !employment) return failure("generic");
  if (!employment.termination_date) return failure("notTerminated");

  // If the person has been rehired since, reopening this one would give them two
  // open employments and `employments_one_active_per_person` would reject it.
  // Check first: the constraint violation alone would surface as a generic
  // "something went wrong", which tells the operator nothing about what to do.
  const { data: siblings, error: siblingsError } = await supabase
    .from("employments")
    .select("id, termination_date")
    .eq("person_id", employment.person_id)
    .neq("id", employmentId);

  if (siblingsError) return failure("generic");
  if ((siblings ?? []).some((e) => e.termination_date === null)) {
    return failure("personRehiredSince");
  }

  const expectedCloseDate = dayAfter(employment.termination_date);

  const { data: latest } = await supabase
    .from("assignments")
    .select(ASSIGNMENT_COLUMNS)
    .eq("employment_id", employmentId)
    .order("valid_from", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Only reopen the row this termination actually closed. If its end date no
  // longer matches, something else has edited the history since — refuse and
  // say so rather than guessing which row to reopen.
  if (latest && latest.valid_to !== expectedCloseDate) {
    return failure("cannotReopenAssignment");
  }

  let reopened: typeof latest = null;
  if (latest) {
    const { data, error } = await supabase
      .from("assignments")
      .update({ valid_to: null })
      .eq("id", latest.id)
      .select(ASSIGNMENT_COLUMNS)
      .single();

    if (error || !data) return failure("cannotReopenAssignment");
    reopened = data;
  }

  const { data: restored, error: restoreError } = await supabase
    .from("employments")
    .update({
      status: "active",
      termination_date: null,
      termination_reason: null,
      termination_notes: null,
    })
    .eq("id", employmentId)
    .select(EMPLOYMENT_COLUMNS)
    .single();

  if (restoreError || !restored) {
    // Put the assignment back the way it was, so the pair stays consistent.
    if (latest && reopened) {
      const { data: reclosed } = await supabase
        .from("assignments")
        .update({ valid_to: expectedCloseDate })
        .eq("id", latest.id)
        .select(ASSIGNMENT_COLUMNS)
        .single();

      if (reclosed) {
        await writeAudit({
          tableName: "assignments",
          recordId: latest.id,
          action: "update",
          before: reopened,
          after: reclosed,
          reason: "Rolled back: the employment could not be reopened.",
        });
      }
    }
    return failure("generic");
  }

  if (latest && reopened) {
    await writeAudit({
      tableName: "assignments",
      recordId: latest.id,
      action: "update",
      before: latest,
      after: reopened,
      reason: auditReason,
    });
  }

  await writeAudit({
    tableName: "employments",
    recordId: employmentId,
    action: "update",
    before: employment,
    after: restored,
    reason: auditReason,
  });

  revalidatePath("/protected/employees");
  revalidatePath("/protected/documents");
  redirect(`/protected/employees/${employmentId}`);
}

/**
 * Rehire: a second employment period for a person who already exists.
 *
 * This is what the person/employment split has been for since day one. The
 * alternative — a fresh `persons` row — would be a duplicate human being, and
 * would fail outright at `persons_national_id_key` for anyone whose ID is on
 * file. Their documents, and their previous employment history, stay attached
 * to the one person record.
 */
export async function rehireEmployment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const personId = optionalText(formData.get("person_id"));
  const hireDate = optionalText(formData.get("hire_date"));
  const employmentType = optionalText(formData.get("employment_type"));
  const departmentId = optionalText(formData.get("department_id"));
  const jobTitleId = optionalText(formData.get("job_title_id"));
  const managerEmploymentId = optionalText(formData.get("manager_employment_id"));
  const reason = optionalText(formData.get("reason"));

  if (!personId) return failure("generic");

  const fieldErrors: Record<string, "required" | "invalidDate"> = {};
  if (!hireDate) fieldErrors.hire_date = "required";
  else if (!ISO_DATE.test(hireDate)) fieldErrors.hire_date = "invalidDate";
  if (!isEmploymentType(employmentType)) fieldErrors.employment_type = "required";
  if (!departmentId) fieldErrors.department_id = "required";
  if (!jobTitleId) fieldErrors.job_title_id = "required";

  if (Object.keys(fieldErrors).length > 0) {
    return failure("required", fieldErrors);
  }
  if (
    !hireDate ||
    !isEmploymentType(employmentType) ||
    !departmentId ||
    !jobTitleId
  ) {
    return failure("generic");
  }

  const supabase = await createClient();

  // `employments_one_active_per_person` would reject this anyway; checking here
  // turns a constraint violation into a sentence the operator can act on.
  const { data: existing, error: existingError } = await supabase
    .from("employments")
    .select("id, hire_date, termination_date")
    .eq("person_id", personId)
    .order("hire_date", { ascending: false });

  if (existingError) return failure("generic");

  const employments = existing ?? [];
  if (employments.some((e) => e.termination_date === null)) {
    return failure("hasOpenEmployment");
  }

  // Nobody is rehired before they left.
  const lastEnd = employments
    .map((e) => e.termination_date)
    .filter((d): d is string => d !== null)
    .sort()
    .at(-1);

  if (lastEnd && hireDate <= lastEnd) {
    return failure("rehireBeforeTermination", {
      hire_date: "rehireBeforeTermination",
    });
  }

  const { data: employment, error: employmentError } = await supabase
    .from("employments")
    .insert({
      person_id: personId,
      hire_date: hireDate,
      employment_type: employmentType,
      status: "active",
    })
    .select(EMPLOYMENT_COLUMNS)
    .single();

  if (employmentError || !employment) {
    if (employmentError?.code === PG_UNIQUE_VIOLATION) {
      return failure("hasOpenEmployment");
    }
    return failure("generic");
  }

  await writeAudit({
    tableName: "employments",
    recordId: employment.id,
    action: "insert",
    after: employment,
    reason,
  });

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .insert({
      employment_id: employment.id,
      department_id: departmentId,
      job_title_id: jobTitleId,
      manager_employment_id: managerEmploymentId,
      valid_from: hireDate,
      valid_to: null,
    })
    .select(ASSIGNMENT_COLUMNS)
    .single();

  if (assignmentError || !assignment) {
    return failure("employmentCreatedWithoutAssignment");
  }

  await writeAudit({
    tableName: "assignments",
    recordId: assignment.id,
    action: "insert",
    after: assignment,
    reason,
  });

  revalidatePath("/protected/employees");
  redirect(`/protected/employees/${employment.id}`);
}
