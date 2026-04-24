"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CopyCheck,
  FlipHorizontal,
  Gauge,
  Lightbulb,
  Network,
  Play,
  RotateCcw,
  Route,
  Send,
  ShieldCheck,
  Sparkles,
  TerminalSquare
} from "lucide-react";

import {
  academyModules,
  architecturePatterns,
  awsFlashcards,
  featureShortcuts,
  hardeningTasks,
  homeLabSections,
  interviewPrompts,
  linuxDrills,
  packetJourneys,
  type AcademyModule,
  type AcademyModuleId
} from "@/lib/academy/data";
import { calculateSubnet } from "@/lib/academy/subnet";
import { readLocalStorage, writeLocalStorage } from "@/lib/utils/local-storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const accentStyles: Record<AcademyModule["accent"], string> = {
  emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  sky: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  rose: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  violet: "border-violet-400/25 bg-violet-400/10 text-violet-200"
};

const accentBars: Record<AcademyModule["accent"], string> = {
  emerald: "from-emerald-300 via-teal-300 to-sky-300",
  sky: "from-sky-300 via-cyan-200 to-emerald-200",
  amber: "from-amber-200 via-orange-300 to-rose-300",
  rose: "from-rose-300 via-fuchsia-300 to-amber-200",
  violet: "from-violet-300 via-sky-300 to-emerald-200"
};

const localStorageKeys = {
  awsLabs: "netverse-academy-aws-labs",
  hardening: "netverse-academy-hardening",
  docs: "netverse-academy-docs"
};

function normalizeCommand(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function scoreAnswer(answer: string, terms: string[]) {
  const normalized = answer.toLowerCase();
  return terms.filter((term) => normalized.includes(term));
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function ModuleButton({
  module,
  active,
  onSelect
}: {
  module: AcademyModule;
  active: boolean;
  onSelect: (id: AcademyModuleId) => void;
}) {
  const Icon = module.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(module.id)}
      className={`group flex min-h-[94px] w-full items-start gap-3 rounded-lg border p-4 text-left transition ${
        active
          ? "border-primary/35 bg-primary/10 shadow-glow"
          : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.065]"
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${accentStyles[module.accent]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs uppercase text-muted-foreground">{module.kicker}</span>
        <span className="mt-1 block text-sm font-medium text-foreground">{module.title}</span>
        <span className="mt-2 block text-xs text-muted-foreground">{module.metric}</span>
      </span>
    </button>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function AcademyHero({ selectedModule }: { selectedModule: AcademyModule }) {
  const Icon = selectedModule.icon;

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_380px]">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(14,23,34,0.96),rgba(18,28,44,0.86)_44%,rgba(31,27,22,0.88))] p-6 shadow-panel">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBars[selectedModule.accent]}`} />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
          <div className="space-y-5">
            <Badge variant="info" className="w-fit">
              Network, AWS, and Linux Academy
            </Badge>
            <div className="space-y-3">
              <h2 className="font-[family-name:var(--font-heading)] text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                One serious cockpit for becoming dangerous in the best possible technical sense.
              </h2>
              <p className="max-w-3xl text-base text-muted-foreground">
                Practice topology design, subnet math, AWS architecture, Linux operations, hardening, packets, costs, docs, and interviews from one polished study workspace.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatPill label="Tracks" value="Network / AWS / Linux" />
              <StatPill label="Tools" value="10 integrated modules" />
              <StatPill label="Mode" value="Portfolio-ready labs" />
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Active focus</p>
                <p className="mt-1 font-medium text-foreground">{selectedModule.title}</p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-lg border ${accentStyles[selectedModule.accent]}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <div className="space-y-3">
              {featureShortcuts.map((shortcut) => {
                const ShortcutIcon = shortcut.icon;

                return (
                  <Button key={shortcut.label} asChild variant="secondary" className="w-full justify-between">
                    <Link href={shortcut.href}>
                      <span className="inline-flex items-center gap-2">
                        <ShortcutIcon className="h-4 w-4" />
                        {shortcut.label}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <Badge variant="success" className="w-fit">
            Study loop
          </Badge>
          <CardTitle>Build, test, write, explain</CardTitle>
          <CardDescription>
            The app is structured around the same loop you will use in real operations work.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Design a network or AWS shape", "Test it with commands and packets", "Document what changed", "Explain it like an interview answer"].map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function NetworkingLabPanel() {
  const labRows = [
    { title: "Same-subnet ping", focus: "IPv4 addressing and masks", href: "/simulator?lab=lab-same-subnet" },
    { title: "Switch connectivity", focus: "Layer 2 path building", href: "/simulator?lab=lab-switch-connectivity" },
    { title: "Broken routing", focus: "Gateway and router interface repair", href: "/simulator?lab=lab-broken-routing" }
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.82fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Badge variant="success" className="mb-3 w-fit">
                Simulator
              </Badge>
              <CardTitle>Topology builder and lab launcher</CardTitle>
              <CardDescription>
                Jump into real device layouts, cable paths, ping results, and AI-assisted troubleshooting.
              </CardDescription>
            </div>
            <Network className="h-8 w-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {labRows.map((lab) => (
            <div key={lab.title} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-foreground">{lab.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{lab.focus}</p>
              </div>
              <Button asChild>
                <Link href={lab.href}>
                  <Play className="h-4 w-4" />
                  Launch
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Badge variant="info" className="w-fit">
            Mental model
          </Badge>
          <CardTitle>What the simulator teaches</CardTitle>
          <CardDescription>
            Treat every topology like an evidence trail from endpoint config to network path.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Layer 2 reachability before Layer 3 routing",
            "Default gateway choice per subnet",
            "Router interface status and mask alignment",
            "Failure reasons that map to concrete fixes"
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
              <Check className="h-4 w-4 text-primary" />
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AwsFlashcardPanel() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completedLabs, setCompletedLabs] = useState<string[]>([]);
  const card = awsFlashcards[index];

  useEffect(() => {
    setCompletedLabs(readLocalStorage(localStorageKeys.awsLabs, [] as string[]));
  }, []);

  useEffect(() => {
    writeLocalStorage(localStorageKeys.awsLabs, completedLabs);
  }, [completedLabs]);

  const complete = completedLabs.includes(card.service);

  function moveCard(direction: number) {
    setFlipped(false);
    setIndex((current) => (current + direction + awsFlashcards.length) % awsFlashcards.length);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <Badge variant="warning" className="w-fit">
            AWS flashcards
          </Badge>
          <CardTitle>{card.service}</CardTitle>
          <CardDescription>{card.tags.join(" / ")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            className="min-h-[210px] w-full rounded-lg border border-amber-300/20 bg-amber-300/10 p-5 text-left transition hover:border-amber-200/40"
          >
            <p className="mb-4 text-xs uppercase text-amber-200">{flipped ? "Answer" : "Prompt"}</p>
            <p className="text-lg font-medium leading-relaxed text-foreground">
              {flipped ? card.answer : card.prompt}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-amber-100">
              <FlipHorizontal className="h-4 w-4" />
              Flip card
            </div>
          </button>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => moveCard(-1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="secondary" onClick={() => moveCard(1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() =>
                setCompletedLabs((current) =>
                  current.includes(card.service)
                    ? current.filter((item) => item !== card.service)
                    : [...current, card.service]
                )
              }
              variant={complete ? "outline" : "default"}
            >
              <CopyCheck className="h-4 w-4" />
              {complete ? "Unmark lab" : "Mark lab done"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Badge variant="info" className="w-fit">
            Lab tracker
          </Badge>
          <CardTitle>{completedLabs.length}/{awsFlashcards.length} AWS labs complete</CardTitle>
          <CardDescription>Each service has a practice lab you can reproduce in a sandbox account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {awsFlashcards.map((item) => (
            <div key={item.service} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-foreground">{item.service}</p>
                <Badge variant={completedLabs.includes(item.service) ? "success" : "default"}>
                  {completedLabs.includes(item.service) ? "Complete" : "Open"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.lab}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LinuxTrainerPanel() {
  const [drillIndex, setDrillIndex] = useState(0);
  const [command, setCommand] = useState("");
  const [result, setResult] = useState<"idle" | "pass" | "miss">("idle");
  const drill = linuxDrills[drillIndex];

  function evaluateCommand() {
    const normalized = normalizeCommand(command);
    const expected = drill.expected.map(normalizeCommand);
    setResult(expected.includes(normalized) ? "pass" : "miss");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <Badge variant="info" className="w-fit">
            Linux terminal trainer
          </Badge>
          <CardTitle>{drill.title}</CardTitle>
          <CardDescription>{drill.scenario}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-sky-300/20 bg-sky-300/10 p-4 font-mono text-sm text-sky-50">
            <span className="text-sky-300">student@netverse:~$ </span>
            {command || <span className="text-muted-foreground">type your command below</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="linux-command">Command</Label>
            <Input
              id="linux-command"
              value={command}
              onChange={(event) => {
                setCommand(event.target.value);
                setResult("idle");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  evaluateCommand();
                }
              }}
              placeholder="Example: ss -tuln"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={evaluateCommand}>
              <TerminalSquare className="h-4 w-4" />
              Check command
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDrillIndex((value) => (value + 1) % linuxDrills.length);
                setCommand("");
                setResult("idle");
              }}
            >
              Next drill
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {result !== "idle" ? (
            <div className={`rounded-lg border p-4 text-sm ${result === "pass" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100" : "border-rose-400/20 bg-rose-400/10 text-rose-100"}`}>
              {result === "pass" ? drill.explain : `Try again. Hint: ${drill.hint}`}
            </div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Badge variant="default" className="w-fit">
            Drill queue
          </Badge>
          <CardTitle>Operations muscle memory</CardTitle>
          <CardDescription>Pick a drill and answer like you are on a real server.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {linuxDrills.map((item, itemIndex) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                setDrillIndex(itemIndex);
                setCommand("");
                setResult("idle");
              }}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                itemIndex === drillIndex
                  ? "border-sky-300/30 bg-sky-300/10 text-sky-100"
                  : "border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.title}
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SubnetCalculatorPanel() {
  const [input, setInput] = useState("192.168.10.25/27");
  const result = useMemo(() => {
    try {
      return { value: calculateSubnet(input), error: null };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : "Invalid CIDR input." };
    }
  }, [input]);

  const rows = result.value
    ? [
        ["Network", result.value.networkAddress],
        ["Broadcast", result.value.broadcastAddress],
        ["Usable range", `${result.value.firstUsable} - ${result.value.lastUsable}`],
        ["Subnet mask", result.value.subnetMask],
        ["Wildcard", result.value.wildcardMask],
        ["Usable hosts", result.value.hostCount.toLocaleString()]
      ]
    : [];

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <Badge variant="default" className="w-fit">
            CIDR calculator
          </Badge>
          <CardTitle>Subnet math without the fog</CardTitle>
          <CardDescription>Enter an IPv4 address with prefix length and inspect every derived value.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subnet-input">IPv4 / CIDR</Label>
            <Input id="subnet-input" value={input} onChange={(event) => setInput(event.target.value)} />
          </div>
          {result.error ? (
            <div className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
              {result.error}
            </div>
          ) : null}
          {result.value ? (
            <div className="rounded-lg border border-violet-300/20 bg-violet-300/10 p-4">
              <p className="text-xs uppercase text-violet-200">Binary address</p>
              <p className="mt-2 break-all font-mono text-sm text-violet-50">{result.value.binaryAddress}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Badge variant="info" className="w-fit">
            Breakdown
          </Badge>
          <CardTitle>Network facts</CardTitle>
          <CardDescription>Use these values to check gateways, ACLs, route summaries, and host assignments.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase text-muted-foreground">{label}</p>
              <p className="mt-2 font-mono text-sm text-foreground">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ArchitecturePanel() {
  const [patternId, setPatternId] = useState(architecturePatterns[0].id);
  const [workload, setWorkload] = useState("Public web app with a database, private app servers, image uploads, and monitoring.");
  const pattern = architecturePatterns.find((item) => item.id === patternId) ?? architecturePatterns[0];
  const wantsUploads = /upload|image|file|object|media/i.test(workload);
  const wantsQueue = /queue|worker|async|background/i.test(workload);
  const generatedComponents = [
    ...pattern.components,
    ...(wantsUploads ? ["S3 uploads bucket"] : []),
    ...(wantsQueue ? ["SQS worker queue"] : [])
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <Badge variant="success" className="w-fit">
            Architecture generator
          </Badge>
          <CardTitle>{pattern.label}</CardTitle>
          <CardDescription>{pattern.summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workload">Workload idea</Label>
            <Textarea id="workload" value={workload} onChange={(event) => setWorkload(event.target.value)} />
          </div>
          <div className="grid gap-2">
            {architecturePatterns.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPatternId(item.id)}
                className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                  item.id === patternId
                    ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                    : "border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Badge variant="info" className="w-fit">
            Generated map
          </Badge>
          <CardTitle>Recommended AWS shape</CardTitle>
          <CardDescription>Components are selected from the pattern and adjusted from your workload text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            {["Edge", "VPC", "Data and Ops"].map((tier, tierIndex) => (
              <div key={tier} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-3 text-xs uppercase text-muted-foreground">{tier}</p>
                <div className="space-y-2">
                  {generatedComponents
                    .filter((_, componentIndex) => componentIndex % 3 === tierIndex)
                    .map((component) => (
                      <div key={component} className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-foreground">
                        {component}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {pattern.risks.map((risk) => (
              <div key={risk} className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
                <Lightbulb className="mb-2 h-4 w-4" />
                {risk}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HomeLabDocsPanel() {
  const [sections, setSections] = useState(homeLabSections);

  useEffect(() => {
    setSections(readLocalStorage(localStorageKeys.docs, homeLabSections));
  }, []);

  useEffect(() => {
    writeLocalStorage(localStorageKeys.docs, sections);
  }, [sections]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge variant="info" className="mb-3 w-fit">
              Home lab notebook
            </Badge>
            <CardTitle>Portfolio-grade documentation board</CardTitle>
            <CardDescription>Keep the evidence that proves what you built, broke, learned, and fixed.</CardDescription>
          </div>
          <Button variant="secondary" onClick={() => setSections(homeLabSections)}>
            <RotateCcw className="h-4 w-4" />
            Reset notes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-4">
        {sections.map((section, index) => (
          <div key={section.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <Label htmlFor={`doc-${section.title}`}>{section.title}</Label>
            <Textarea
              id={`doc-${section.title}`}
              className="mt-3 min-h-[220px] font-mono text-xs"
              value={section.starter}
              onChange={(event) =>
                setSections((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, starter: event.target.value } : item
                  )
                )
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CostEstimatorPanel() {
  const [ec2Count, setEc2Count] = useState(2);
  const [ec2Hours, setEc2Hours] = useState(160);
  const [storageGb, setStorageGb] = useState(80);
  const [natHours, setNatHours] = useState(80);
  const [dataGb, setDataGb] = useState(40);
  const [rdsHours, setRdsHours] = useState(80);
  const rates = {
    ec2Hour: 0.012,
    storageGb: 0.1,
    natHour: 0.045,
    dataGb: 0.09,
    rdsHour: 0.026
  };
  const lineItems = [
    { label: "EC2 practice instances", value: ec2Count * ec2Hours * rates.ec2Hour },
    { label: "EBS storage", value: storageGb * rates.storageGb },
    { label: "NAT Gateway time", value: natHours * rates.natHour },
    { label: "Outbound transfer", value: dataGb * rates.dataGb },
    { label: "RDS practice database", value: rdsHours * rates.rdsHour }
  ];
  const total = lineItems.reduce((sum, item) => sum + item.value, 0);

  const sliders = [
    { label: "EC2 instances", value: ec2Count, set: setEc2Count, min: 0, max: 8, suffix: "" },
    { label: "EC2 hours", value: ec2Hours, set: setEc2Hours, min: 0, max: 730, suffix: "h" },
    { label: "Storage", value: storageGb, set: setStorageGb, min: 0, max: 500, suffix: "GB" },
    { label: "NAT hours", value: natHours, set: setNatHours, min: 0, max: 730, suffix: "h" },
    { label: "Transfer", value: dataGb, set: setDataGb, min: 0, max: 500, suffix: "GB" },
    { label: "RDS hours", value: rdsHours, set: setRdsHours, min: 0, max: 730, suffix: "h" }
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <Badge variant="warning" className="w-fit">
            Practice estimator
          </Badge>
          <CardTitle>Cloud cost intuition</CardTitle>
          <CardDescription>Training rates are simplified, so the goal is learning the cost shape.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {sliders.map((slider) => (
            <div key={slider.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <Label htmlFor={slider.label}>{slider.label}</Label>
                <span className="text-sm font-medium text-foreground">
                  {slider.value}
                  {slider.suffix}
                </span>
              </div>
              <input
                id={slider.label}
                type="range"
                min={slider.min}
                max={slider.max}
                value={slider.value}
                onChange={(event) => slider.set(Number(event.target.value))}
                className="w-full accent-amber-300"
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Badge variant="success" className="w-fit">
            Monthly shape
          </Badge>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <CircleDollarSign className="h-7 w-7 text-primary" />
            {money(total)}
          </CardTitle>
          <CardDescription>Approximate training estimate, not live AWS pricing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {lineItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground">{money(item.value)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function HardeningPanel() {
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    setChecked(readLocalStorage(localStorageKeys.hardening, [] as string[]));
  }, []);

  useEffect(() => {
    writeLocalStorage(localStorageKeys.hardening, checked);
  }, [checked]);

  const progress = Math.round((checked.length / hardeningTasks.length) * 100);

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <Badge variant="danger" className="w-fit">
            Linux hardening
          </Badge>
          <CardTitle>{progress}% complete</CardTitle>
          <CardDescription>Security fundamentals for a public or home-lab Linux server.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-rose-300 via-amber-200 to-emerald-300" style={{ width: `${progress}%` }} />
          </div>
          <Button variant="secondary" onClick={() => setChecked([])} className="w-full">
            <RotateCcw className="h-4 w-4" />
            Clear checklist
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Badge variant="info" className="w-fit">
            Controls
          </Badge>
          <CardTitle>Server baseline</CardTitle>
          <CardDescription>Check items as you complete them in a lab VM.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {hardeningTasks.map((task) => {
            const active = checked.includes(task);

            return (
              <button
                key={task}
                type="button"
                onClick={() =>
                  setChecked((current) =>
                    current.includes(task)
                      ? current.filter((item) => item !== task)
                      : [...current, task]
                  )
                }
                className={`flex items-center gap-3 rounded-lg border p-4 text-left text-sm transition ${
                  active
                    ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-50"
                    : "border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${active ? "border-emerald-300/30 bg-emerald-300/20" : "border-white/15 bg-white/5"}`}>
                  {active ? <Check className="h-4 w-4" /> : null}
                </span>
                {task}
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function PacketJourneyPanel() {
  const [journeyId, setJourneyId] = useState(packetJourneys[0].id);
  const [step, setStep] = useState(0);
  const journey = packetJourneys.find((item) => item.id === journeyId) ?? packetJourneys[0];

  function selectJourney(id: string) {
    setJourneyId(id);
    setStep(0);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <Badge variant="default" className="w-fit">
            Packet visualizer
          </Badge>
          <CardTitle>Choose a journey</CardTitle>
          <CardDescription>Walk through what each device or service contributes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {packetJourneys.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectJourney(item.id)}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                item.id === journeyId
                  ? "border-violet-300/30 bg-violet-300/10 text-violet-100"
                  : "border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Badge variant="info" className="w-fit">
            Step {step + 1} of {journey.steps.length}
          </Badge>
          <CardTitle>{journey.label}</CardTitle>
          <CardDescription>{journey.steps[step]}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-5">
            {journey.nodes.map((node, index) => (
              <div key={node} className={`rounded-lg border p-4 text-center transition ${
                index <= step
                  ? "border-violet-300/30 bg-violet-300/10 text-violet-50"
                  : "border-white/10 bg-white/[0.04] text-muted-foreground"
              }`}>
                <Route className="mx-auto mb-2 h-5 w-5" />
                <p className="text-sm font-medium">{node}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setStep((value) => Math.max(value - 1, 0))}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setStep((value) => Math.min(value + 1, journey.steps.length - 1))}>
              Next hop
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InterviewPanel() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const prompt = interviewPrompts[promptIndex];
  const foundTerms = scoreAnswer(answer, prompt.strongTerms);
  const score = answer.trim() ? Math.round((foundTerms.length / prompt.strongTerms.length) * 100) : 0;

  return (
    <div id="interview" className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <Badge variant="success" className="w-fit">
            Interview bot
          </Badge>
          <CardTitle>{prompt.question}</CardTitle>
          <CardDescription>Answer in your own words, then use the signal panel to tighten it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="min-h-[220px]"
            placeholder="Speak like you would in an interview..."
          />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setPromptIndex((value) => (value + 1) % interviewPrompts.length);
                setAnswer("");
              }}
            >
              Next prompt
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setAnswer(prompt.sample)}>
              <Sparkles className="h-4 w-4" />
              Show sample shape
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Badge variant={score >= 70 ? "success" : score >= 35 ? "warning" : "default"} className="w-fit">
            {score}% signal
          </Badge>
          <CardTitle>Keyword coverage</CardTitle>
          <CardDescription>{prompt.sample}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {prompt.strongTerms.map((term) => (
              <span
                key={term}
                className={`rounded-full border px-3 py-1 text-xs ${
                  foundTerms.includes(term)
                    ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                    : "border-white/10 bg-white/[0.04] text-muted-foreground"
                }`}
              >
                {term}
              </span>
            ))}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-muted-foreground">
            Strong interview answers usually include clear sequence, tradeoffs, and one practical troubleshooting check.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ModuleDetail({ selectedModuleId }: { selectedModuleId: AcademyModuleId }) {
  switch (selectedModuleId) {
    case "networking":
      return <NetworkingLabPanel />;
    case "aws":
      return <AwsFlashcardPanel />;
    case "linux":
      return <LinuxTrainerPanel />;
    case "subnetting":
      return <SubnetCalculatorPanel />;
    case "architecture":
      return <ArchitecturePanel />;
    case "docs":
      return <HomeLabDocsPanel />;
    case "cost":
      return <CostEstimatorPanel />;
    case "hardening":
      return <HardeningPanel />;
    case "packets":
      return <PacketJourneyPanel />;
    case "interview":
      return <InterviewPanel />;
    default:
      return <NetworkingLabPanel />;
  }
}

export function AcademyPage() {
  const [selectedModuleId, setSelectedModuleId] = useState<AcademyModuleId>("networking");
  const selectedModule = academyModules.find((module) => module.id === selectedModuleId) ?? academyModules[0];
  const SelectedIcon = selectedModule.icon;

  return (
    <div className="space-y-6 px-6 py-8 lg:px-8">
      <AcademyHero selectedModule={selectedModule} />

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <Badge variant="default" className="w-fit">
              Academy modules
            </Badge>
            <CardTitle>Pick a skill surface</CardTitle>
            <CardDescription>Each module is interactive and tuned for network, AWS, and Linux study sessions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {academyModules.map((module) => (
              <ModuleButton
                key={module.id}
                module={module}
                active={module.id === selectedModuleId}
                onSelect={setSelectedModuleId}
              />
            ))}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-5">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-lg border ${accentStyles[selectedModule.accent]}`}>
                  <SelectedIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">{selectedModule.kicker}</p>
                  <h3 className="text-xl font-semibold text-foreground">{selectedModule.title}</h3>
                </div>
              </div>
              <Badge variant="info" className="w-fit">
                {selectedModule.metric}
              </Badge>
            </div>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{selectedModule.description}</p>
          </div>
          <ModuleDetail selectedModuleId={selectedModuleId} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Gauge, title: "Daily rhythm", body: "One subnet drill, one Linux command, one AWS flashcard, one interview answer." },
          { icon: ShieldCheck, title: "Real-world posture", body: "Every tool connects to troubleshooting, operating, securing, or explaining systems." },
          { icon: Send, title: "Portfolio output", body: "Saved topologies, lab notes, diagrams, and runbooks become interview material." }
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <item.icon className="mb-4 h-5 w-5 text-primary" />
            <h3 className="font-medium text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
