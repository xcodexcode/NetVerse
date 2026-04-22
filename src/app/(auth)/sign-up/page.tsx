import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Create your NetVerse account"
      description="Save projects, track guided lab progress, and build your daily networking practice habit."
    >
      <AuthForm mode="sign-up" redirectTo={params.redirect} />
    </AuthShell>
  );
}
