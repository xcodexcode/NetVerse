import { describe, expect, it } from "vitest";

import {
  calculateBandwidthDelayProduct,
  convertNumber,
  estimateTcpPayload,
  extractConceptsFromNote,
  extractFlashcardsFromText
} from "@/lib/studio/tools";
import type { StudyNote } from "@/lib/studio/data";

describe("studio learning tools", () => {
  it("extracts flashcards from definition-style notes", () => {
    const cards = extractFlashcardsFromText(
      [
        "CIDR: Classless Inter-Domain Routing represents network prefixes with slash notation.",
        "A default gateway is the router IP a host uses for destinations outside its local subnet."
      ].join("\n"),
      "note"
    );

    expect(cards).toHaveLength(2);
    expect(cards[0].front).toBe("CIDR");
    expect(cards[1].back).toContain("router IP");
  });

  it("creates a concept schema from note language", () => {
    const note: StudyNote = {
      id: "note-test",
      title: "Routing note",
      body: "Routers connect subnets. Gateways forward traffic. Interfaces need addresses.",
      tags: ["routing"],
      updatedAt: new Date().toISOString()
    };

    const schema = extractConceptsFromNote(note);

    expect(schema.nodes.length).toBeGreaterThan(2);
    expect(schema.edges.length).toBe(schema.nodes.length - 1);
  });

  it("converts common number bases", () => {
    expect(convertNumber("0b11000000")).toEqual({ decimal: "192", binary: "11000000", hex: "C0" });
    expect(convertNumber("C0h")).toEqual({ decimal: "192", binary: "11000000", hex: "C0" });
  });

  it("calculates bandwidth delay product and TCP payload", () => {
    expect(calculateBandwidthDelayProduct(100, 40).human).toBe("488.3 KiB in flight");
    expect(estimateTcpPayload(1500).payload).toBe(1460);
    expect(estimateTcpPayload(1500, true).payload).toBe(1440);
  });
});
