"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/hr/auth";
import { writeAudit } from "@/lib/hr/audit";
import { createClient } from "@/lib/supabase/server";
import {
  failure,
  optionalText,
  type ActionState,
} from "@/lib/hr/action-state";

const COLUMNS = "id, name_en, name_ar, created_at";

export async function createJobTitle(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const nameEn = optionalText(formData.get("name_en"));
  const nameAr = optionalText(formData.get("name_ar"));
  const reason = optionalText(formData.get("reason"));

  if (!nameEn) return failure("required", { name_en: "required" });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_titles")
    .insert({ name_en: nameEn, name_ar: nameAr })
    .select(COLUMNS)
    .single();

  if (error || !data) return failure("generic");

  await writeAudit({
    tableName: "job_titles",
    recordId: data.id,
    action: "insert",
    after: data,
    reason,
  });

  revalidatePath("/protected/job-titles");
  redirect("/protected/job-titles");
}

export async function updateJobTitle(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = optionalText(formData.get("id"));
  const nameEn = optionalText(formData.get("name_en"));
  const nameAr = optionalText(formData.get("name_ar"));
  const reason = optionalText(formData.get("reason"));

  if (!id) return failure("generic");
  if (!nameEn) return failure("required", { name_en: "required" });

  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase
    .from("job_titles")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (beforeError || !before) return failure("generic");

  const { data: after, error } = await supabase
    .from("job_titles")
    .update({ name_en: nameEn, name_ar: nameAr })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error || !after) return failure("generic");

  await writeAudit({
    tableName: "job_titles",
    recordId: id,
    action: "update",
    before,
    after,
    reason,
  });

  revalidatePath("/protected/job-titles");
  redirect("/protected/job-titles");
}
