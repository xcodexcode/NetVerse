"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Laptop, Router, Server, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { DeviceKind } from "@/types/simulator";

export interface DeviceNodeData extends Record<string, unknown> {
  name: string;
  kind: DeviceKind;
  subtitle: string;
  selected: boolean;
}

const iconMap = {
  pc: Laptop,
  switch: Workflow,
  router: Router,
  server: Server
} satisfies Record<DeviceKind, React.ComponentType<{ className?: string }>>;

const badgeMap = {
  pc: "info",
  switch: "default",
  router: "warning",
  server: "success"
} as const;

export function DeviceNode({ data }: NodeProps) {
  const nodeData = data as unknown as DeviceNodeData;
  const Icon = iconMap[nodeData.kind];

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-panel backdrop-blur-xl transition-all",
        nodeData.selected && "border-primary/50 shadow-glow"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-slate-950 !bg-primary"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-slate-950 !bg-accent"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant={badgeMap[nodeData.kind]}>{nodeData.kind}</Badge>
      </div>

      <div className="mt-4 space-y-1">
        <p className="font-medium text-foreground">{nodeData.name}</p>
        <p className="text-xs text-muted-foreground">{nodeData.subtitle}</p>
      </div>
    </div>
  );
}
