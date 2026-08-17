"use client";

import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/provider";
import type { ActionState, ErrorKey } from "@/lib/hr/action-state";
import { cn } from "@/lib/utils";

/** A labelled form control with optional/required marking and an error slot.
 *  Errors arrive as dictionary keys and are resolved here, so validation
 *  messages are bilingual like everything else. */
export function Field({
  name,
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: ErrorKey;
  children: React.ReactNode;
  className?: string;
}) {
  const { dict } = useI18n();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={name} className="text-sm">
        {label}
        {!required && (
          <span className="ms-1 text-xs font-normal text-muted-foreground">
            ({dict.common.optional})
          </span>
        )}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive">{dict.errors[error]}</p>
      )}
    </div>
  );
}

export function SectionHeading({
  title,
  help,
}: {
  title: string;
  help?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b pb-2">
      <h2 className="text-base font-semibold">{title}</h2>
      {help && <p className="text-sm text-muted-foreground">{help}</p>}
    </div>
  );
}

export function FormError({ state }: { state: ActionState }) {
  const { dict } = useI18n();

  if (state.status !== "error") return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{dict.errors[state.errorKey]}</span>
    </div>
  );
}

export function SubmitButton({ label }: { label?: string }) {
  const { dict } = useI18n();
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? dict.common.saving : (label ?? dict.common.save)}
    </Button>
  );
}

/** Reads `fieldErrors` off the action state without the caller having to
 *  narrow the union at every call site. */
export function fieldError(
  state: ActionState,
  name: string,
): ErrorKey | undefined {
  if (state.status !== "error") return undefined;
  return state.fieldErrors?.[name];
}
