import type { DiagnosticAnalysisOutput } from "@/lib/diagnostics/schema";
import type { DiagnosticAction } from "@/lib/diagnostics/types";
import { analyzeTopology } from "@/lib/simulator/engine";
import type { TopologySnapshot } from "@/types/simulator";

export function buildDiagnosticSummary(
  topology: TopologySnapshot,
  trigger: DiagnosticAction
): DiagnosticAnalysisOutput {
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
        : "The debug panel is summarizing the simulator's rule checks from the current topology.",
    confidence: "medium",
    referencedIssues: topIssues.map((issue) => issue.code)
  };
}
