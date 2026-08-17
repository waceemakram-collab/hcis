import { createClient } from "@/lib/supabase/server";

export type AuditAction = "insert" | "update" | "delete";

export type AuditEntry = {
  tableName: string;
  recordId: string;
  action: AuditAction;
  /** Row state before the change. Omit for inserts. */
  before?: unknown;
  /** Row state after the change. Omit for deletes. */
  after?: unknown;
  /** The business reason, supplied by the operator. The "why" a DB trigger
   *  could never capture — see CLAUDE.md rule 5. */
  reason?: string | null;
};

/**
 * Records a change to HR data. Called by EVERY mutating Server Action.
 *
 * Throws if the audit row cannot be written. That is deliberate: an unaudited
 * change is worse than a failed one, so the caller must not swallow this.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("audit_log").insert({
    table_name: entry.tableName,
    record_id: entry.recordId,
    action: entry.action,
    changed_by: user?.id ?? null,
    before: entry.before ?? null,
    after: entry.after ?? null,
    reason: entry.reason?.trim() || null,
  });

  if (error) {
    throw new Error(
      `Audit write failed for ${entry.tableName}/${entry.recordId}: ${error.message}`,
    );
  }
}

/** Convenience for multi-row writes — audits each entry, in order. */
export async function writeAuditBatch(entries: AuditEntry[]): Promise<void> {
  for (const entry of entries) {
    await writeAudit(entry);
  }
}
