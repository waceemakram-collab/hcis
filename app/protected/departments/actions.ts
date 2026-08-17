"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/hr/auth";
import { writeAudit } from "@/lib/hr/audit";
import { wouldCreateCycle } from "@/lib/hr/departments";
import { createClient } from "@/lib/supabase/server";
import {
  failure,
  optionalText,
  type ActionState,
} from "@/lib/hr/action-state";

const COLUMNS = "id, name_en, name_ar, parent_id, created_at";

export async function createDepartment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const nameEn = optionalText(formData.get("name_en"));
  const nameAr = optionalText(formData.get("name_ar"));
  const parentId = optionalText(formData.get("parent_id"));
  const reason = optionalText(formData.get("reason"));

  if (!nameEn) return failure("required", { name_en: "required" });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .insert({ name_en: nameEn, name_ar: nameAr, parent_id: parentId })
    .select(COLUMNS)
    .single();

  if (error || !data) return failure("generic");

  // Rule 5: never return before the change is recorded. writeAudit throws on
  // failure, which is the point — an unaudited change must not be reported as success.
  await writeAudit({
    tableName: "departments",
    recordId: data.id,
    action: "insert",
    after: data,
    reason,
  });

  revalidatePath("/protected/departments");
  redirect("/protected/departments");
}

export async function updateDepartment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = optionalText(formData.get("id"));
  const nameEn = optionalText(formData.get("name_en"));
  const nameAr = optionalText(formData.get("name_ar"));
  const parentId = optionalText(formData.get("parent_id"));
  const reason = optionalText(formData.get("reason"));

  if (!id) return failure("generic");
  if (!nameEn) return failure("required", { name_en: "required" });

  // A department cannot sit beneath itself. The database blocks the direct case;
  // a longer loop (A -> B -> A) has to be caught here.
  if (await wouldCreateCycle(id, parentId)) {
    return failure("generic", { parent_id: "generic" });
  }

  const supabase = await createClient();

  // Read the prior state first — an audit row without a `before` cannot answer
  // "what changed?", which is most of what an HR audit trail is for.
  const { data: before, error: beforeError } = await supabase
    .from("departments")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (beforeError || !before) return failure("generic");

  // Departments are reference data, not effective-dated facts, so an in-place
  // update is correct here. Contrast with assignments (CLAUDE.md rule 2).
  const { data: after, error } = await supabase
    .from("departments")
    .update({ name_en: nameEn, name_ar: nameAr, parent_id: parentId })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error || !after) return failure("generic");

  await writeAudit({
    tableName: "departments",
    recordId: id,
    action: "update",
    before,
    after,
    reason,
  });

  revalidatePath("/protected/departments");
  redirect("/protected/departments");
}
