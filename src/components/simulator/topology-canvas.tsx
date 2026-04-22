"use client";

import { useMemo, useRef, type DragEvent } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type Node
} from "@xyflow/react";
import { Network } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { useSimulatorStore } from "@/store/simulator-store";
import type { DeviceKind, NetworkDevice } from "@/types/simulator";
import { DeviceNode, type DeviceNodeData } from "@/components/simulator/device-node";

const nodeTypes = {
  device: DeviceNode
};

function getSubtitle(device: NetworkDevice) {
  if (device.kind === "switch") {
    return "Layer 2 bridge";
  }

  if (device.kind === "router") {
    return `${device.config.interfaces.filter((item) => item.enabled).length} enabled interfaces`;
  }

  return device.config.ipAddress
    ? `${device.config.ipAddress} / ${device.config.subnetMask}`
    : "Unconfigured endpoint";
}

function TopologyCanvasInner() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const topology = useSimulatorStore((state) => state.topology);
  const addDevice = useSimulatorStore((state) => state.addDevice);
  const connectDevices = useSimulatorStore((state) => state.connectDevices);
  const moveDevice = useSimulatorStore((state) => state.moveDevice);
  const selectDevice = useSimulatorStore((state) => state.selectDevice);

  const nodes = useMemo<Node<DeviceNodeData>[]>(
    () =>
      topology.devices.map((device) => ({
        id: device.id,
        type: "device",
        position: device.position,
        data: {
          name: device.name,
          kind: device.kind,
          subtitle: getSubtitle(device),
          selected: topology.selectedDeviceId === device.id
        },
        draggable: true
      })),
    [topology.devices, topology.selectedDeviceId]
  );

  const edges = useMemo<Edge[]>(
    () =>
      topology.links.map((link) => ({
        id: link.id,
        source: link.sourceDeviceId,
        target: link.targetDeviceId,
        animated: true,
        style: {
          stroke: "rgba(78, 255, 166, 0.8)",
          strokeWidth: 2.2
        }
      })),
    [topology.links]
  );

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const kind = event.dataTransfer.getData("application/netverse-device") as DeviceKind | "";
    if (!kind || !wrapperRef.current) {
      return;
    }

    const flowPosition = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    addDevice(kind, flowPosition);
  }

  function handleConnect(connection: Connection) {
    if (connection.source && connection.target) {
      connectDevices(connection.source, connection.target);
    }
  }

  return (
    <Card className="relative h-full overflow-hidden">
      <div ref={wrapperRef} className="h-full" onDrop={handleDrop} onDragOver={(event) => event.preventDefault()}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onConnect={handleConnect}
          onNodeClick={(_, node) => selectDevice(node.id)}
          onPaneClick={() => selectDevice(null)}
          onNodeDragStop={(_, node) => moveDevice(node.id, node.position)}
          fitView
          defaultEdgeOptions={{
            style: { stroke: "rgba(78, 255, 166, 0.8)", strokeWidth: 2.2 }
          }}
          proOptions={{ hideAttribution: true }}
          className="bg-[radial-gradient(circle_at_top,rgba(78,255,166,0.05),transparent_30%),linear-gradient(180deg,rgba(9,15,24,0.92),rgba(6,10,18,0.98))]"
        >
          <Background
            variant={BackgroundVariant.Lines}
            gap={36}
            size={1}
            color="rgba(113, 255, 214, 0.08)"
          />
          <MiniMap
            pannable
            zoomable
            style={{
              background: "rgba(5, 9, 15, 0.92)",
              border: "1px solid rgba(255, 255, 255, 0.08)"
            }}
            nodeStrokeColor={() => "rgba(78,255,166,0.9)"}
            nodeColor={() => "rgba(20, 32, 46, 0.95)"}
          />
          <Controls
            className={cn(
              "[&>button]:border-white/10 [&>button]:bg-slate-950/90 [&>button]:text-foreground [&>button:hover]:bg-white/10"
            )}
          />
        </ReactFlow>

        {topology.devices.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
            <div className="max-w-md rounded-[2rem] border border-dashed border-primary/20 bg-slate-950/80 px-8 py-10 text-center shadow-panel">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-primary/20 bg-primary/10 text-primary shadow-glow">
                <Network className="h-7 w-7" />
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-foreground">
                Start your topology
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Drag a device from the left panel or click add to drop your first node onto the canvas.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function TopologyCanvas() {
  return (
    <ReactFlowProvider>
      <TopologyCanvasInner />
    </ReactFlowProvider>
  );
}
