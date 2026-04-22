"use client";

import "@xyflow/react/dist/style.css";

import { useEffect, useMemo, useState } from "react";
import { FlaskConical, Save } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { LabGuidePanel } from "@/components/labs/lab-guide-panel";
import { AiAssistantPanel } from "@/components/simulator/ai-assistant-panel";
import { DeviceInspector } from "@/components/simulator/device-inspector";
import { DevicePalette } from "@/components/simulator/device-palette";
import { OnboardingTip } from "@/components/simulator/onboarding-tip";
import { PingConsole } from "@/components/simulator/ping-console";
import { TopologyCanvas } from "@/components/simulator/topology-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProject, saveProject, upsertLabProgress } from "@/lib/firebase/firestore";
import { evaluateLab, getLabById } from "@/lib/labs/engine";
import { useSimulatorStore } from "@/store/simulator-store";
import type { LabValidationResult } from "@/types/lab";

export function SimulatorWorkspace({
  labId,
  projectQueryId
}: {
  labId: string | null;
  projectQueryId: string | null;
}) {
  const { user } = useAuth();
  const title = useSimulatorStore((state) => state.title);
  const activeLabId = useSimulatorStore((state) => state.activeLabId);
  const projectId = useSimulatorStore((state) => state.projectId);
  const topology = useSimulatorStore((state) => state.topology);
  const setTitle = useSimulatorStore((state) => state.setTitle);
  const setProjectId = useSimulatorStore((state) => state.setProjectId);
  const loadTopology = useSimulatorStore((state) => state.loadTopology);
  const reset = useSimulatorStore((state) => state.reset);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [labValidation, setLabValidation] = useState<LabValidationResult | null>(null);

  const activeLab = useMemo(() => (labId ? getLabById(labId) : null), [labId]);

  useEffect(() => {
    if (projectQueryId || !activeLab || activeLabId === activeLab.id) {
      return;
    }

    loadTopology(activeLab.starterTopology, {
      title: activeLab.title,
      labId: activeLab.id,
      projectId: null
    });
  }, [activeLab, activeLabId, loadTopology, projectQueryId]);

  useEffect(() => {
    if (!projectQueryId || !user || projectId === projectQueryId) {
      return;
    }

    void getProject(user.uid, projectQueryId).then((project) => {
      if (!project) {
        return;
      }

      loadTopology(project.topology, {
        title: project.title,
        projectId: project.id,
        labId: null
      });
    });
  }, [loadTopology, projectId, projectQueryId, user]);

  async function handleSaveProject() {
    if (!user) {
      return;
    }

    setSaveState("saving");
    setSaveMessage(null);

    try {
      const savedProject = await saveProject(user.uid, {
        id: projectId ?? undefined,
        title,
        topology
      });

      setProjectId(savedProject.id);
      setSaveState("saved");
      setSaveMessage(`Saved as "${savedProject.title}".`);
    } catch (error) {
      setSaveState("error");
      setSaveMessage(error instanceof Error ? error.message : "Unable to save project.");
    }
  }

  async function handleValidateLab() {
    if (!activeLab || !user) {
      return;
    }

    const result = evaluateLab(topology, activeLab);
    setLabValidation(result);
    await upsertLabProgress(user.uid, activeLab.id, result.completed, result.score);
  }

  return (
    <div className="relative grid h-full min-h-[calc(100vh-89px)] gap-4 p-4 lg:grid-cols-[260px_minmax(0,1fr)_340px] lg:grid-rows-[auto_minmax(0,1fr)_220px]">
      <OnboardingTip />

      <Card className="lg:col-span-3">
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={activeLab ? "success" : "info"}>
                {activeLab ? "Guided lab session" : "Freeform topology"}
              </Badge>
              <Badge variant="default">
                {topology.devices.length} devices / {topology.links.length} links
              </Badge>
              {saveState === "saved" ? <Badge variant="success">Saved</Badge> : null}
            </div>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full bg-transparent font-[family-name:var(--font-heading)] text-3xl font-semibold text-foreground outline-none"
            />
            <p className="text-sm text-muted-foreground">
              {activeLab
                ? activeLab.description
                : "Build your own topology, wire the devices together, and validate connectivity from the console."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {activeLab ? (
              <Button variant="secondary" onClick={handleValidateLab}>
                <FlaskConical className="h-4 w-4" />
                Check lab
              </Button>
            ) : null}
            <Button
              variant="outline"
              onClick={() => {
                reset();
                setProjectId(null);
                setLabValidation(null);
              }}
            >
              Reset workspace
            </Button>
            <Button variant="secondary" onClick={handleSaveProject} disabled={saveState === "saving"}>
              <Save className="h-4 w-4" />
              {saveState === "saving" ? "Saving..." : "Save project"}
            </Button>
          </div>
        </div>
        {saveMessage ? (
          <div className="px-5 pb-5 text-sm text-muted-foreground">{saveMessage}</div>
        ) : null}
      </Card>

      <div className="lg:row-span-2">
        <DevicePalette />
      </div>

      <div className="min-h-[540px]">
        <TopologyCanvas />
      </div>

      <div className="lg:row-span-2">
        <Tabs defaultValue="inspect" className="h-full">
          <TabsList className={`grid w-full ${activeLab ? "grid-cols-3" : "grid-cols-2"}`}>
            <TabsTrigger value="inspect">Properties</TabsTrigger>
            <TabsTrigger value="ai">AI Panel</TabsTrigger>
            {activeLab ? <TabsTrigger value="lab">Lab Guide</TabsTrigger> : null}
          </TabsList>
          <TabsContent value="inspect" className="h-[calc(100%-56px)]">
            <DeviceInspector />
          </TabsContent>
          <TabsContent value="ai" className="h-[calc(100%-56px)]">
            <AiAssistantPanel />
          </TabsContent>
          {activeLab ? (
            <TabsContent value="lab" className="h-[calc(100%-56px)]">
              <LabGuidePanel lab={activeLab} validation={labValidation} />
            </TabsContent>
          ) : null}
        </Tabs>
      </div>

      <div className="lg:col-start-2">
        <PingConsole />
      </div>
    </div>
  );
}
