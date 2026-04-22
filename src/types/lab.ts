import type { TopologySnapshot } from "@/types/simulator";

export type LabDifficulty = "Beginner" | "Intermediate";

export interface LabDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: LabDifficulty;
  objectives: string[];
  steps: string[];
  hints: string[];
  starterTopology: TopologySnapshot;
  validation: {
    sourceDeviceId: string;
    destinationDeviceId: string;
    mustIncludeDeviceKinds?: string[];
  };
  solutionMetadata: {
    expectedOutcome: string;
    keyFixes: string[];
  };
}

export interface LabProgressRecord {
  id: string;
  userId: string;
  labId: string;
  completed: boolean;
  score: number;
  updatedAt: string;
}

export interface LabValidationResult {
  completed: boolean;
  score: number;
  summary: string;
  checklist: Array<{
    label: string;
    complete: boolean;
  }>;
}
