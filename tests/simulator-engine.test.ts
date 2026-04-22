import { describe, expect, it } from "vitest";

import { evaluateLab, getLabById } from "@/lib/labs/engine";
import { evaluatePing } from "@/lib/simulator/engine";
import type { TopologySnapshot } from "@/types/simulator";

describe("simulator connectivity engine", () => {
  it("passes a same-subnet direct connection", () => {
    const topology: TopologySnapshot = {
      devices: [
        {
          id: "pc-a",
          kind: "pc",
          name: "PC A",
          position: { x: 0, y: 0 },
          config: {
            ipAddress: "192.168.10.10",
            subnetMask: "255.255.255.0",
            defaultGateway: ""
          }
        },
        {
          id: "pc-b",
          kind: "pc",
          name: "PC B",
          position: { x: 200, y: 0 },
          config: {
            ipAddress: "192.168.10.20",
            subnetMask: "255.255.255.0",
            defaultGateway: ""
          }
        }
      ],
      links: [
        {
          id: "link-a",
          sourceDeviceId: "pc-a",
          targetDeviceId: "pc-b"
        }
      ],
      selectedDeviceId: null,
      recentPing: null
    };

    const result = evaluatePing(topology, "pc-a", "pc-b");
    expect(result.success).toBe(true);
    expect(result.summary).toBe("Ping successful");
  });

  it("fails when no physical path exists", () => {
    const topology: TopologySnapshot = {
      devices: [
        {
          id: "pc-a",
          kind: "pc",
          name: "PC A",
          position: { x: 0, y: 0 },
          config: {
            ipAddress: "192.168.1.10",
            subnetMask: "255.255.255.0",
            defaultGateway: ""
          }
        },
        {
          id: "pc-b",
          kind: "pc",
          name: "PC B",
          position: { x: 200, y: 0 },
          config: {
            ipAddress: "192.168.1.20",
            subnetMask: "255.255.255.0",
            defaultGateway: ""
          }
        }
      ],
      links: [],
      selectedDeviceId: null,
      recentPing: null
    };

    const result = evaluatePing(topology, "pc-a", "pc-b");
    expect(result.success).toBe(false);
    expect(result.diagnostics.some((issue) => issue.code === "NO_PHYSICAL_PATH")).toBe(true);
  });

  it("routes successfully through a correctly configured router", () => {
    const topology: TopologySnapshot = {
      devices: [
        {
          id: "pc-a",
          kind: "pc",
          name: "PC A",
          position: { x: 0, y: 0 },
          config: {
            ipAddress: "10.0.10.10",
            subnetMask: "255.255.255.0",
            defaultGateway: "10.0.10.1"
          }
        },
        {
          id: "switch-a",
          kind: "switch",
          name: "Switch A",
          position: { x: 150, y: 0 },
          config: {
            unmanaged: true
          }
        },
        {
          id: "router-a",
          kind: "router",
          name: "Router A",
          position: { x: 300, y: 100 },
          config: {
            interfaces: [
              {
                id: "iface-1",
                name: "G0/0",
                ipAddress: "10.0.10.1",
                subnetMask: "255.255.255.0",
                enabled: true
              },
              {
                id: "iface-2",
                name: "G0/1",
                ipAddress: "10.0.20.1",
                subnetMask: "255.255.255.0",
                enabled: true
              }
            ]
          }
        },
        {
          id: "switch-b",
          kind: "switch",
          name: "Switch B",
          position: { x: 450, y: 200 },
          config: {
            unmanaged: true
          }
        },
        {
          id: "pc-b",
          kind: "pc",
          name: "PC B",
          position: { x: 600, y: 200 },
          config: {
            ipAddress: "10.0.20.20",
            subnetMask: "255.255.255.0",
            defaultGateway: "10.0.20.1"
          }
        }
      ],
      links: [
        { id: "a", sourceDeviceId: "pc-a", targetDeviceId: "switch-a" },
        { id: "b", sourceDeviceId: "switch-a", targetDeviceId: "router-a", targetInterfaceId: "iface-1" },
        { id: "c", sourceDeviceId: "router-a", sourceInterfaceId: "iface-2", targetDeviceId: "switch-b" },
        { id: "d", sourceDeviceId: "switch-b", targetDeviceId: "pc-b" }
      ],
      selectedDeviceId: null,
      recentPing: null
    };

    const result = evaluatePing(topology, "pc-a", "pc-b");
    expect(result.success).toBe(true);
    expect(result.explanation).toContain("Router A");
  });

  it("detects a gateway mismatch in a routed scenario", () => {
    const topology: TopologySnapshot = {
      devices: [
        {
          id: "pc-a",
          kind: "pc",
          name: "PC A",
          position: { x: 0, y: 0 },
          config: {
            ipAddress: "10.0.10.10",
            subnetMask: "255.255.255.0",
            defaultGateway: "10.0.10.1"
          }
        },
        {
          id: "switch-a",
          kind: "switch",
          name: "Switch A",
          position: { x: 150, y: 0 },
          config: {
            unmanaged: true
          }
        },
        {
          id: "router-a",
          kind: "router",
          name: "Router A",
          position: { x: 300, y: 100 },
          config: {
            interfaces: [
              {
                id: "iface-1",
                name: "G0/0",
                ipAddress: "10.0.10.1",
                subnetMask: "255.255.255.0",
                enabled: true
              },
              {
                id: "iface-2",
                name: "G0/1",
                ipAddress: "10.0.20.1",
                subnetMask: "255.255.255.0",
                enabled: true
              }
            ]
          }
        },
        {
          id: "switch-b",
          kind: "switch",
          name: "Switch B",
          position: { x: 450, y: 200 },
          config: {
            unmanaged: true
          }
        },
        {
          id: "pc-b",
          kind: "pc",
          name: "PC B",
          position: { x: 600, y: 200 },
          config: {
            ipAddress: "10.0.20.20",
            subnetMask: "255.255.255.0",
            defaultGateway: "10.0.20.254"
          }
        }
      ],
      links: [
        { id: "a", sourceDeviceId: "pc-a", targetDeviceId: "switch-a" },
        { id: "b", sourceDeviceId: "switch-a", targetDeviceId: "router-a", targetInterfaceId: "iface-1" },
        { id: "c", sourceDeviceId: "router-a", sourceInterfaceId: "iface-2", targetDeviceId: "switch-b" },
        { id: "d", sourceDeviceId: "switch-b", targetDeviceId: "pc-b" }
      ],
      selectedDeviceId: null,
      recentPing: null
    };

    const result = evaluatePing(topology, "pc-a", "pc-b");
    expect(result.success).toBe(false);
    expect(result.diagnostics.some((issue) => issue.code === "DEFAULT_GATEWAY_MISMATCH")).toBe(true);
  });
});

describe("guided labs", () => {
  it("marks Lab 1 complete once same-subnet ping succeeds", () => {
    const lab = getLabById("lab-same-subnet");
    expect(lab).not.toBeNull();

    const solvedTopology: TopologySnapshot = {
      ...lab!.starterTopology,
      devices: lab!.starterTopology.devices.map((device, index) =>
        device.kind === "pc"
          ? {
              ...device,
              config: {
                ...device.config,
                ipAddress: `192.168.10.${10 + index * 10}`
              }
            }
          : device
      )
    };

    const result = evaluateLab(solvedTopology, lab!);
    expect(result.completed).toBe(true);
    expect(result.score).toBe(100);
  });
});
