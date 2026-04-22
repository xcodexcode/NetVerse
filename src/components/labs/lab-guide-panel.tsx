"use client";

import { CheckCircle2, Lightbulb } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LabDefinition, LabValidationResult } from "@/types/lab";

export function LabGuidePanel({
  lab,
  validation
}: {
  lab: LabDefinition;
  validation: LabValidationResult | null;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <Badge variant="success" className="w-fit">
          Guided lab
        </Badge>
        <CardTitle>{lab.title}</CardTitle>
        <CardDescription>{lab.description}</CardDescription>
      </CardHeader>
      <ScrollArea className="h-[420px]">
        <CardContent className="space-y-5 p-6">
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Objectives</p>
            {lab.objectives.map((objective) => (
              <div key={objective} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                {objective}
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Step-by-step guide</p>
            {lab.steps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                {index + 1}. {step}
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
              Hints
            </div>
            {lab.hints.map((hint) => (
              <div key={hint} className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
                {hint}
              </div>
            ))}
          </section>

          {validation ? (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Validation
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{validation.summary}</p>
                  <Badge variant={validation.completed ? "success" : "warning"}>
                    {validation.score}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  {validation.checklist.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm">
                      <span>{item.label}</span>
                      <Badge variant={item.complete ? "success" : "warning"}>
                        {item.complete ? "Done" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
