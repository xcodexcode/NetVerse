import type { LucideIcon } from "lucide-react";
import {
  Binary,
  Bot,
  Braces,
  Calculator,
  CloudCog,
  CloudLightning,
  FileText,
  HardHat,
  MessagesSquare,
  Network,
  ServerCog,
  ShieldCheck,
  TerminalSquare
} from "lucide-react";

export type AcademyModuleId =
  | "networking"
  | "aws"
  | "linux"
  | "subnetting"
  | "architecture"
  | "docs"
  | "cost"
  | "hardening"
  | "packets"
  | "interview";

export type AcademyModule = {
  id: AcademyModuleId;
  title: string;
  kicker: string;
  description: string;
  metric: string;
  accent: "emerald" | "sky" | "amber" | "rose" | "violet";
  icon: LucideIcon;
};

export const academyModules: AcademyModule[] = [
  {
    id: "networking",
    title: "Networking lab simulator",
    kicker: "Topology",
    description: "Design, cable, ping, and troubleshoot routed or switched networks.",
    metric: "3 starter labs",
    accent: "emerald",
    icon: Network
  },
  {
    id: "aws",
    title: "AWS flashcards and lab tracker",
    kicker: "Cloud",
    description: "Drill VPC, IAM, EC2, S3, Route 53, CloudWatch, RDS, and Lambda.",
    metric: "8 services",
    accent: "amber",
    icon: CloudLightning
  },
  {
    id: "linux",
    title: "Linux command trainer",
    kicker: "Terminal",
    description: "Practice permissions, services, logs, users, processes, SSH, and text tools.",
    metric: "6 drills",
    accent: "sky",
    icon: TerminalSquare
  },
  {
    id: "subnetting",
    title: "Subnet calculator",
    kicker: "CIDR",
    description: "Break down IPv4 networks, wildcard masks, host ranges, and binary octets.",
    metric: "Instant math",
    accent: "violet",
    icon: Calculator
  },
  {
    id: "architecture",
    title: "AWS architecture generator",
    kicker: "Design",
    description: "Turn a workload idea into a VPC, subnet, compute, data, and monitoring map.",
    metric: "4 patterns",
    accent: "emerald",
    icon: CloudCog
  },
  {
    id: "docs",
    title: "Home lab documentation",
    kicker: "Runbook",
    description: "Capture lab notes, commands, diagrams, mistakes, and next actions.",
    metric: "4 sections",
    accent: "sky",
    icon: FileText
  },
  {
    id: "cost",
    title: "Cloud cost estimator",
    kicker: "Budget",
    description: "Practice how compute, storage, NAT, RDS, and transfer shape monthly cost.",
    metric: "Training rates",
    accent: "amber",
    icon: ServerCog
  },
  {
    id: "hardening",
    title: "Linux hardening checklist",
    kicker: "Security",
    description: "Track SSH, firewall, patching, users, logs, backups, and least privilege.",
    metric: "12 controls",
    accent: "rose",
    icon: ShieldCheck
  },
  {
    id: "packets",
    title: "Packet journey visualizer",
    kicker: "Flow",
    description: "Step through DNS, ARP, routing, NAT, security groups, and TCP handshakes.",
    metric: "3 journeys",
    accent: "violet",
    icon: Binary
  },
  {
    id: "interview",
    title: "Interview practice bot",
    kicker: "Career",
    description: "Answer realistic AWS, Linux, and networking prompts with keyword feedback.",
    metric: "5 prompts",
    accent: "emerald",
    icon: MessagesSquare
  }
];

export type AwsFlashcard = {
  service: string;
  prompt: string;
  answer: string;
  lab: string;
  tags: string[];
};

export const awsFlashcards: AwsFlashcard[] = [
  {
    service: "VPC",
    prompt: "What problem does a public subnet plus private subnet design solve?",
    answer:
      "Public subnets expose only internet-facing entry points, while private subnets keep app and database resources reachable through controlled routing.",
    lab: "Build a two-AZ VPC with public ALB subnets and private EC2/RDS subnets.",
    tags: ["routing", "subnets", "NAT"]
  },
  {
    service: "IAM",
    prompt: "Why should an EC2 instance use an IAM role instead of long-lived access keys?",
    answer:
      "The role provides temporary credentials through the instance metadata service and avoids static secrets on disk.",
    lab: "Attach a read-only S3 role to EC2 and test access with AWS CLI.",
    tags: ["security", "identity"]
  },
  {
    service: "S3",
    prompt: "What is the difference between bucket policy and IAM policy?",
    answer:
      "A bucket policy is resource-based and lives on the bucket; an IAM policy is identity-based and follows the user, group, or role.",
    lab: "Create a private bucket and allow one IAM role to read a single prefix.",
    tags: ["storage", "policy"]
  },
  {
    service: "CloudWatch",
    prompt: "When would you create a CloudWatch alarm?",
    answer:
      "Create one when a metric crossing a threshold should trigger an action, notification, or operational investigation.",
    lab: "Alarm on EC2 CPU above 70 percent for two datapoints.",
    tags: ["monitoring", "ops"]
  },
  {
    service: "Route 53",
    prompt: "Why does a DNS record need a TTL?",
    answer:
      "TTL tells resolvers how long they can cache the answer before asking again, balancing speed against change propagation.",
    lab: "Point a test subdomain at an ALB and compare low versus high TTL behavior.",
    tags: ["dns", "availability"]
  }
];

export type LinuxDrill = {
  title: string;
  scenario: string;
  expected: string[];
  hint: string;
  explain: string;
};

export const linuxDrills: LinuxDrill[] = [
  {
    title: "Find SSH failures",
    scenario: "Show authentication failures from the system journal for the SSH service.",
    expected: ["journalctl -u ssh", "journalctl -u sshd", "journalctl _SYSTEMD_UNIT=ssh.service"],
    hint: "Use journalctl and filter by the SSH unit.",
    explain: "journalctl can filter logs by unit, which is cleaner than scanning every system log."
  },
  {
    title: "Fix script permissions",
    scenario: "Make deploy.sh executable by the owner, group, and others.",
    expected: ["chmod +x deploy.sh", "chmod 755 deploy.sh"],
    hint: "The chmod command changes mode bits.",
    explain: "chmod +x adds execute permission without changing the existing read/write bits."
  },
  {
    title: "List listening ports",
    scenario: "Show TCP and UDP services currently listening on the server.",
    expected: ["ss -tuln", "ss -lntup", "ss -tunlp"],
    hint: "The modern replacement for netstat is ss.",
    explain: "ss exposes socket state; -l shows listeners, -t TCP, -u UDP, and -n keeps numbers raw."
  },
  {
    title: "Restart Nginx",
    scenario: "Restart the Nginx service through systemd.",
    expected: ["sudo systemctl restart nginx", "systemctl restart nginx"],
    hint: "Use systemctl with the restart action.",
    explain: "systemctl controls systemd units and is the standard service manager on many Linux distros."
  },
  {
    title: "Search config text",
    scenario: "Find every line containing PermitRootLogin under /etc/ssh.",
    expected: ["grep -R PermitRootLogin /etc/ssh", "sudo grep -R PermitRootLogin /etc/ssh"],
    hint: "Recursive grep is enough here.",
    explain: "grep -R searches files below a directory and prints matching lines with file paths."
  },
  {
    title: "Check disk space",
    scenario: "Show filesystem disk usage in human-readable units.",
    expected: ["df -h", "df -hT"],
    hint: "This is a filesystem-level command, not du.",
    explain: "df reports mounted filesystem usage; -h makes sizes readable."
  }
];

export type ArchitecturePattern = {
  id: string;
  label: string;
  summary: string;
  components: string[];
  risks: string[];
};

export const architecturePatterns: ArchitecturePattern[] = [
  {
    id: "web-ha",
    label: "Highly available web app",
    summary: "Multi-AZ public entry, private compute, managed database, and centralized logs.",
    components: ["Route 53", "CloudFront", "ALB", "Public subnets", "Private EC2", "RDS Multi-AZ", "NAT Gateway", "CloudWatch"],
    risks: ["NAT cost can surprise beginners.", "Security groups must be scoped from ALB to app only."]
  },
  {
    id: "static-site",
    label: "Static website",
    summary: "Global edge delivery with private object storage and managed TLS.",
    components: ["Route 53", "CloudFront", "ACM", "S3 private bucket", "Origin access control", "CloudWatch"],
    risks: ["S3 public access should stay blocked.", "Invalidations cost money at high volume."]
  },
  {
    id: "serverless-api",
    label: "Serverless API",
    summary: "Managed HTTP entry with functions, NoSQL storage, and dead-letter handling.",
    components: ["API Gateway", "Lambda", "DynamoDB", "SQS DLQ", "IAM roles", "CloudWatch Logs", "X-Ray"],
    risks: ["Cold starts matter for latency-sensitive paths.", "IAM permissions can sprawl if not reviewed."]
  },
  {
    id: "hybrid-lab",
    label: "Home lab to AWS VPN",
    summary: "Site-to-site connectivity from a local router into private AWS networks.",
    components: ["Customer gateway", "Site-to-site VPN", "Virtual private gateway", "Private subnets", "EC2 jump host", "CloudWatch"],
    risks: ["Route tables must point on-prem CIDRs to the VPN.", "Overlapping CIDR blocks break routing."]
  }
];

export type PacketJourney = {
  id: string;
  label: string;
  nodes: string[];
  steps: string[];
};

export const packetJourneys: PacketJourney[] = [
  {
    id: "web",
    label: "Laptop opens example.com",
    nodes: ["Client", "DNS", "Gateway", "Internet", "Web server"],
    steps: [
      "Client checks local DNS cache for example.com.",
      "Resolver returns an IP address and the browser opens a TCP connection.",
      "Client ARPs for the default gateway MAC on the local LAN.",
      "Gateway routes the packet toward the internet and may apply NAT.",
      "Web server replies through the reverse path and the browser negotiates TLS."
    ]
  },
  {
    id: "aws-rds",
    label: "EC2 talks to RDS",
    nodes: ["EC2", "Route table", "Security group", "RDS", "CloudWatch"],
    steps: [
      "EC2 resolves the RDS endpoint to a private IP.",
      "The VPC route table keeps the packet inside the VPC CIDR.",
      "EC2 outbound and RDS inbound security group rules are evaluated.",
      "RDS accepts traffic on the database port from the app security group.",
      "CloudWatch records database metrics and connection pressure."
    ]
  },
  {
    id: "ssh",
    label: "Admin SSH to Linux server",
    nodes: ["Admin", "Firewall", "SSH daemon", "PAM", "Shell"],
    steps: [
      "Admin opens TCP port 22 to the server public or private address.",
      "Firewall rules decide whether the connection is allowed.",
      "sshd negotiates encryption and checks the offered authentication method.",
      "PAM and account policy validate access.",
      "A shell starts and system logs capture the session."
    ]
  }
];

export type InterviewPrompt = {
  question: string;
  strongTerms: string[];
  sample: string;
};

export const interviewPrompts: InterviewPrompt[] = [
  {
    question: "Explain what happens when a user types a domain name into a browser.",
    strongTerms: ["dns", "tcp", "tls", "http", "cache", "gateway"],
    sample: "A strong answer covers DNS resolution, routing through the gateway, TCP, TLS, HTTP, and response handling."
  },
  {
    question: "How would you troubleshoot an EC2 instance that cannot reach the internet?",
    strongTerms: ["route table", "security group", "nacl", "nat", "internet gateway", "subnet"],
    sample: "Check subnet type, route table, IGW or NAT path, security groups, NACLs, DNS, and instance firewall."
  },
  {
    question: "What Linux checks would you run when a web service is down?",
    strongTerms: ["systemctl", "journalctl", "ss", "curl", "logs", "firewall"],
    sample: "Verify service state, logs, listening ports, local curl, firewall rules, config syntax, and resource pressure."
  },
  {
    question: "Why is least privilege important in IAM?",
    strongTerms: ["permissions", "role", "policy", "blast radius", "temporary", "audit"],
    sample: "Least privilege reduces blast radius, keeps policies auditable, and pairs well with temporary role credentials."
  },
  {
    question: "Compare a security group and a network ACL.",
    strongTerms: ["stateful", "stateless", "subnet", "instance", "allow", "deny"],
    sample: "Security groups are stateful instance-level controls; NACLs are stateless subnet-level controls with allow and deny rules."
  }
];

export const hardeningTasks = [
  "Disable SSH password login after key access is verified",
  "Disable direct root SSH login",
  "Limit SSH to trusted source IP ranges",
  "Enable automatic security updates or a patch window",
  "Configure a host firewall with least-required inbound ports",
  "Create a non-root admin user with sudo",
  "Remove unused packages and services",
  "Enable log retention for auth and system journals",
  "Install brute-force protection for exposed SSH",
  "Back up critical configuration files",
  "Review file permissions on secrets and keys",
  "Document rollback steps before major changes"
];

export const homeLabSections = [
  {
    title: "Topology",
    starter: "Router: pfSense VM\nSwitching: VLAN 10 users, VLAN 20 lab, VLAN 30 servers\nAWS: site-to-site VPN target"
  },
  {
    title: "Commands",
    starter: "ip addr\nip route\nss -tuln\njournalctl -u ssh --since today"
  },
  {
    title: "Mistakes",
    starter: "Forgot default gateway on Ubuntu VM. Ping worked inside subnet but failed across VLANs."
  },
  {
    title: "Next Actions",
    starter: "Add diagram screenshot, test DNS forwarding, document firewall rules."
  }
];

export const featureShortcuts = [
  { label: "Open simulator", href: "/simulator", icon: Network },
  { label: "Start labs", href: "/labs", icon: HardHat },
  { label: "Project library", href: "/projects", icon: Braces },
  { label: "Interview drill", href: "#interview", icon: Bot }
];
