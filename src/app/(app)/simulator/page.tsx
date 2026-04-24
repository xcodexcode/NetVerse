import { Suspense } from "react";

import { SimulatorRouteClient } from "@/components/simulator/simulator-route-client";

export default function SimulatorRoute() {
  return (
    <Suspense>
      <SimulatorRouteClient />
    </Suspense>
  );
}
