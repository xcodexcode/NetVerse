import { evaluatePing } from "@/lib/simulator/engine";
import { labCatalog } from "@/lib/labs/data";
import type { LabDefinition, LabValidationResult } from "@/types/lab";
import type { TopologySnapshot } from "@/types/simulator";

export function getLabById(labId: string) {
  return labCatalog.find((lab) => lab.id === labId) ?? null;
}

export function evaluateLab(topology: TopologySnapshot, lab: LabDefinition): LabValidationResult {
  const ping = evaluatePing(
    topology,
    lab.validation.sourceDeviceId,
    lab.validation.destinationDeviceId
  );

  const requiredKinds = lab.validation.mustIncludeDeviceKinds ?? [];
  const checklist = [
    ...requiredKinds.map((kind) => ({
      label: `Topology includes a ${kind}`,
      complete: topology.devices.some((device) => device.kind === kind)
    })),
    {
      label: "Final ping succeeds",
      complete: ping.success
    }
  ];

  const completed = checklist.every((item) => item.complete);
  const score = Math.round((checklist.filter((item) => item.complete).length / checklist.length) * 100);

  return {
    completed,
    score,
    summary: completed ? "Lab complete. Your topology passes validation." : ping.summary,
    checklist
  };
}
