"use client";

import { useSearchParams } from "next/navigation";

import { SimulatorWorkspace } from "@/components/simulator/simulator-workspace";

export function SimulatorRouteClient() {
  const searchParams = useSearchParams();

  return (
    <SimulatorWorkspace
      labId={searchParams.get("lab")}
      projectQueryId={searchParams.get("project")}
    />
  );
}
