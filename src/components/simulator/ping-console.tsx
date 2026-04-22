"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, TerminalSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSimulatorStore } from "@/store/simulator-store";

export function PingConsole() {
  const topology = useSimulatorStore((state) => state.topology);
  const runPing = useSimulatorStore((state) => state.runPing);
  const [sourceId, setSourceId] = useState<string>("");
  const [destinationId, setDestinationId] = useState<string>("");

  const endpoints = useMemo(
    () => topology.devices.filter((device) => device.kind === "pc" || device.kind === "server"),
    [topology.devices]
  );
  const namedPath = useMemo(
    () =>
      topology.recentPing?.path.map(
        (deviceId) => topology.devices.find((device) => device.id === deviceId)?.name ?? deviceId
      ) ?? [],
    [topology.devices, topology.recentPing?.path]
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="default" className="mb-3 w-fit">
              Ping console
            </Badge>
            <CardTitle>Test connectivity between endpoints</CardTitle>
            <CardDescription>
              Choose a source and destination, then use the simulator engine to validate the current topology.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
            <TerminalSquare className="h-4 w-4" />
            Live diagnostics
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid h-[220px] gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="grid gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Source endpoint</p>
            <Select value={sourceId} onValueChange={setSourceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {endpoints.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Destination endpoint</p>
            <Select value={destinationId} onValueChange={setDestinationId}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {endpoints.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => runPing(sourceId, destinationId)}
            disabled={!sourceId || !destinationId || sourceId === destinationId}
          >
            <ArrowRightLeft className="h-4 w-4" />
            Run ping
          </Button>
        </div>

        <ScrollArea className="rounded-2xl border border-white/10 bg-white/5">
          <div className="space-y-3 p-4">
            {topology.recentPing ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{topology.recentPing.summary}</p>
                  <Badge variant={topology.recentPing.success ? "success" : "danger"}>
                    {topology.recentPing.success ? "Success" : "Failure"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{topology.recentPing.explanation}</p>
                {namedPath.length > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Path: {namedPath.join(" -> ")}
                  </div>
                ) : null}
                {topology.recentPing.diagnostics.length > 0 ? (
                  <div className="space-y-2">
                    {topology.recentPing.diagnostics.map((issue, index) => (
                      <div key={`${issue.code}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm">
                        <p className="text-foreground">{issue.message}</p>
                        {issue.suggestion ? (
                          <p className="mt-1 text-xs text-muted-foreground">{issue.suggestion}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex h-full min-h-[152px] items-center justify-center text-center text-sm text-muted-foreground">
                Run your first ping to see the simulator engine explain what is working and what is broken.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
