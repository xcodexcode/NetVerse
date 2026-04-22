import type { DiagnosticIssue } from "@/types/simulator";

export interface AiAnalysisResponse {
  headline: string;
  diagnosis: string[];
  fixes: string[];
  beginnerExplanation: string;
  confidence: "low" | "medium" | "high";
  referencedIssues: string[];
}

export interface AiAnalysisPayload {
  trigger: "analyze" | "failure" | "fixes" | "teach";
  issues: DiagnosticIssue[];
}
