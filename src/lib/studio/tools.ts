import type { ConceptEdge, ConceptNode, Flashcard, StudyNote } from "@/lib/studio/data";

export function makeStudioId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

export function extractFlashcardsFromText(text: string, source: Flashcard["source"] = "note"): Flashcard[] {
  const cards: Flashcard[] = [];
  const seen = new Set<string>();
  const lines = text
    .split(/\r?\n|(?<=\.)\s+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 8);

  for (const line of lines) {
    let front = "";
    let back = "";
    const colonMatch = line.match(/^([^:]{3,80}):\s*(.{8,})$/);
    const definitionMatch = line.match(/^(.{3,80}?)\s+(is|means|refers to|defines|allows)\s+(.{8,})$/i);

    if (colonMatch) {
      front = colonMatch[1].trim();
      back = colonMatch[2].trim();
    } else if (definitionMatch) {
      front = definitionMatch[1].trim();
      back = `${definitionMatch[2].toLowerCase()} ${definitionMatch[3].trim()}`;
    }

    const key = front.toLowerCase();

    if (front && back && !seen.has(key)) {
      seen.add(key);
      cards.push({
        id: makeStudioId("card"),
        front,
        back,
        source,
        confidence: "new"
      });
    }

    if (cards.length >= 24) {
      break;
    }
  }

  return cards;
}

export function extractConceptsFromNote(note: StudyNote) {
  const terms = Array.from(
    new Set(
      note.body
        .replace(/[^\w\s-]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .map((word) => word.toLowerCase())
    )
  ).slice(0, 6);

  const nodes: ConceptNode[] = terms.map((term, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(terms.length, 1);
    return {
      id: makeStudioId("concept"),
      label: term.replace(/^\w/, (letter) => letter.toUpperCase()),
      detail: `Pulled from "${note.title}" for visual review.`,
      x: 47 + Math.cos(angle) * 28,
      y: 45 + Math.sin(angle) * 24,
      tone: index % 3 === 0 ? "primary" : index % 3 === 1 ? "accent" : "muted"
    };
  });

  const edges: ConceptEdge[] = nodes.slice(1).map((node, index) => ({
    id: makeStudioId("edge"),
    source: nodes[0]?.id ?? node.id,
    target: node.id,
    label: index % 2 === 0 ? "relates to" : "supports"
  }));

  return { nodes, edges };
}

export async function decodePdfText(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const raw = new TextDecoder("latin1").decode(bytes);
  const literalStrings = Array.from(raw.matchAll(/\(([^()]{3,220})\)/g)).map((match) => match[1]);

  return literalStrings
    .join(" ")
    .replace(/\\([()\\])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function convertNumber(value: string) {
  const trimmed = value.trim().toLowerCase();
  let decimal: number;

  if (/^0b[01]+$/.test(trimmed)) {
    decimal = parseInt(trimmed.slice(2), 2);
  } else if (/^[01]+b$/.test(trimmed)) {
    decimal = parseInt(trimmed.slice(0, -1), 2);
  } else if (/^0x[0-9a-f]+$/.test(trimmed)) {
    decimal = parseInt(trimmed.slice(2), 16);
  } else if (/^[0-9a-f]+h$/.test(trimmed)) {
    decimal = parseInt(trimmed.slice(0, -1), 16);
  } else if (/^\d+$/.test(trimmed)) {
    decimal = Number(trimmed);
  } else {
    throw new Error("Use decimal, 0b binary, binary ending in b, 0x hex, or hex ending in h.");
  }

  if (!Number.isSafeInteger(decimal) || decimal < 0) {
    throw new Error("Enter a safe positive integer.");
  }

  return {
    decimal: decimal.toString(10),
    binary: decimal.toString(2),
    hex: decimal.toString(16).toUpperCase()
  };
}

export function bitsPerSecondToHuman(bitsPerSecond: number) {
  if (!Number.isFinite(bitsPerSecond) || bitsPerSecond < 0) {
    throw new Error("Enter a valid bandwidth value.");
  }

  const units = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];
  let value = bitsPerSecond;
  let unitIndex = 0;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

export function calculateBandwidthDelayProduct(mbps: number, latencyMs: number) {
  if (mbps <= 0 || latencyMs <= 0) {
    throw new Error("Bandwidth and latency must be greater than zero.");
  }

  const bits = mbps * 1_000_000 * (latencyMs / 1000);
  const bytes = bits / 8;

  return {
    bits,
    bytes,
    human: `${(bytes / 1024).toFixed(1)} KiB in flight`
  };
}

export function estimateTcpPayload(mtu: number, ipv6 = false) {
  const ipHeader = ipv6 ? 40 : 20;
  const tcpHeader = 20;
  const payload = mtu - ipHeader - tcpHeader;

  if (!Number.isFinite(mtu) || payload <= 0) {
    throw new Error("MTU must be larger than the IP and TCP headers.");
  }

  return {
    mtu,
    ipVersion: ipv6 ? "IPv6" : "IPv4",
    ipHeader,
    tcpHeader,
    payload
  };
}
