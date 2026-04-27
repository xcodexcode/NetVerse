"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { calculateSubnet } from "@/lib/academy/subnet";
import {
  converterPorts,
  roadmapPresets,
  starterConceptEdges,
  starterConceptNodes,
  starterNotes,
  starterResources,
  starterTasks,
  studioHeroMetrics,
  studioPanels,
  type ConceptEdge,
  type ConceptNode,
  type Flashcard,
  type ResourceLink,
  type ResourceType,
  type RoadmapMilestone,
  type RoadmapPreset,
  type StudioPanelId,
  type StudioTask,
  type StudyNote
} from "@/lib/studio/data";
import {
  calculateBandwidthDelayProduct,
  convertNumber,
  decodePdfText,
  estimateTcpPayload,
  extractConceptsFromNote,
  extractFlashcardsFromText,
  makeStudioId,
  parseTags
} from "@/lib/studio/tools";
import { cn } from "@/lib/utils/cn";
import { readLocalStorage, writeLocalStorage } from "@/lib/utils/local-storage";

const STORAGE_KEYS = {
  notes: "netverse.studio.notes",
  nodes: "netverse.studio.nodes",
  edges: "netverse.studio.edges",
  cards: "netverse.studio.cards",
  resources: "netverse.studio.resources",
  tasks: "netverse.studio.tasks",
  roadmap: "netverse.studio.roadmap"
};

const toneClasses: Record<ConceptNode["tone"], string> = {
  primary: "border-primary/30 bg-primary/15 text-primary shadow-[0_0_35px_rgba(78,255,166,0.14)]",
  accent: "border-sky-300/30 bg-sky-400/15 text-sky-200 shadow-[0_0_35px_rgba(56,189,248,0.12)]",
  warning: "border-amber-300/30 bg-amber-400/15 text-amber-200",
  danger: "border-rose-300/30 bg-rose-400/15 text-rose-200",
  muted: "border-white/10 bg-white/10 text-foreground"
};

const priorityVariants: Record<StudioTask["priority"], "default" | "warning" | "danger"> = {
  low: "default",
  medium: "warning",
  high: "danger"
};

function nowIso() {
  return new Date().toISOString();
}

function cloneMilestones(preset: RoadmapPreset) {
  return preset.milestones.map((milestone) => ({ ...milestone, id: makeStudioId(milestone.id) }));
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function StudioHero({
  noteCount,
  cardCount,
  completedTasks
}: {
  noteCount: number;
  cardCount: number;
  completedTasks: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-panel">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(78,255,166,0.16),transparent_26%),radial-gradient(circle_at_78%_16%,rgba(56,189,248,0.18),transparent_28%)]" />
      <div className="relative grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Badge variant="info" className="mb-4 w-fit">
            Learning OS
          </Badge>
          <h1 className="max-w-4xl font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
            Build the way serious network engineers actually learn.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Studio turns NetVerse into a daily command center: capture notes, map concepts, generate flashcards, protect your best resources, run focus sprints, track tasks, convert network values, and build roadmaps.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {[
            ...studioHeroMetrics,
            { label: "Active cards", value: String(cardCount), icon: Sparkles },
            { label: "Tasks done", value: String(completedTasks), icon: CheckCircle2 },
            { label: "Notes saved", value: String(noteCount), icon: FileText }
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <div className="text-2xl font-semibold text-foreground">{metric.value}</div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{metric.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NotesPanel({
  notes,
  selectedNoteId,
  setSelectedNoteId,
  setNotes,
  onCreateCards,
  onCreateSchema
}: {
  notes: StudyNote[];
  selectedNoteId: string;
  setSelectedNoteId: Dispatch<SetStateAction<string>>;
  setNotes: Dispatch<SetStateAction<StudyNote[]>>;
  onCreateCards: (note: StudyNote) => void;
  onCreateSchema: (note: StudyNote) => void;
}) {
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? notes[0];

  function createNote() {
    const note: StudyNote = {
      id: makeStudioId("note"),
      title: "Untitled network note",
      body: "Topic: \nKey idea: \nWhy it matters: \nCommon mistake: ",
      tags: ["new"],
      updatedAt: nowIso()
    };

    setNotes((current) => [note, ...current]);
    setSelectedNoteId(note.id);
  }

  function updateSelectedNote(updates: Partial<StudyNote>) {
    if (!selectedNote) {
      return;
    }

    setNotes((current) =>
      current.map((note) =>
        note.id === selectedNote.id ? { ...note, ...updates, updatedAt: nowIso() } : note
      )
    );
  }

  function deleteSelectedNote() {
    if (!selectedNote || notes.length === 1) {
      return;
    }

    setNotes((current) => current.filter((note) => note.id !== selectedNote.id));
    setSelectedNoteId(notes.find((note) => note.id !== selectedNote.id)?.id ?? notes[0].id);
  }

  if (!selectedNote) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Notes vault</CardTitle>
              <CardDescription>Turn study fragments into clean, reusable knowledge.</CardDescription>
            </div>
            <Button size="sm" onClick={createNote}>
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes.map((note) => (
            <button
              key={note.id}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition-colors",
                selectedNote.id === note.id
                  ? "border-primary/30 bg-primary/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
              onClick={() => setSelectedNoteId(note.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{note.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{note.body}</p>
                </div>
                <Badge>{note.body.split(/\s+/).filter(Boolean).length} words</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-xs text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Editor</CardTitle>
              <CardDescription>Write like you are building your future troubleshooting brain.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => onCreateCards(selectedNote)}>
                Make flashcards
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onCreateSchema(selectedNote)}>
                Map concepts
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={deleteSelectedNote}
                disabled={notes.length === 1}
                aria-label="Delete selected note"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_0.7fr]">
            <div className="space-y-2">
              <Label htmlFor="studio-note-title">Title</Label>
              <Input
                id="studio-note-title"
                value={selectedNote.title}
                onChange={(event) => updateSelectedNote({ title: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studio-note-tags">Tags</Label>
              <Input
                id="studio-note-tags"
                value={selectedNote.tags.join(", ")}
                onChange={(event) => updateSelectedNote({ tags: parseTags(event.target.value) })}
                placeholder="subnetting, routing, ccna"
              />
            </div>
          </div>
          <Textarea
            value={selectedNote.body}
            onChange={(event) => updateSelectedNote({ body: event.target.value })}
            className="min-h-[420px] resize-none text-base leading-7"
            placeholder="Write the concept, the mistake, the fix, and how you would explain it to a beginner."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SchemaPanel({
  nodes,
  edges,
  setNodes,
  setEdges,
  selectedNote
}: {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  setNodes: Dispatch<SetStateAction<ConceptNode[]>>;
  setEdges: Dispatch<SetStateAction<ConceptEdge[]>>;
  selectedNote?: StudyNote;
}) {
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [edgeLabel, setEdgeLabel] = useState("relates to");
  const edgeLines = edges
    .map((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);
      return sourceNode && targetNode ? { edge, sourceNode, targetNode } : null;
    })
    .filter((item): item is { edge: ConceptEdge; sourceNode: ConceptNode; targetNode: ConceptNode } => Boolean(item));

  function addNode() {
    if (!label.trim()) {
      return;
    }

    setNodes((current) => [
      ...current,
      {
        id: makeStudioId("concept"),
        label: label.trim(),
        detail: detail.trim() || "Custom concept for visual experimentation.",
        x: 18 + ((current.length * 17) % 65),
        y: 20 + ((current.length * 23) % 55),
        tone: current.length % 2 === 0 ? "primary" : "accent"
      }
    ]);
    setLabel("");
    setDetail("");
  }

  function addEdge() {
    if (!source || !target || source === target) {
      return;
    }

    setEdges((current) => [
      ...current,
      { id: makeStudioId("edge"), source, target, label: edgeLabel.trim() || "connects to" }
    ]);
  }

  function removeNode(nodeId: string) {
    setNodes((current) => current.filter((node) => node.id !== nodeId));
    setEdges((current) => current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.75fr]">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Concept schema board</CardTitle>
          <CardDescription>Use this like a whiteboard for visual learning and mental models.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative min-h-[520px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/80">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(113,255,214,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(113,255,214,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
            <svg className="absolute inset-0 h-full w-full" role="presentation">
              {edgeLines.map(({ edge, sourceNode, targetNode }) => (
                <g key={edge.id}>
                  <line
                    x1={`${sourceNode.x}%`}
                    y1={`${sourceNode.y}%`}
                    x2={`${targetNode.x}%`}
                    y2={`${targetNode.y}%`}
                    stroke="rgba(125, 255, 216, 0.36)"
                    strokeWidth="2"
                  />
                  <text
                    x={`${(sourceNode.x + targetNode.x) / 2}%`}
                    y={`${(sourceNode.y + targetNode.y) / 2}%`}
                    fill="rgba(226, 232, 240, 0.72)"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </g>
              ))}
            </svg>
            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onDoubleClick={() => removeNode(node.id)}
                className={cn(
                  "absolute max-w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-4 text-left backdrop-blur transition-transform hover:scale-105",
                  toneClasses[node.tone]
                )}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                title="Double-click to remove"
              >
                <p className="font-semibold">{node.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{node.detail}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add concept</CardTitle>
            <CardDescription>Sketch ideas before they become full simulator designs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="NAT gateway" />
            <Textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="What it does and when it matters." />
            <Button className="w-full" onClick={addNode}>
              <Plus className="h-4 w-4" />
              Add node
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add relationship</CardTitle>
            <CardDescription>Connect two ideas with a short label.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="Source concept" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Target concept" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={edgeLabel} onChange={(event) => setEdgeLabel(event.target.value)} placeholder="depends on" />
            <Button variant="secondary" className="w-full" onClick={addEdge}>
              Link concepts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fast actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="secondary"
              className="w-full justify-between"
              onClick={() => {
                if (!selectedNote) {
                  return;
                }

                const schema = extractConceptsFromNote(selectedNote);
                setNodes(schema.nodes);
                setEdges(schema.edges);
              }}
            >
              Use selected note
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => {
                setNodes(starterConceptNodes);
                setEdges(starterConceptEdges);
              }}
            >
              Reset starter schema
              <RotateCcw className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">Tip: double-click a node to remove it.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FlashcardsPanel({
  cards,
  setCards,
  selectedNote
}: {
  cards: Flashcard[];
  setCards: Dispatch<SetStateAction<Flashcard[]>>;
  selectedNote?: StudyNote;
}) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const activeCard = cards[activeIndex] ?? cards[0];
  const knownCount = cards.filter((card) => card.confidence === "known").length;

  function addManualCard() {
    if (!front.trim() || !back.trim()) {
      return;
    }

    setCards((current) => [
      {
        id: makeStudioId("card"),
        front: front.trim(),
        back: back.trim(),
        source: "manual",
        confidence: "new"
      },
      ...current
    ]);
    setFront("");
    setBack("");
    setActiveIndex(0);
    setFlipped(false);
  }

  function addCardsFromNote() {
    if (!selectedNote) {
      return;
    }

    const generated = extractFlashcardsFromText(selectedNote.body, "note");
    setCards((current) => [...generated, ...current]);
    setImportMessage(generated.length ? `Generated ${generated.length} cards from "${selectedNote.title}".` : "No definition-style lines found yet.");
  }

  async function importCards(file?: File) {
    if (!file) {
      return;
    }

    const text =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
        ? await decodePdfText(file)
        : await file.text();
    const generated = extractFlashcardsFromText(text, file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "note");

    if (generated.length === 0) {
      setImportMessage("I could not find definition-style text. Try lines like: CIDR: Classless Inter-Domain Routing.");
      return;
    }

    setCards((current) => [...generated, ...current]);
    setImportMessage(`Imported ${generated.length} cards from ${file.name}.`);
    setActiveIndex(0);
    setFlipped(false);
  }

  function setConfidence(confidence: Flashcard["confidence"]) {
    if (!activeCard) {
      return;
    }

    setCards((current) => current.map((card) => (card.id === activeCard.id ? { ...card, confidence } : card)));
  }

  function move(delta: number) {
    if (cards.length === 0) {
      return;
    }

    setActiveIndex((current) => (current + delta + cards.length) % cards.length);
    setFlipped(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Review deck</CardTitle>
              <CardDescription>{cards.length} cards, {knownCount} marked known.</CardDescription>
            </div>
            <Badge variant="success">{cards.length ? Math.round((knownCount / cards.length) * 100) : 0}% mastery</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {activeCard ? (
            <>
              <button
                type="button"
                onClick={() => setFlipped((current) => !current)}
                className="min-h-[320px] w-full rounded-[1.8rem] border border-primary/20 bg-[radial-gradient(circle_at_20%_10%,rgba(78,255,166,0.16),transparent_34%),linear-gradient(145deg,rgba(15,23,42,0.95),rgba(2,6,23,0.95))] p-8 text-left shadow-panel transition-transform hover:scale-[1.01]"
              >
                <Badge className="mb-6">{flipped ? "Answer" : "Prompt"}</Badge>
                <p className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight text-foreground">
                  {flipped ? activeCard.back : activeCard.front}
                </p>
                <p className="mt-8 text-sm text-muted-foreground">Click card to flip. Source: {activeCard.source}.</p>
              </button>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => move(-1)}>Previous</Button>
                  <Button variant="secondary" onClick={() => move(1)}>Next</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setConfidence("new")}>New</Button>
                  <Button variant="outline" size="sm" onClick={() => setConfidence("learning")}>Learning</Button>
                  <Button size="sm" onClick={() => setConfidence("known")}>Known</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-muted-foreground">
              Create or import cards to start a review session.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create card</CardTitle>
            <CardDescription>Manual cards are best for commands, port numbers, and gotchas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={front} onChange={(event) => setFront(event.target.value)} placeholder="What is ARP?" />
            <Textarea value={back} onChange={(event) => setBack(event.target.value)} placeholder="ARP maps an IPv4 address to a MAC address on the local network." />
            <Button className="w-full" onClick={addManualCard}>
              <Plus className="h-4 w-4" />
              Add card
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate cards</CardTitle>
            <CardDescription>Works best when notes use definition patterns like term: explanation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" className="w-full justify-between" onClick={addCardsFromNote}>
              From selected note
              <Sparkles className="h-4 w-4" />
            </Button>
            <Label
              htmlFor="flashcard-import"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
            >
              <Upload className="h-4 w-4" />
              Import .txt, .md, or simple PDF
            </Label>
            <Input
              id="flashcard-import"
              type="file"
              accept=".txt,.md,.pdf,text/plain,application/pdf"
              className="hidden"
              onChange={(event) => void importCards(event.target.files?.[0])}
            />
            {importMessage ? <p className="rounded-2xl bg-white/5 p-3 text-sm text-muted-foreground">{importMessage}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResourcesPanel({
  resources,
  setResources
}: {
  resources: ResourceLink[];
  setResources: Dispatch<SetStateAction<ResourceLink[]>>;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ResourceType | "all">("all");
  const [draft, setDraft] = useState({
    title: "",
    url: "",
    type: "article" as ResourceType,
    topic: "",
    note: ""
  });
  const filteredResources = resources.filter((resource) => {
    const haystack = `${resource.title} ${resource.topic} ${resource.note}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (type === "all" || resource.type === type);
  });

  function addResource() {
    if (!draft.title.trim() || !draft.url.trim()) {
      return;
    }

    setResources((current) => [
      {
        id: makeStudioId("resource"),
        title: draft.title.trim(),
        url: draft.url.trim(),
        type: draft.type,
        topic: draft.topic.trim() || "General",
        note: draft.note.trim() || "Saved for future review.",
        favorite: false
      },
      ...current
    ]);
    setDraft({ title: "", url: "", type: "article", topic: "", note: "" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.8fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Resource guard</CardTitle>
              <CardDescription>Protect the links, tools, docs, and playlists worth returning to.</CardDescription>
            </div>
            <Badge variant="info">{filteredResources.length} visible</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search routing, AWS, YouTube, tools..." />
            </div>
            <Select value={type} onValueChange={(value) => setType(value as ResourceType | "all")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All resources</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="playlist">Playlists</SelectItem>
                <SelectItem value="cheat-sheet">Cheat sheets</SelectItem>
                <SelectItem value="tool">Tools</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {resource.favorite ? <Star className="h-4 w-4 fill-amber-300 text-amber-300" /> : null}
                      <p className="font-medium text-foreground">{resource.title}</p>
                      <Badge>{resource.type}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{resource.note}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-primary">{resource.topic}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setResources((current) =>
                          current.map((item) => (item.id === resource.id ? { ...item, favorite: !item.favorite } : item))
                        )
                      }
                      aria-label="Toggle favorite"
                    >
                      <Star className={cn("h-4 w-4", resource.favorite && "fill-amber-300 text-amber-300")} />
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <a href={resource.url} target="_blank" rel="noreferrer">
                        Open
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add guarded resource</CardTitle>
          <CardDescription>Keep high-signal study material close instead of losing it in browser tabs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Title" />
          <Input value={draft.url} onChange={(event) => setDraft((current) => ({ ...current, url: event.target.value }))} placeholder="https://..." />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={draft.type} onValueChange={(value) => setDraft((current) => ({ ...current, type: value as ResourceType }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="playlist">Playlist</SelectItem>
                <SelectItem value="cheat-sheet">Cheat sheet</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
              </SelectContent>
            </Select>
            <Input value={draft.topic} onChange={(event) => setDraft((current) => ({ ...current, topic: event.target.value }))} placeholder="Topic" />
          </div>
          <Textarea value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Why this resource matters." />
          <Button className="w-full" onClick={addResource}>
            <Plus className="h-4 w-4" />
            Save resource
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PomodoroPanel() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const totalSeconds = (mode === "focus" ? focusMinutes : breakMinutes) * 60;
  const progress = totalSeconds > 0 ? 100 - (secondsLeft / totalSeconds) * 100 : 0;

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running]);

  function reset(nextMode = mode) {
    setMode(nextMode);
    setSecondsLeft((nextMode === "focus" ? focusMinutes : breakMinutes) * 60);
    setRunning(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.8fr]">
      <Card className="overflow-hidden">
        <CardHeader>
          <Badge variant={mode === "focus" ? "success" : "info"} className="w-fit">
            {mode === "focus" ? "Deep work" : "Recovery"}
          </Badge>
          <CardTitle>Pomodoro focus cockpit</CardTitle>
          <CardDescription>Use it for subnet drills, lab writeups, flashcard review, or resource watching.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center">
            <div className="mx-auto mb-8 flex h-64 w-64 items-center justify-center rounded-full border border-primary/20 bg-primary/10 shadow-[0_0_80px_rgba(78,255,166,0.12)]">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{mode} timer</p>
                <p className="mt-4 font-[family-name:var(--font-heading)] text-6xl font-semibold text-foreground">
                  {formatTimer(secondsLeft)}
                </p>
              </div>
            </div>
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => setRunning((current) => !current)}>
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? "Pause" : "Start"}
              </Button>
              <Button variant="secondary" onClick={() => reset()}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button variant="outline" onClick={() => reset(mode === "focus" ? "break" : "focus")}>
                Switch mode
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session setup</CardTitle>
          <CardDescription>Make focus blocks fit the kind of work you are doing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="focus-minutes">Focus minutes</Label>
            <Input
              id="focus-minutes"
              type="number"
              min={5}
              max={90}
              value={focusMinutes}
              onChange={(event) => setFocusMinutes(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="break-minutes">Break minutes</Label>
            <Input
              id="break-minutes"
              type="number"
              min={1}
              max={30}
              value={breakMinutes}
              onChange={(event) => setBreakMinutes(Number(event.target.value))}
            />
          </div>
          <Button variant="secondary" className="w-full" onClick={() => reset(mode)}>
            Apply timer lengths
          </Button>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
            Pro move: run one 25 minute block for learning, then one 10 minute block just to write what broke and how you fixed it.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TasksPanel({
  tasks,
  setTasks
}: {
  tasks: StudioTask[];
  setTasks: Dispatch<SetStateAction<StudioTask[]>>;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<StudioTask["priority"]>("medium");
  const doneCount = tasks.filter((task) => task.done).length;

  function addTask() {
    if (!title.trim()) {
      return;
    }

    setTasks((current) => [{ id: makeStudioId("task"), title: title.trim(), priority, done: false }, ...current]);
    setTitle("");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Mission list</CardTitle>
              <CardDescription>Keep the next concrete action visible.</CardDescription>
            </div>
            <Badge variant="success">{doneCount}/{tasks.length} complete</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() =>
                  setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, done: !item.done } : item)))
                }
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    task.done ? "border-primary bg-primary text-primary-foreground" : "border-white/20"
                  )}
                >
                  {task.done ? <CheckCircle2 className="h-4 w-4" /> : null}
                </span>
                <span className={cn("font-medium text-foreground", task.done && "text-muted-foreground line-through")}>
                  {task.title}
                </span>
              </button>
              <Badge variant={priorityVariants[task.priority]}>{task.priority}</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))}
                aria-label="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add task</CardTitle>
          <CardDescription>Turn vague motivation into a visible next step.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Watch one BGP intro and make 5 cards" />
          <Select value={priority} onValueChange={(value) => setPriority(value as StudioTask["priority"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low priority</SelectItem>
              <SelectItem value="medium">Medium priority</SelectItem>
              <SelectItem value="high">High priority</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={addTask}>
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ConvertersPanel() {
  const [cidr, setCidr] = useState("192.168.10.25/24");
  const [numberValue, setNumberValue] = useState("0b11000000");
  const [bdpMbps, setBdpMbps] = useState(100);
  const [bdpLatency, setBdpLatency] = useState(45);
  const [mtu, setMtu] = useState(1500);
  const [ipv6, setIpv6] = useState(false);
  const subnetResult = useMemo(() => {
    try {
      return { value: calculateSubnet(cidr), error: "" };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : "Invalid subnet." };
    }
  }, [cidr]);
  const numberResult = useMemo(() => {
    try {
      return { value: convertNumber(numberValue), error: "" };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : "Invalid number." };
    }
  }, [numberValue]);
  const bdpResult = useMemo(() => {
    try {
      return { value: calculateBandwidthDelayProduct(bdpMbps, bdpLatency), error: "" };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : "Invalid BDP." };
    }
  }, [bdpMbps, bdpLatency]);
  const payloadResult = useMemo(() => {
    try {
      return { value: estimateTcpPayload(mtu, ipv6), error: "" };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : "Invalid MTU." };
    }
  }, [mtu, ipv6]);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Subnet calculator</CardTitle>
          <CardDescription>CIDR ranges, masks, wildcards, usable hosts, and binary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={cidr} onChange={(event) => setCidr(event.target.value)} />
          {subnetResult.value ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Network", subnetResult.value.networkAddress],
                ["Broadcast", subnetResult.value.broadcastAddress],
                ["First usable", subnetResult.value.firstUsable],
                ["Last usable", subnetResult.value.lastUsable],
                ["Subnet mask", subnetResult.value.subnetMask],
                ["Wildcard", subnetResult.value.wildcardMask],
                ["Hosts", subnetResult.value.hostCount.toString()],
                ["Binary IP", subnetResult.value.binaryAddress]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                  <p className="mt-1 font-mono text-sm text-foreground">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{subnetResult.error}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Number base converter</CardTitle>
          <CardDescription>Quick binary, decimal, and hex conversion for masks, ports, and labs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={numberValue} onChange={(event) => setNumberValue(event.target.value)} placeholder="192, 0b11000000, C0h, 0xC0" />
          {numberResult.value ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Decimal", numberResult.value.decimal],
                ["Binary", numberResult.value.binary],
                ["Hex", numberResult.value.hex]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                  <p className="mt-1 break-all font-mono text-sm text-foreground">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{numberResult.error}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bandwidth delay product</CardTitle>
          <CardDescription>Estimate how much data can be in flight on a path.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Bandwidth Mbps</Label>
              <Input type="number" value={bdpMbps} onChange={(event) => setBdpMbps(Number(event.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Latency ms</Label>
              <Input type="number" value={bdpLatency} onChange={(event) => setBdpLatency(Number(event.target.value))} />
            </div>
          </div>
          {bdpResult.value ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <p className="text-sm text-muted-foreground">Estimated window target</p>
              <p className="mt-1 text-2xl font-semibold text-primary">{bdpResult.value.human}</p>
            </div>
          ) : (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{bdpResult.error}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MTU payload estimator</CardTitle>
          <CardDescription>Find TCP payload after IP and TCP headers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <Input type="number" value={mtu} onChange={(event) => setMtu(Number(event.target.value))} />
            <Button variant={ipv6 ? "default" : "secondary"} onClick={() => setIpv6((current) => !current)}>
              {ipv6 ? "IPv6 headers" : "IPv4 headers"}
            </Button>
          </div>
          {payloadResult.value ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-muted-foreground">
                {payloadResult.value.ipVersion} header {payloadResult.value.ipHeader} bytes + TCP header {payloadResult.value.tcpHeader} bytes
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{payloadResult.value.payload} byte payload</p>
            </div>
          ) : (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{payloadResult.error}</p>
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Common ports</CardTitle>
          <CardDescription>Fast reference for junior network engineering interviews and troubleshooting.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {converterPorts.map((item) => (
            <div key={`${item.port}-${item.protocol}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-mono text-lg font-semibold text-primary">{item.port}</p>
              <p className="mt-1 font-medium text-foreground">{item.protocol}</p>
              <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RoadmapPanel({
  milestones,
  setMilestones
}: {
  milestones: RoadmapMilestone[];
  setMilestones: Dispatch<SetStateAction<RoadmapMilestone[]>>;
}) {
  const [presetId, setPresetId] = useState(roadmapPresets[0].id);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    duration: "1 week",
    focus: ""
  });
  const completed = milestones.filter((milestone) => milestone.done).length;

  function addMilestone() {
    if (!draft.title.trim()) {
      return;
    }

    setMilestones((current) => [
      ...current,
      {
        id: makeStudioId("roadmap"),
        title: draft.title.trim(),
        description: draft.description.trim() || "Custom milestone for your path.",
        duration: draft.duration.trim() || "1 week",
        focus: parseTags(draft.focus),
        done: false
      }
    ]);
    setDraft({ title: "", description: "", duration: "1 week", focus: "" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Roadmap builder</CardTitle>
              <CardDescription>Presets for momentum, custom milestones for ownership.</CardDescription>
            </div>
            <Badge variant="success">{completed}/{milestones.length} milestones done</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4">
            <div className="absolute bottom-8 left-5 top-8 w-px bg-white/10" />
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <button
                  type="button"
                  className={cn(
                    "relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                    milestone.done ? "border-primary bg-primary text-primary-foreground" : "border-white/15 bg-slate-950 text-muted-foreground"
                  )}
                  onClick={() =>
                    setMilestones((current) =>
                      current.map((item) => (item.id === milestone.id ? { ...item, done: !item.done } : item))
                    )
                  }
                >
                  {milestone.done ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                    <Badge>{milestone.duration}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{milestone.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {milestone.focus.map((focus) => (
                      <span key={focus} className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMilestones((current) => current.filter((item) => item.id !== milestone.id))}
                  aria-label="Delete milestone"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Load preset</CardTitle>
            <CardDescription>Use one of the ready-made paths, then customize it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={presetId} onValueChange={setPresetId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roadmapPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
              {roadmapPresets.find((preset) => preset.id === presetId)?.description}
            </div>
            <Button
              className="w-full"
              onClick={() => {
                const preset = roadmapPresets.find((item) => item.id === presetId) ?? roadmapPresets[0];
                setMilestones(cloneMilestones(preset));
              }}
            >
              Apply preset
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom milestone</CardTitle>
            <CardDescription>Build a path that matches your target job or exam.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Master OSPF basics" />
            <Textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="What should be true when this is done?" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={draft.duration} onChange={(event) => setDraft((current) => ({ ...current, duration: event.target.value }))} placeholder="2 weeks" />
              <Input value={draft.focus} onChange={(event) => setDraft((current) => ({ ...current, focus: event.target.value }))} placeholder="simulator, notes" />
            </div>
            <Button variant="secondary" className="w-full" onClick={addMilestone}>
              <Plus className="h-4 w-4" />
              Add milestone
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function LearningStudioPage() {
  const [activePanel, setActivePanel] = useState<StudioPanelId>("notes");
  const [notes, setNotes] = useState<StudyNote[]>(() => readLocalStorage(STORAGE_KEYS.notes, starterNotes));
  const [selectedNoteId, setSelectedNoteId] = useState(() => notes[0]?.id ?? "");
  const [nodes, setNodes] = useState<ConceptNode[]>(() => readLocalStorage(STORAGE_KEYS.nodes, starterConceptNodes));
  const [edges, setEdges] = useState<ConceptEdge[]>(() => readLocalStorage(STORAGE_KEYS.edges, starterConceptEdges));
  const [cards, setCards] = useState<Flashcard[]>(() =>
    readLocalStorage(STORAGE_KEYS.cards, extractFlashcardsFromText(starterNotes.map((note) => note.body).join("\n"), "note"))
  );
  const [resources, setResources] = useState<ResourceLink[]>(() => readLocalStorage(STORAGE_KEYS.resources, starterResources));
  const [tasks, setTasks] = useState<StudioTask[]>(() => readLocalStorage(STORAGE_KEYS.tasks, starterTasks));
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(() =>
    readLocalStorage(STORAGE_KEYS.roadmap, cloneMilestones(roadmapPresets[0]))
  );
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? notes[0];
  const completedTasks = tasks.filter((task) => task.done).length;

  useEffect(() => writeLocalStorage(STORAGE_KEYS.notes, notes), [notes]);
  useEffect(() => writeLocalStorage(STORAGE_KEYS.nodes, nodes), [nodes]);
  useEffect(() => writeLocalStorage(STORAGE_KEYS.edges, edges), [edges]);
  useEffect(() => writeLocalStorage(STORAGE_KEYS.cards, cards), [cards]);
  useEffect(() => writeLocalStorage(STORAGE_KEYS.resources, resources), [resources]);
  useEffect(() => writeLocalStorage(STORAGE_KEYS.tasks, tasks), [tasks]);
  useEffect(() => writeLocalStorage(STORAGE_KEYS.roadmap, milestones), [milestones]);

  function createCardsFromNote(note: StudyNote) {
    const generated = extractFlashcardsFromText(note.body, "note");

    if (generated.length === 0) {
      return;
    }

    setCards((current) => [...generated, ...current]);
    setActivePanel("flashcards");
  }

  function createSchemaFromNote(note: StudyNote) {
    const schema = extractConceptsFromNote(note);

    if (schema.nodes.length === 0) {
      return;
    }

    setNodes(schema.nodes);
    setEdges(schema.edges);
    setActivePanel("schema");
  }

  return (
    <div className="space-y-8 overflow-y-auto px-6 py-8 lg:px-8">
      <StudioHero noteCount={notes.length} cardCount={cards.length} completedTasks={completedTasks} />

      <Tabs value={activePanel} onValueChange={(value) => setActivePanel(value as StudioPanelId)}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="h-auto min-w-max flex-wrap justify-start gap-1 bg-slate-950/70 p-1">
            {studioPanels.map((panel) => {
              const Icon = panel.icon;

              return (
                <TabsTrigger key={panel.id} value={panel.id} className="gap-2 px-4">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{panel.shortLabel}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {studioPanels.map((panel) => {
            const Icon = panel.icon;

            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => setActivePanel(panel.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors",
                  activePanel === panel.id ? "border-primary/30 bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                )}
              >
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">{panel.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{panel.description}</p>
              </button>
            );
          })}
        </div>

        <TabsContent value="notes">
          <NotesPanel
            notes={notes}
            selectedNoteId={selectedNoteId}
            setSelectedNoteId={setSelectedNoteId}
            setNotes={setNotes}
            onCreateCards={createCardsFromNote}
            onCreateSchema={createSchemaFromNote}
          />
        </TabsContent>
        <TabsContent value="schema">
          <SchemaPanel nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} selectedNote={selectedNote} />
        </TabsContent>
        <TabsContent value="flashcards">
          <FlashcardsPanel cards={cards} setCards={setCards} selectedNote={selectedNote} />
        </TabsContent>
        <TabsContent value="resources">
          <ResourcesPanel resources={resources} setResources={setResources} />
        </TabsContent>
        <TabsContent value="pomodoro">
          <PomodoroPanel />
        </TabsContent>
        <TabsContent value="tasks">
          <TasksPanel tasks={tasks} setTasks={setTasks} />
        </TabsContent>
        <TabsContent value="converters">
          <ConvertersPanel />
        </TabsContent>
        <TabsContent value="roadmap">
          <RoadmapPanel milestones={milestones} setMilestones={setMilestones} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
