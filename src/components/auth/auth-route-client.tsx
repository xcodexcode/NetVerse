"use client";

import { useSearchParams } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/layout/auth-shell";

export function AuthRouteClient({
  mode
}: {
  mode: "sign-in" | "sign-up";
}) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? undefined;

  return (
    <AuthShell
      title={mode === "sign-in" ? "Sign in to NetVerse" : "Create your NetVerse account"}
      description={
        mode === "sign-in"
          ? "Access your simulator workspace, labs, and saved network projects."
          : "Save projects, track guided lab progress, and build your daily networking practice habit."
      }
    >
      <AuthForm mode={mode} redirectTo={redirectTo} />
    </AuthShell>
  );
}
