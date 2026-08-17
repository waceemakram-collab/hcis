"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/provider";
import { AFTER_LOGIN_PATH } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { dict } = useI18n();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError(dict.auth.passwordsDoNotMatch);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(dict.auth.passwordTooShort);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Where the confirmation link lands once the address is verified.
          emailRedirectTo: `${window.location.origin}${AFTER_LOGIN_PATH}`,
        },
      });
      if (error) throw error;

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      // Supabase returns these messages in English only.
      setError(error instanceof Error ? error.message : dict.errors.generic);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict.auth.signUpTitle}</CardTitle>
          <CardDescription>{dict.auth.signUpSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{dict.auth.email}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">{dict.auth.password}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  dir="ltr"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="repeat-password">
                  {dict.auth.repeatPassword}
                </Label>
                <Input
                  id="repeat-password"
                  type="password"
                  autoComplete="new-password"
                  dir="ltr"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? dict.auth.creatingAccount : dict.auth.signUp}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              {dict.auth.haveAccount}{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                {dict.auth.signIn}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
