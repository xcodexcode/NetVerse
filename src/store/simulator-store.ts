"use client";

import { create } from "zustand";

import { createBlankTopology, createDefaultDevice, ensureAvailableRouterInterface } from "@/lib/simulator/factories";
import { evaluatePing } from "@/lib/simulator/engine";
import type {
  CanvasPosition,
  DeviceKind,
  NetworkDevice,
  RouterDevice,
  TopologyLink,
  TopologySnapshot
} from "@/types/simulator";

interface SimulatorState {
  title: string;
  projectId: string | null;
  activeLabId: string | null;
  onboardingSeen: boolean;
  topology: TopologySnapshot;
  setTitle: (title: string) => void;
  setProjectId: (projectId: string | null) => void;
  setOnboardingSeen: () => void;
  reset: () => void;
  loadTopology: (topology: TopologySnapshot, options?: { title?: string; projectId?: string | null; labId?: string | null }) => void;
  addDevice: (kind: DeviceKind, position: CanvasPosition) => void;
  updateDevice: (deviceId: string, updater: (device: NetworkDevice) => NetworkDevice) => void;
  removeDevice: (deviceId: string) => void;
  moveDevice: (deviceId: string, position: CanvasPosition) => void;
  selectDevice: (deviceId: string | null) => void;
  connectDevices: (sourceId: string, targetId: string) => void;
  runPing: (sourceId: string, destinationId: string) => void;
}

function assignRouterInterface(
  devices: NetworkDevice[],
  links: TopologyLink[],
  deviceId: string
) {
  const device = devices.find((item) => item.id === deviceId);
  if (!device || device.kind !== "router") {
    return {
      devices,
      interfaceId: undefined as string | undefined
    };
  }

  const hydrated = ensureAvailableRouterInterface(device as RouterDevice, links);
  const updatedDevices = devices.map((item) => (item.id === hydrated.id ? hydrated : item));
  const linkedInterfaceIds = new Set(
    links.flatMap((link) => {
      const ids: string[] = [];
      if (link.sourceDeviceId === deviceId && link.sourceInterfaceId) {
        ids.push(link.sourceInterfaceId);
      }
      if (link.targetDeviceId === deviceId && link.targetInterfaceId) {
        ids.push(link.targetInterfaceId);
      }
      return ids;
    })
  );

  const nextInterface = hydrated.config.interfaces.find((item) => !linkedInterfaceIds.has(item.id));
  return {
    devices: updatedDevices,
    interfaceId: nextInterface?.id
  };
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  title: "Untitled topology",
  projectId: null,
  activeLabId: null,
  onboardingSeen: false,
  topology: createBlankTopology(),
  setTitle: (title) => set({ title }),
  setProjectId: (projectId) => set({ projectId }),
  setOnboardingSeen: () => set({ onboardingSeen: true }),
  reset: () =>
    set({
      title: "Untitled topology",
      projectId: null,
      activeLabId: null,
      topology: createBlankTopology()
    }),
  loadTopology: (topology, options) =>
    set({
      topology,
      title: options?.title ?? "Untitled topology",
      projectId: options?.projectId ?? null,
      activeLabId: options?.labId ?? null
    }),
  addDevice: (kind, position) =>
    set((state) => ({
      topology: {
        ...state.topology,
        devices: [...state.topology.devices, createDefaultDevice(kind, state.topology.devices, position)]
      }
    })),
  updateDevice: (deviceId, updater) =>
    set((state) => ({
      topology: {
        ...state.topology,
        devices: state.topology.devices.map((device) => (device.id === deviceId ? updater(device) : device))
      }
    })),
  removeDevice: (deviceId) =>
    set((state) => ({
      topology: {
        ...state.topology,
        devices: state.topology.devices.filter((device) => device.id !== deviceId),
        links: state.topology.links.filter(
          (link) => link.sourceDeviceId !== deviceId && link.targetDeviceId !== deviceId
        ),
        selectedDeviceId: state.topology.selectedDeviceId === deviceId ? null : state.topology.selectedDeviceId
      }
    })),
  moveDevice: (deviceId, position) =>
    set((state) => ({
      topology: {
        ...state.topology,
        devices: state.topology.devices.map((device) =>
          device.id === deviceId ? { ...device, position } : device
        )
      }
    })),
  selectDevice: (deviceId) =>
    set((state) => ({
      topology: {
        ...state.topology,
        selectedDeviceId: deviceId
      }
    })),
  connectDevices: (sourceId, targetId) =>
    set((state) => {
      if (sourceId === targetId) {
        return state;
      }

      const duplicate = state.topology.links.find(
        (link) =>
          (link.sourceDeviceId === sourceId && link.targetDeviceId === targetId) ||
          (link.sourceDeviceId === targetId && link.targetDeviceId === sourceId)
      );

      if (duplicate) {
        return state;
      }

      const sourceAssigned = assignRouterInterface(state.topology.devices, state.topology.links, sourceId);
      const targetAssigned = assignRouterInterface(sourceAssigned.devices, state.topology.links, targetId);

      return {
        topology: {
          ...state.topology,
          devices: targetAssigned.devices,
          links: [
            ...state.topology.links,
            {
              id: `link-${crypto.randomUUID()}`,
              sourceDeviceId: sourceId,
              targetDeviceId: targetId,
              sourceInterfaceId: sourceAssigned.interfaceId,
              targetInterfaceId: targetAssigned.interfaceId
            }
          ]
        }
      };
    }),
  runPing: (sourceId, destinationId) =>
    set((state) => ({
      topology: {
        ...state.topology,
        recentPing: evaluatePing(state.topology, sourceId, destinationId)
      }
    }))
}));
