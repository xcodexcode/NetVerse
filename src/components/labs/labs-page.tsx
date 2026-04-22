"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpenCheck } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listLabProgress } from "@/lib/firebase/firestore";
import { labCatalog } from "@/lib/labs/data";
import type { LabProgressRecord } from "@/types/lab";

export function LabsPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LabProgressRecord[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void listLabProgress(user.uid).then(setProgress);
  }, [user]);

  const progressMap = useMemo(
    () => new Map(progress.map((entry) => [entry.labId, entry])),
    [progress]
  );

  return (
    <div className="space-y-8 px-6 py-8 lg:px-8">
      <section className="max-w-3xl space-y-3">
        <Badge variant="info" className="w-fit">
          Guided Labs
        </Badge>
        <h2 className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-foreground">
          Build confidence with progressive networking scenarios.
        </h2>
        <p className="text-muted-foreground">
          Each lab ships with a starter topology, a clear objective, validation logic, hints, and a completion state you can persist through Firebase or local demo mode.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        {labCatalog.map((lab) => (
          <Card key={lab.id} className="flex h-full flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant={lab.difficulty === "Intermediate" ? "warning" : "success"}>
                  {lab.difficulty}
                </Badge>
                <BookOpenCheck className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>{lab.title}</CardTitle>
              <CardDescription>{lab.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                Completion:{" "}
                <span className="font-medium text-foreground">
                  {progressMap.get(lab.id)?.completed
                    ? `Complete (${progressMap.get(lab.id)?.score ?? 100}%)`
                    : "Not completed yet"}
                </span>
              </div>
              <div className="space-y-3">
                {lab.objectives.map((objective) => (
                  <div key={objective} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                    {objective}
                  </div>
                ))}
              </div>
              <div className="mt-auto flex gap-3">
                <Button asChild className="flex-1">
                  <Link href={`/simulator?lab=${lab.id}`}>
                    {progressMap.get(lab.id) ? "Resume lab" : "Start lab"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
