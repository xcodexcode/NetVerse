import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Sign in to NetVerse"
      description="Access your simulator workspace, labs, and saved network projects."
    >
      <AuthForm mode="sign-in" redirectTo={params.redirect} />
    </AuthShell>
  );
}
