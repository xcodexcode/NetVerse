import { z } from "zod";

export const aiActionSchema = z.enum(["analyze", "failure", "fixes", "teach"]);

export const aiRequestSchema = z.object({
  trigger: aiActionSchema,
  topology: z.object({
    devices: z.array(z.record(z.any())),
    links: z.array(z.record(z.any())),
    recentPing: z.record(z.any()).nullable(),
    selectedDeviceId: z.string().nullable()
  })
});

export const aiAnalysisSchema = z.object({
  headline: z.string(),
  diagnosis: z.array(z.string()),
  fixes: z.array(z.string()),
  beginnerExplanation: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  referencedIssues: z.array(z.string())
});

export const aiAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "headline",
    "diagnosis",
    "fixes",
    "beginnerExplanation",
    "confidence",
    "referencedIssues"
  ],
  properties: {
    headline: {
      type: "string"
    },
    diagnosis: {
      type: "array",
      items: { type: "string" }
    },
    fixes: {
      type: "array",
      items: { type: "string" }
    },
    beginnerExplanation: {
      type: "string"
    },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high"]
    },
    referencedIssues: {
      type: "array",
      items: { type: "string" }
    }
  }
} as const;

export type AiRequestInput = z.infer<typeof aiRequestSchema>;
export type AiAnalysisOutput = z.infer<typeof aiAnalysisSchema>;
