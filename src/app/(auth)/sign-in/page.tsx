import { Suspense } from "react";

import { AuthRouteClient } from "@/components/auth/auth-route-client";

export default function SignInPage() {
  return (
    <Suspense>
      <AuthRouteClient mode="sign-in" />
    </Suspense>
  );
}
