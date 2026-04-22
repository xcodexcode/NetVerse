import type { LabDefinition } from "@/types/lab";

export const labCatalog: LabDefinition[] = [
  {
    id: "lab-same-subnet",
    title: "Lab 1: Two PCs on the same subnet",
    description: "Configure two endpoints so they can talk directly without a router.",
    difficulty: "Beginner",
    objectives: [
      "Give both PCs valid IP addresses in the same subnet.",
      "Keep both devices on a direct layer 2 path.",
      "Validate successful connectivity."
    ],
    steps: [
      "Open each PC in the inspector and set an IPv4 address.",
      "Use the same subnet mask on both devices.",
      "Run a ping from PC 1 to PC 2."
    ],
    hints: [
      "You do not need a default gateway when both endpoints stay in one subnet.",
      "A /24 mask means the first three octets should match."
    ],
    starterTopology: {
      devices: [
        {
          id: "lab1-pc-a",
          kind: "pc",
          name: "PC A",
          position: { x: 120, y: 190 },
          config: {
            ipAddress: "",
            subnetMask: "255.255.255.0",
            defaultGateway: ""
          }
        },
        {
          id: "lab1-pc-b",
          kind: "pc",
          name: "PC B",
          position: { x: 420, y: 190 },
          config: {
            ipAddress: "",
            subnetMask: "255.255.255.0",
            defaultGateway: ""
          }
        }
      ],
      links: [
        {
          id: "lab1-link",
          sourceDeviceId: "lab1-pc-a",
          targetDeviceId: "lab1-pc-b"
        }
      ],
      selectedDeviceId: null,
      recentPing: null
    },
    validation: {
      sourceDeviceId: "lab1-pc-a",
      destinationDeviceId: "lab1-pc-b"
    },
    solutionMetadata: {
      expectedOutcome: "PC A can ping PC B over a direct same-subnet link.",
      keyFixes: [
        "Assign both PCs IPs in one subnet, such as 192.168.10.10/24 and 192.168.10.20/24."
      ]
    }
  },
  {
    id: "lab-switch-connectivity",
    title: "Lab 2: Add a switch and achieve connectivity",
    description: "Use a switch to bridge two hosts on the same subnet.",
    difficulty: "Beginner",
    objectives: [
      "Place at least one switch into the topology.",
      "Connect both PCs to the switch.",
      "Configure both endpoints into the same subnet."
    ],
    steps: [
      "Drag a switch onto the canvas.",
      "Connect PC A and PC B to the switch.",
      "Give both PCs matching subnet information and test the ping."
    ],
    hints: [
      "Switches bridge traffic without needing IP configuration in this MVP.",
      "Both hosts should still be in the same network."
    ],
    starterTopology: {
      devices: [
        {
          id: "lab2-pc-a",
          kind: "pc",
          name: "PC A",
          position: { x: 100, y: 200 },
          config: {
            ipAddress: "172.16.1.10",
            subnetMask: "255.255.255.0",
            defaultGateway: ""
          }
        },
        {
          id: "lab2-pc-b",
          kind: "pc",
          name: "PC B",
          position: { x: 470, y: 200 },
          config: {
            ipAddress: "172.16.1.20",
            subnetMask: "255.255.255.0",
            defaultGateway: ""
          }
        }
      ],
      links: [],
      selectedDeviceId: null,
      recentPing: null
    },
    validation: {
      sourceDeviceId: "lab2-pc-a",
      destinationDeviceId: "lab2-pc-b",
      mustIncludeDeviceKinds: ["switch"]
    },
    solutionMetadata: {
      expectedOutcome: "Both PCs reach each other through the new switch.",
      keyFixes: [
        "Add a switch between the endpoints.",
        "Connect both PCs to that switch."
      ]
    }
  },
  {
    id: "lab-broken-routing",
    title: "Lab 3: Broken configuration troubleshooting challenge",
    description: "Investigate a broken routed network, identify the issue, and repair it.",
    difficulty: "Intermediate",
    objectives: [
      "Inspect the current topology and identify the routing problem.",
      "Fix the broken interface or gateway configuration.",
      "Validate end-to-end connectivity across subnets."
    ],
    steps: [
      "Review the router interfaces and endpoint gateways.",
      "Look at the latest ping result and failure reasons.",
      "Correct the broken config, then re-run validation."
    ],
    hints: [
      "Each subnet needs a matching router interface IP.",
      "Endpoints should point to the router IP inside their own subnet."
    ],
    starterTopology: {
      devices: [
        {
          id: "lab3-pc-a",
          kind: "pc",
          name: "PC A",
          position: { x: 70, y: 160 },
          config: {
            ipAddress: "10.0.10.10",
            subnetMask: "255.255.255.0",
            defaultGateway: "10.0.10.1"
          }
        },
        {
          id: "lab3-switch-a",
          kind: "switch",
          name: "Switch A",
          position: { x: 250, y: 160 },
          config: {
            unmanaged: true
          }
        },
        {
          id: "lab3-router",
          kind: "router",
          name: "Router Core",
          position: { x: 450, y: 230 },
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
                enabled: false
              },
              {
                id: "iface-3",
                name: "G0/2",
                ipAddress: "",
                subnetMask: "255.255.255.0",
                enabled: false
              }
            ]
          }
        },
        {
          id: "lab3-switch-b",
          kind: "switch",
          name: "Switch B",
          position: { x: 640, y: 330 },
          config: {
            unmanaged: true
          }
        },
        {
          id: "lab3-pc-b",
          kind: "pc",
          name: "PC B",
          position: { x: 820, y: 330 },
          config: {
            ipAddress: "10.0.20.20",
            subnetMask: "255.255.255.0",
            defaultGateway: "10.0.20.254"
          }
        }
      ],
      links: [
        {
          id: "lab3-link-a",
          sourceDeviceId: "lab3-pc-a",
          targetDeviceId: "lab3-switch-a"
        },
        {
          id: "lab3-link-b",
          sourceDeviceId: "lab3-switch-a",
          targetDeviceId: "lab3-router",
          targetInterfaceId: "iface-1"
        },
        {
          id: "lab3-link-c",
          sourceDeviceId: "lab3-router",
          targetDeviceId: "lab3-switch-b",
          sourceInterfaceId: "iface-2"
        },
        {
          id: "lab3-link-d",
          sourceDeviceId: "lab3-switch-b",
          targetDeviceId: "lab3-pc-b"
        }
      ],
      selectedDeviceId: "lab3-router",
      recentPing: null
    },
    validation: {
      sourceDeviceId: "lab3-pc-a",
      destinationDeviceId: "lab3-pc-b",
      mustIncludeDeviceKinds: ["router", "switch"]
    },
    solutionMetadata: {
      expectedOutcome: "PC A and PC B can reach each other across two routed subnets.",
      keyFixes: [
        "Enable the router interface facing 10.0.20.0/24.",
        "Point PC B's default gateway at 10.0.20.1."
      ]
    }
  }
];
