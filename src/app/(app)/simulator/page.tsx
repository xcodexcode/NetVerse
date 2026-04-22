import { SimulatorWorkspace } from "@/components/simulator/simulator-workspace";

export default async function SimulatorRoute({
  searchParams
}: {
  searchParams: Promise<{ lab?: string; project?: string }>;
}) {
  const params = await searchParams;

  return <SimulatorWorkspace labId={params.lab ?? null} projectQueryId={params.project ?? null} />;
}
