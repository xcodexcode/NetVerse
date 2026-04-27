import type { ComponentType } from "react";
import {
  Binary,
  BookMarked,
  CheckSquare,
  Clock3,
  FileText,
  GitBranch,
  Library,
  Network,
  Route,
  StickyNote
} from "lucide-react";

export type StudioPanelId =
  | "notes"
  | "schema"
  | "flashcards"
  | "resources"
  | "pomodoro"
  | "tasks"
  | "converters"
  | "roadmap";

export type StudioPanel = {
  id: StudioPanelId;
  label: string;
  shortLabel: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export type StudyNote = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

export type ConceptNode = {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  tone: "primary" | "accent" | "warning" | "danger" | "muted";
};

export type ConceptEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  source: "manual" | "note" | "pdf";
  confidence: "new" | "learning" | "known";
};

export type ResourceType = "article" | "video" | "playlist" | "cheat-sheet" | "tool";

export type ResourceLink = {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  topic: string;
  note: string;
  favorite: boolean;
};

export type StudioTask = {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  done: boolean;
};

export type RoadmapMilestone = {
  id: string;
  title: string;
  description: string;
  duration: string;
  focus: string[];
  done: boolean;
};

export type RoadmapPreset = {
  id: string;
  title: string;
  description: string;
  level: string;
  milestones: RoadmapMilestone[];
};

export const studioPanels: StudioPanel[] = [
  {
    id: "notes",
    label: "Notes workspace",
    shortLabel: "Notes",
    description: "Capture lab notes, troubleshooting steps, and study summaries.",
    icon: StickyNote
  },
  {
    id: "schema",
    label: "Concept schema",
    shortLabel: "Schema",
    description: "Map relationships between ideas for visual learning and experiments.",
    icon: GitBranch
  },
  {
    id: "flashcards",
    label: "Flashcard forge",
    shortLabel: "Cards",
    description: "Create cards manually, from notes, or from simple text/PDF imports.",
    icon: BookMarked
  },
  {
    id: "resources",
    label: "Resource guard",
    shortLabel: "Links",
    description: "Save important links, tools, references, and YouTube playlists.",
    icon: Library
  },
  {
    id: "pomodoro",
    label: "Focus timer",
    shortLabel: "Focus",
    description: "Run Pomodoro sessions tuned for labs, reading, and review.",
    icon: Clock3
  },
  {
    id: "tasks",
    label: "Mission list",
    shortLabel: "Tasks",
    description: "Track next actions so study sessions do not drift.",
    icon: CheckSquare
  },
  {
    id: "converters",
    label: "Engineer converters",
    shortLabel: "Tools",
    description: "Subnet, base conversion, bandwidth, MTU, and port helpers.",
    icon: Binary
  },
  {
    id: "roadmap",
    label: "Roadmap builder",
    shortLabel: "Roadmap",
    description: "Pick a preset path or build a custom learning route.",
    icon: Route
  }
];

export const starterNotes: StudyNote[] = [
  {
    id: "note-subnet-default-gateway",
    title: "Why default gateways matter",
    body:
      "A default gateway is the router IP a host uses when the destination is outside the local subnet. If a PC has no gateway, it can usually reach same-subnet hosts but fails when traffic needs routing.",
    tags: ["subnetting", "routing", "ccna"],
    updatedAt: "2026-04-27T09:00:00.000Z"
  },
  {
    id: "note-switch-forwarding",
    title: "Switch forwarding mental model",
    body:
      "A switch learns MAC addresses from source frames, stores them in a MAC table, and forwards frames out the port where the destination MAC was learned. Broadcasts are flooded within the VLAN.",
    tags: ["switching", "layer-2"],
    updatedAt: "2026-04-27T09:05:00.000Z"
  }
];

export const starterConceptNodes: ConceptNode[] = [
  {
    id: "concept-host",
    label: "Host",
    detail: "Endpoint with IP, mask, and gateway.",
    x: 12,
    y: 30,
    tone: "primary"
  },
  {
    id: "concept-subnet",
    label: "Subnet",
    detail: "Local IP range decided by address and mask.",
    x: 39,
    y: 18,
    tone: "accent"
  },
  {
    id: "concept-switch",
    label: "Switch",
    detail: "Layer 2 forwarding inside a broadcast domain.",
    x: 38,
    y: 55,
    tone: "muted"
  },
  {
    id: "concept-router",
    label: "Router",
    detail: "Layer 3 device that connects networks.",
    x: 68,
    y: 37,
    tone: "warning"
  }
];

export const starterConceptEdges: ConceptEdge[] = [
  { id: "edge-host-subnet", source: "concept-host", target: "concept-subnet", label: "belongs to" },
  { id: "edge-host-switch", source: "concept-host", target: "concept-switch", label: "connects through" },
  { id: "edge-subnet-router", source: "concept-subnet", target: "concept-router", label: "routes via gateway" }
];

export const starterResources: ResourceLink[] = [
  {
    id: "resource-rfc1918",
    title: "RFC 1918 private address space",
    url: "https://www.rfc-editor.org/rfc/rfc1918",
    type: "article",
    topic: "Addressing",
    note: "Canonical reference for private IPv4 ranges.",
    favorite: true
  },
  {
    id: "resource-subnet-reference",
    title: "Subnetting practice playlist",
    url: "https://www.youtube.com/results?search_query=subnetting+practice+ccna",
    type: "playlist",
    topic: "Subnetting",
    note: "Curated search entry point for drills and walkthroughs.",
    favorite: true
  },
  {
    id: "resource-wireshark",
    title: "Wireshark documentation",
    url: "https://www.wireshark.org/docs/",
    type: "tool",
    topic: "Packet analysis",
    note: "Useful when moving from simulator concepts to real packet captures.",
    favorite: false
  }
];

export const starterTasks: StudioTask[] = [
  { id: "task-cidr-drill", title: "Finish 10 CIDR range drills", priority: "high", done: false },
  { id: "task-lab-notes", title: "Summarize today's broken config lab", priority: "medium", done: false },
  { id: "task-router-flashcards", title: "Review routing and gateway flashcards", priority: "medium", done: true }
];

export const roadmapPresets: RoadmapPreset[] = [
  {
    id: "ccna",
    title: "CCNA Foundations",
    description: "A practical route for beginners moving toward junior network roles.",
    level: "Beginner",
    milestones: [
      {
        id: "ccna-1",
        title: "IPv4 and subnet fluency",
        description: "CIDR, masks, gateways, host ranges, private space, and binary conversion.",
        duration: "2 weeks",
        focus: ["Subnet calculator", "Daily flashcards", "Lab 1"],
        done: false
      },
      {
        id: "ccna-2",
        title: "Switching basics",
        description: "MAC learning, VLAN mental models, broadcast domains, and simple LAN troubleshooting.",
        duration: "2 weeks",
        focus: ["Concept schema", "Packet flow notes", "Lab 2"],
        done: false
      },
      {
        id: "ccna-3",
        title: "Routing and troubleshooting",
        description: "Default gateways, static routes, path reasoning, and systematic failure isolation.",
        duration: "3 weeks",
        focus: ["Simulator", "AI diagnostics", "Lab 3"],
        done: false
      }
    ]
  },
  {
    id: "cloud-network",
    title: "Cloud Network Operator",
    description: "Connect networking fundamentals to AWS VPC and production cloud patterns.",
    level: "Junior",
    milestones: [
      {
        id: "cloud-1",
        title: "VPC primitives",
        description: "Subnets, route tables, internet gateways, NAT gateways, and security groups.",
        duration: "2 weeks",
        focus: ["Resource guard", "AWS academy drills", "Schema maps"],
        done: false
      },
      {
        id: "cloud-2",
        title: "Connectivity scenarios",
        description: "Public/private subnet access, outbound-only designs, and route table mistakes.",
        duration: "2 weeks",
        focus: ["Simulator sketches", "Notes", "Flashcards"],
        done: false
      },
      {
        id: "cloud-3",
        title: "Operational readiness",
        description: "Monitoring, incident notes, runbooks, cost awareness, and security checklists.",
        duration: "3 weeks",
        focus: ["Tasks", "Pomodoro", "Hardening checklist"],
        done: false
      }
    ]
  },
  {
    id: "linux-network-ops",
    title: "Linux Network Ops",
    description: "Build the command-line confidence needed for real infrastructure debugging.",
    level: "Beginner to junior",
    milestones: [
      {
        id: "linux-1",
        title: "Interface inspection",
        description: "ip addr, ip route, ss, ping, traceroute, DNS checks, and log hygiene.",
        duration: "2 weeks",
        focus: ["Linux drills", "Manual cards", "Command notes"],
        done: false
      },
      {
        id: "linux-2",
        title: "Service troubleshooting",
        description: "Ports, listeners, firewall state, process ownership, and common failure patterns.",
        duration: "2 weeks",
        focus: ["Port reference", "To-do list", "Resource guard"],
        done: false
      },
      {
        id: "linux-3",
        title: "Runbook practice",
        description: "Turn repeated troubleshooting into clean, reusable procedures.",
        duration: "2 weeks",
        focus: ["Notes to schema", "Flashcards", "Timed sessions"],
        done: false
      }
    ]
  }
];

export const converterPorts = [
  { port: "20/21", protocol: "FTP", layer: "Application", note: "Legacy file transfer control/data." },
  { port: "22", protocol: "SSH", layer: "Application", note: "Secure shell and admin access." },
  { port: "25", protocol: "SMTP", layer: "Application", note: "Mail transfer between servers." },
  { port: "53", protocol: "DNS", layer: "Application", note: "Name resolution over UDP/TCP." },
  { port: "67/68", protocol: "DHCP", layer: "Application", note: "IPv4 lease discovery and assignment." },
  { port: "80", protocol: "HTTP", layer: "Application", note: "Unencrypted web traffic." },
  { port: "123", protocol: "NTP", layer: "Application", note: "Time synchronization." },
  { port: "161/162", protocol: "SNMP", layer: "Application", note: "Monitoring and traps." },
  { port: "443", protocol: "HTTPS", layer: "Application", note: "Encrypted web traffic." },
  { port: "3389", protocol: "RDP", layer: "Application", note: "Windows remote desktop." }
];

export const studioHeroMetrics = [
  { label: "Study tools", value: "8", icon: Network },
  { label: "Starter notes", value: String(starterNotes.length), icon: FileText },
  { label: "Roadmap presets", value: String(roadmapPresets.length), icon: Route }
];
