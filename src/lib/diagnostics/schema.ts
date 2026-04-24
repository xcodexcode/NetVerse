import { z } from "zod";

export const diagnosticActionSchema = z.enum(["analyze", "failure", "fixes", "teach"]);

export const diagnosticAnalysisSchema = z.object({
  headline: z.string(),
  diagnosis: z.array(z.string()),
  fixes: z.array(z.string()),
  beginnerExplanation: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  referencedIssues: z.array(z.string())
});

export type DiagnosticAnalysisOutput = z.infer<typeof diagnosticAnalysisSchema>;
