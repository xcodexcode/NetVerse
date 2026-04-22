"use client";

import { Laptop, MousePointer2, Router, Server, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSimulatorStore } from "@/store/simulator-store";
import type { DeviceKind } from "@/types/simulator";

const paletteItems = [
  {
    kind: "pc" as const,
    icon: Laptop,
    title: "PC",
    description: "IPv4 endpoint with gateway support."
  },
  {
    kind: "switch" as const,
    icon: Workflow,
    title: "Switch",
    description: "Unmanaged layer 2 forwarding."
  },
  {
    kind: "router" as const,
    icon: Router,
    title: "Router",
    description: "Multi-interface routed connectivity."
  },
  {
    kind: "server" as const,
    icon: Server,
    title: "Server",
    description: "Endpoint with static IP configuration."
  }
];

function setDragPayload(event: React.DragEvent, kind: DeviceKind) {
  event.dataTransfer.setData("application/netverse-device", kind);
  event.dataTransfer.effectAllowed = "copy";
}

export function DevicePalette() {
  const addDevice = useSimulatorStore((state) => state.addDevice);

  return (
    <Card className="h-full">
      <CardHeader>
        <Badge variant="info" className="w-fit">
          Device palette
        </Badge>
        <CardTitle>Drag or click to add hardware</CardTitle>
        <CardDescription>
          Pull devices onto the canvas, then connect them using the node handles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paletteItems.map((item, index) => (
          <div
            key={item.kind}
            draggable
            onDragStart={(event) => setDragPayload(event, item.kind)}
            className="group cursor-grab rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-primary/30 hover:bg-primary/5 active:cursor-grabbing"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                0{index + 1}
              </span>
            </div>
            <p className="font-medium text-foreground">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MousePointer2 className="h-3.5 w-3.5" />
                Drag to canvas
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addDevice(item.kind, { x: 160 + index * 20, y: 140 + index * 20 })}
              >
                Add
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
