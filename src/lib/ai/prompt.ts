import type { AiAnalysisOutput } from "@/lib/ai/schema";
import { analyzeTopology, summarizeTopology } from "@/lib/simulator/engine";
import type { AiAction } from "@/lib/ai/types";
import type { TopologySnapshot } from "@/types/simulator";

const triggerPrompts: Record<AiAction, string> = {
  analyze: "Give a broad network diagnosis focused on what currently works, what is broken, and why.",
  failure: "Focus tightly on the latest failed ping. Explain the most likely reason it failed.",
  fixes: "Prioritize the exact configuration changes the user should make next.",
  teach: "Explain the networking concept in beginner-friendly language using the current topology."
};

export function buildSystemPrompt(trigger: AiAction) {
  return [
    "You are NetVerse, a practical network debugging assistant for network engineers and IT students.",
    "Only reason about the topology, device configs, links, ping result, and rule violations provided to you.",
    "Do not invent unsupported protocols, VLANs, NAT, ACLs, DNS behavior, or platform features that are not present.",
    "Keep recommendations specific and implementable within a simple IPv4 lab simulator.",
    "Explain clearly enough for beginners without being condescending.",
    triggerPrompts[trigger]
  ].join("\n");
}

export function buildUserContext(topology: TopologySnapshot, trigger: AiAction) {
  const issues = analyzeTopology(topology);
  const summary = summarizeTopology(topology);

  return {
    trigger,
    summary,
    devices: topology.devices,
    links: topology.links,
    recentPing: topology.recentPing,
    ruleViolations: issues
  };
}

export function buildFallbackAnalysis(topology: TopologySnapshot, trigger: AiAction): AiAnalysisOutput {
  const issues = analyzeTopology(topology);
  const recentPing = topology.recentPing;
  const topIssues = (recentPing?.diagnostics.length ? recentPing.diagnostics : issues).slice(0, 3);

  if (topIssues.length === 0) {
    return {
      headline: "The topology looks healthy so far.",
      diagnosis: [
        "No deterministic configuration issues are currently flagged by the simulator.",
        "Run a ping between endpoints if you want a deeper path-by-path diagnosis."
      ],
      fixes: [
        "If you want a stronger review, add more device configuration detail or run a connectivity test."
      ],
      beginnerExplanation:
        trigger === "teach"
          ? "A network usually succeeds when devices are physically connected, share the right subnet or default gateway, and any required router interfaces are enabled."
          : "Right now the simulator does not see a concrete fault. A ping test will create richer troubleshooting context.",
      confidence: "medium",
      referencedIssues: []
    };
  }

  return {
    headline: recentPing?.success
      ? "The last ping succeeded, but there are still configuration warnings worth cleaning up."
      : "The simulator found a concrete reason the topology is failing.",
    diagnosis: topIssues.map((issue) => issue.message),
    fixes: topIssues.map((issue) => issue.suggestion ?? "Review the flagged device configuration.").filter(Boolean),
    beginnerExplanation:
      trigger === "teach"
        ? "Packets can only move when the path is physically connected, addressing matches the intended subnet, and routers are reachable through the correct gateway. The flagged issues break one of those basics."
        : "The fallback assistant is summarizing the simulator's rule checks because the OpenAI key is not configured yet.",
    confidence: "medium",
    referencedIssues: topIssues.map((issue) => issue.code)
  };
}
