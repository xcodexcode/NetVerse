import type {
  CanvasPosition,
  DeviceKind,
  NetworkDevice,
  RouterDevice,
  RouterInterface,
  TopologyLink,
  TopologySnapshot
} from "@/types/simulator";

const DEVICE_LABELS: Record<DeviceKind, string> = {
  pc: "PC",
  switch: "Switch",
  router: "Router",
  server: "Server"
};

const DEFAULT_MASK = "255.255.255.0";

export function createRouterInterface(index: number): RouterInterface {
  return {
    id: `iface-${index + 1}`,
    name: `G0/${index}`,
    ipAddress: "",
    subnetMask: DEFAULT_MASK,
    enabled: index < 2
  };
}

function nextName(kind: DeviceKind, devices: NetworkDevice[]) {
  const total = devices.filter((device) => device.kind === kind).length + 1;
  return `${DEVICE_LABELS[kind]} ${total}`;
}

export function createDefaultDevice(
  kind: DeviceKind,
  devices: NetworkDevice[],
  position: CanvasPosition
): NetworkDevice {
  const id = `${kind}-${crypto.randomUUID()}`;
  const name = nextName(kind, devices);

  if (kind === "router") {
    return {
      id,
      name,
      kind,
      position,
      config: {
        interfaces: [createRouterInterface(0), createRouterInterface(1), createRouterInterface(2)]
      }
    };
  }

  if (kind === "switch") {
    return {
      id,
      name,
      kind,
      position,
      config: {
        unmanaged: true
      }
    };
  }

  return {
    id,
    name,
    kind,
    position,
    config: {
      ipAddress: "",
      subnetMask: DEFAULT_MASK,
      defaultGateway: ""
    }
  };
}

export function createBlankTopology(): TopologySnapshot {
  return {
    devices: [],
    links: [],
    selectedDeviceId: null,
    recentPing: null
  };
}

export function getRouterLinkedInterfaceIds(routerId: string, links: TopologyLink[]) {
  return new Set(
    links.flatMap((link) => {
      const ids: string[] = [];
      if (link.sourceDeviceId === routerId && link.sourceInterfaceId) {
        ids.push(link.sourceInterfaceId);
      }
      if (link.targetDeviceId === routerId && link.targetInterfaceId) {
        ids.push(link.targetInterfaceId);
      }
      return ids;
    })
  );
}

export function ensureAvailableRouterInterface(
  router: RouterDevice,
  links: TopologyLink[]
): RouterDevice {
  const linkedInterfaceIds = getRouterLinkedInterfaceIds(router.id, links);
  const existingAvailable = router.config.interfaces.find(
    (item) => !linkedInterfaceIds.has(item.id)
  );

  if (existingAvailable) {
    return router;
  }

  const nextIndex = router.config.interfaces.length;
  return {
    ...router,
    config: {
      interfaces: [...router.config.interfaces, createRouterInterface(nextIndex)]
    }
  };
}
