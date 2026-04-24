import { Suspense } from "react";

import { AuthRouteClient } from "@/components/auth/auth-route-client";

export default function SignUpPage() {
  return (
    <Suspense>
      <AuthRouteClient mode="sign-up" />
    </Suspense>
  );
}
