"use client";

import { useActionState } from "react";
import { Undo2 } from "lucide-react";

import { FormError } from "@/components/hr/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IDLE_STATE, type ActionState } from "@/lib/hr/action-state";
import { useI18n } from "@/lib/i18n/provider";
import { useFormStatus } from "react-dom";

function UndoButton() {
  const { dict } = useI18n();
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      <Undo2 size={14} />
      {pending ? dict.common.saving : dict.termination.undoConfirm}
    </Button>
  );
}

export function UndoTerminationForm({
  action,
  employmentId,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  employmentId: string;
}) {
  const { dict } = useI18n();
  const [state, formAction] = useActionState(action, IDLE_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="employment_id" value={employmentId} />

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">{dict.termination.undoTitle}</h3>
        <p className="text-xs text-muted-foreground">
          {dict.termination.undoHelp}
        </p>
      </div>

      <FormError state={state} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-64 flex-1 flex-col gap-1.5">
          <Label htmlFor="undo-reason" className="text-xs">
            {dict.common.reason}
          </Label>
          <Input
            id="undo-reason"
            name="reason"
            placeholder={dict.common.reasonPlaceholder}
          />
        </div>
        <UndoButton />
      </div>
    </form>
  );
}
