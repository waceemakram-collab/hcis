import { createClient } from "@/lib/supabase/server";
import type { JobTitle } from "./types";

/** Read paths only. Mutations live in `app/protected/job-titles/actions.ts`. */

export async function listJobTitles(): Promise<JobTitle[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("job_titles")
    .select("id, name_en, name_ar, created_at")
    .order("name_en", { ascending: true })
    .returns<JobTitle[]>();

  if (error) throw new Error(`Failed to load job titles: ${error.message}`);
  return data ?? [];
}

export async function getJobTitle(id: string): Promise<JobTitle | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("job_titles")
    .select("id, name_en, name_ar, created_at")
    .eq("id", id)
    .maybeSingle<JobTitle>();

  if (error) throw new Error(`Failed to load job title: ${error.message}`);
  return data;
}
