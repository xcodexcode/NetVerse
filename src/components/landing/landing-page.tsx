"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot, BrainCircuit, FileText, Network, SaveAll, Shield, Waypoints } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Waypoints,
    title: "Visual simulation",
    description: "Drag devices onto a canvas, cable them together, and inspect every network element."
  },
  {
    icon: BrainCircuit,
    title: "Explainable diagnostics",
    description: "Pair a deterministic connectivity engine with clear troubleshooting notes."
  },
  {
    icon: Shield,
    title: "Guided labs and progress",
    description: "Move through curated networking scenarios with validation, hints, and saved progress."
  },
  {
    icon: FileText,
    title: "Learning Studio",
    description: "Take notes, build concept schemas, make flashcards, guard resources, run Pomodoro, and plan roadmaps."
  }
];

const landingLinks = [
  { href: "#features", label: "Features" },
  { href: "#workspace", label: "Workspace" },
  { href: "#labs", label: "Labs" }
];

export function LandingPage() {
  const { user } = useAuth();

  return (
    <main className="relative overflow-hidden">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/65 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <BrandMark />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {landingLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href={user ? "/dashboard" : "/sign-in"}>{user ? "Dashboard" : "Sign in"}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={user ? "/simulator" : "/sign-up"}>
                {user ? "Open simulator" : "Start free"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col justify-center px-6 py-20 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <Badge variant="info" className="w-fit">
              Built for network engineers and IT students
            </Badge>
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.35em] text-primary/80">
                Build. Break. Fix. Master networks.
              </p>
              <h1 className="max-w-3xl font-[family-name:var(--font-heading)] text-5xl font-semibold leading-tight text-gradient sm:text-6xl">
                A network lab where topology design, testing, and guided practice live together.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                NetVerse gives junior engineers and IT students a serious engineering workspace to model topologies, diagnose failures, build study systems, and grow faster with guided hands-on practice.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href={user ? "/dashboard" : "/sign-up"}>
                  Launch NetVerse
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href={user ? "/studio" : "/sign-up"}>Open Learning Studio</Link>
              </Button>
            </div>
            <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                { label: "Modules", value: "Simulator, Studio, Academy, Labs" },
                { label: "Target Users", value: "CCNA beginners to junior engineers" },
                { label: "Persistence", value: "Firebase Auth + Firestore" }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            id="workspace"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 p-4 shadow-panel">
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Simulator Preview
                  </p>
                  <p className="font-medium text-foreground">Topology + debug notes + ping console</p>
                </div>
                <Badge variant="success">Interactive lab</Badge>
              </div>
              <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">Palette</p>
                  <div className="space-y-3">
                    {["PC", "Switch", "Router", "Server"].map((label) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm">
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,28,0.88),rgba(7,10,18,0.96))]">
                  <div className="relative flex h-[380px] items-center justify-center bg-grid bg-[length:80px_80px]">
                    <div className="absolute left-24 top-24 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-glow">
                      <Network className="h-7 w-7" />
                    </div>
                    <div className="absolute left-[42%] top-[42%] flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-200">
                      <Bot className="h-7 w-7" />
                    </div>
                    <div className="absolute right-24 bottom-20 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-glow">
                      <SaveAll className="h-7 w-7" />
                    </div>
                    <div className="absolute inset-x-0 top-[46%] mx-auto h-px w-[58%] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">Debug Notes</p>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-100">
                      Connectivity fails because the destination subnet has no active router interface.
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">
                      Suggested fix: enable `G0/1` and set PC B&apos;s gateway to `10.0.20.1`.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8 max-w-2xl space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Core modules</p>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-foreground">
            Focused practice tools without the clutter.
          </h2>
          <p className="text-muted-foreground">
            The current release focuses on topology building, connectivity testing, guided diagnostics, labs, study workflows, roadmaps, and saved progress.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="labs" className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <Badge variant="success" className="w-fit">
                Guided labs
              </Badge>
              <CardTitle>Designed for daily skill-building</CardTitle>
              <CardDescription>
                Start with direct same-subnet communication, move into switching, then tackle a broken routed scenario with deterministic checks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Lab 1: Two PCs on the same subnet",
                "Lab 2: Add a switch and achieve connectivity",
                "Lab 3: Broken configuration troubleshooting challenge"
              ].map((lab) => (
                <div key={lab} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground">
                  {lab}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Badge variant="info" className="w-fit">
                Why NetVerse
              </Badge>
              <CardTitle>Built to feel like a serious engineering product</CardTitle>
              <CardDescription>
                Dark-mode-first visuals, clean information hierarchy, subtle motion, and practical explanations keep the experience useful without turning it into a toy.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[
                "Dark interface with electric green and blue accents",
                "Beginner-friendly explanations that stay technically honest",
                "Project saving, notes, resources, and progress tracking",
                "Spark-plan Firebase Hosting with Firestore persistence"
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
