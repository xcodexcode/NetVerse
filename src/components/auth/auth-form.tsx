"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm({
  mode,
  redirectTo = "/dashboard"
}: {
  mode: AuthMode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { signIn, signUp, isDemoMode } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  const content = useMemo(
    () =>
      mode === "sign-in"
        ? {
            submitLabel: "Enter NetVerse",
            alternateHref: "/sign-up" as Route,
            alternateCopy: "Need an account? Create one"
          }
        : {
            submitLabel: "Create account",
            alternateHref: "/sign-in" as Route,
            alternateCopy: "Already have an account? Sign in"
          },
    [mode]
  );

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "sign-in") {
        const values = signInSchema.parse({
          email: formData.get("email"),
          password: formData.get("password")
        });
        await signIn(values.email, values.password);
      } else {
        const values = signUpSchema.parse({
          displayName: formData.get("displayName"),
          email: formData.get("email"),
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword")
        });
        await signUp(values.displayName, values.email, values.password);
      }

      startTransition(() => {
        router.push(safeRedirect as Route);
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {mode === "sign-up" ? (
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" name="displayName" placeholder="Nabil" />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="********" />
      </div>

      {mode === "sign-up" ? (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="********" />
        </div>
      ) : null}

      {isDemoMode ? (
        <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
          Firebase is not configured yet, so auth runs in local demo mode. The UI and simulator remain fully usable while you wire real Firebase credentials.
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Working..." : content.submitLabel}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={content.alternateHref} className="text-primary transition hover:text-primary/80">
          {content.alternateCopy}
        </Link>
      </p>
    </form>
  );
}
