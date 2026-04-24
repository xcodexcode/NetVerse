"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, BookOpen, BrainCircuit, FolderKanban, Orbit, Sparkles } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listLabProgress, listProjects } from "@/lib/firebase/firestore";
import { labCatalog } from "@/lib/labs/data";
import type { LabProgressRecord } from "@/types/lab";
import type { SavedProject } from "@/types/project";

const overviewCards = [
  {
    title: "Academy command center",
    description: "Subnetting, AWS drills, Linux practice, packet flow, cost, and interviews.",
    href: "/academy",
    icon: BrainCircuit
  },
  {
    title: "Continue last project",
    description: "Jump back into your current topology workspace.",
    href: "/simulator",
    icon: Orbit
  },
  {
    title: "Guided labs",
    description: "Progress through scenario-driven networking exercises.",
    href: "/labs",
    icon: BookOpen
  },
  {
    title: "Project library",
    description: "Search and reopen your saved topologies.",
    href: "/projects",
    icon: FolderKanban
  }
];

export function DashboardPage() {
  const { isDemoMode, user } = useAuth();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [labProgress, setLabProgress] = useState<LabProgressRecord[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void Promise.all([listProjects(user.uid), listLabProgress(user.uid)]).then(
      ([loadedProjects, loadedLabProgress]) => {
        setProjects(loadedProjects);
        setLabProgress(loadedLabProgress);
      }
    );
  }, [user]);

  const latestProject = projects[0] ?? null;
  const completedLabs = useMemo(
    () => labProgress.filter((entry) => entry.completed).length,
    [labProgress]
  );

  return (
    <div className="space-y-8 px-6 py-8 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <CardHeader className="relative">
            <Badge variant={isDemoMode ? "warning" : "success"} className="w-fit">
              {isDemoMode ? "Running in local demo mode" : "Firebase connected"}
            </Badge>
            <CardTitle className="max-w-2xl font-[family-name:var(--font-heading)] text-3xl">
              Build topologies, validate labs, and debug faster with AI that understands your network state.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base">
              NetVerse combines a simulator workspace, deterministic connectivity engine, guided labs, and server-side AI analysis in one modern workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={latestProject ? `/simulator?project=${latestProject.id}` : "/simulator"}>
                Open simulator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/academy">Open Academy</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Badge variant="info" className="w-fit">
              Progress overview
            </Badge>
            <CardTitle>Focus this session</CardTitle>
            <CardDescription>Suggested next moves for the MVP workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              `${projects.length} saved project${projects.length === 1 ? "" : "s"} available`,
              `${completedLabs}/${labCatalog.length} labs completed`,
              latestProject ? `Last project: ${latestProject.title}` : "No saved projects yet"
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <card.icon className="h-5 w-5" />
              </div>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full justify-between">
                <Link href={card.href}>
                  Open
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <Badge variant="success" className="w-fit">
              Recent projects
            </Badge>
            <CardTitle>Resume your latest work</CardTitle>
            <CardDescription>Projects are loaded from Firebase or local demo persistence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.length > 0 ? (
              projects.slice(0, 3).map((project) => (
                <div key={project.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{project.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.topology.devices.length} devices / {project.topology.links.length} links
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/simulator?project=${project.id}`}>Open</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-muted-foreground">
                Save a simulator topology and it will appear here.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Badge variant="info" className="w-fit">
              Product pulse
            </Badge>
            <CardTitle>What makes the experience feel premium</CardTitle>
            <CardDescription>UX details that give the MVP momentum.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Sparkles, label: "Animated topology states" },
              { icon: Activity, label: "Real ping success and failure badges" },
              { icon: Orbit, label: "Focused workspace layout" },
              { icon: BookOpen, label: "Lab-specific validation and hints" }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm text-foreground">{item.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
