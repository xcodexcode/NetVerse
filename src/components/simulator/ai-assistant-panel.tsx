"use client";

import { useState, type ComponentType } from "react";
import { Bot, Lightbulb, Network, Sparkles } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AiAnalysisOutput } from "@/lib/ai/schema";
import type { AiAction } from "@/lib/ai/types";
import { analyzeTopology } from "@/lib/simulator/engine";
import { useSimulatorStore } from "@/store/simulator-store";

const actions = [
  { id: "analyze", label: "Analyze Network", icon: Network },
  { id: "failure", label: "Explain This Failure", icon: Bot },
  { id: "fixes", label: "Suggest Fixes", icon: Sparkles },
  { id: "teach", label: "Teach Me Why", icon: Lightbulb }
] as const satisfies ReadonlyArray<{
  id: AiAction;
  label: string;
  icon: ComponentType<{ className?: string }>;
}>;

export function AiAssistantPanel() {
  const topology = useSimulatorStore((state) => state.topology);
  const diagnostics = analyzeTopology(topology);
  const { getIdToken } = useAuth();
  const [analysis, setAnalysis] = useState<AiAnalysisOutput | null>(null);
  const [mode, setMode] = useState<"idle" | "openai" | "fallback">("idle");
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(trigger: "analyze" | "failure" | "fixes" | "teach") {
    setError(null);
    setActiveAction(trigger);

    try {
      const token = await getIdToken();
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          trigger,
          topology
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to analyze topology.");
      }

      setAnalysis(payload.analysis as AiAnalysisOutput);
      setMode(payload.mode === "openai" ? "openai" : "fallback");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to analyze topology.");
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <Badge variant="warning" className="w-fit">
          AI debug assistant
        </Badge>
        <CardTitle>Topology-aware analysis panel</CardTitle>
        <CardDescription>
          The assistant uses your live topology, recent ping result, and simulator rule violations as context. Secrets stay on the server.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="secondary"
              className="justify-start"
              disabled={topology.devices.length === 0 || activeAction !== null}
              onClick={() => runAction(action.id)}
            >
              <action.icon className="h-4 w-4" />
              {activeAction === action.id ? "Analyzing..." : action.label}
            </Button>
          ))}
        </div>
        {analysis ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-medium text-foreground">{analysis.headline}</p>
              <Badge variant={mode === "openai" ? "success" : "warning"}>
                {mode === "openai" ? "OpenAI live" : "Fallback rules"}
              </Badge>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">Diagnosis</p>
                <div className="space-y-2">
                  {analysis.diagnosis.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-slate-100">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">Fixes</p>
                <div className="space-y-2">
                  {analysis.fixes.map((item) => (
                    <div key={item} className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3 text-emerald-100">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-100">
                {analysis.beginnerExplanation}
              </div>
            </div>
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
        <ScrollArea className="h-[280px] rounded-2xl border border-white/10 bg-white/5">
          <div className="space-y-3 p-4">
            {diagnostics.length > 0 ? (
              diagnostics.map((issue) => (
                <div key={`${issue.code}-${issue.deviceId ?? "global"}`} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="font-medium text-foreground">{issue.message}</p>
                  {issue.suggestion ? (
                    <p className="mt-2 text-sm text-muted-foreground">{issue.suggestion}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                No topology issues detected yet. Add devices or run a ping to generate richer context.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
