import { NextResponse } from "next/server";
import OpenAI from "openai";

import { buildFallbackAnalysis, buildSystemPrompt, buildUserContext } from "@/lib/ai/prompt";
import { aiAnalysisJsonSchema, aiAnalysisSchema, aiRequestSchema } from "@/lib/ai/schema";
import { verifyRequestToken } from "@/lib/firebase/admin";
import type { TopologySnapshot } from "@/types/simulator";

type OpenAiJsonResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
};

function extractOutputText(response: OpenAiJsonResponse) {
  if (response.output_text) {
    return response.output_text;
  }

  if (!response.output || response.output.length === 0) {
    return "";
  }

  const firstOutput = response.output[0];
  const firstContent = firstOutput.content?.[0];
  return firstContent?.text ?? "";
}

export async function POST(request: Request) {
  try {
    const body = aiRequestSchema.parse(await request.json());
    const topology = body.topology as TopologySnapshot;
    await verifyRequestToken(request);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        mode: "fallback",
        analysis: buildFallbackAnalysis(topology, body.trigger)
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = (await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      max_output_tokens: 700,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: buildSystemPrompt(body.trigger) }]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(buildUserContext(topology, body.trigger), null, 2)
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          strict: true,
          name: "netverse_network_analysis",
          schema: aiAnalysisJsonSchema
        }
      }
    })) as OpenAiJsonResponse;

    const rawOutput = extractOutputText(response);
    if (!rawOutput) {
      throw new Error("The AI route returned an empty response.");
    }

    const analysis = aiAnalysisSchema.parse(JSON.parse(rawOutput));

    return NextResponse.json({
      mode: "openai",
      analysis
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze the topology.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
