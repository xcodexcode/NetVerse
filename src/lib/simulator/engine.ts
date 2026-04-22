import {
  areInSameSubnet,
  isValidIpv4,
  isValidSubnetMask,
  parseNetwork,
  subnetMaskToPrefix
} from "@/lib/simulator/ip";
import {
  buildLayer2Domain,
  findPath,
  getDeviceById,
  getDeviceLinks,
  getPeerDeviceId
} from "@/lib/simulator/graph";
import type {
  DiagnosticIssue,
  EndpointDevice,
  NetworkDevice,
  PingResult,
  RouterDevice,
  RouterInterface,
  TopologySnapshot
} from "@/types/simulator";

function createIssue(issue: DiagnosticIssue): DiagnosticIssue {
  return issue;
}

function isEndpoint(device: NetworkDevice): device is EndpointDevice {
  return device.kind === "pc" || device.kind === "server";
}

function isRouter(device: NetworkDevice): device is RouterDevice {
  return device.kind === "router";
}

function getRouterInterfaceLinks(topology: TopologySnapshot, routerId: string, interfaceId: string) {
  return topology.links.filter((link) => {
    const isSourceMatch = link.sourceDeviceId === routerId && link.sourceInterfaceId === interfaceId;
    const isTargetMatch = link.targetDeviceId === routerId && link.targetInterfaceId === interfaceId;
    return isSourceMatch || isTargetMatch;
  });
}

function getConnectedInterfaceDomain(
  topology: TopologySnapshot,
  routerId: string,
  interfaceId: string
) {
  const interfaceLinks = getRouterInterfaceLinks(topology, routerId, interfaceId);
  const firstLink = interfaceLinks[0];

  if (!firstLink) {
    return new Set<string>();
  }

  const neighborId = getPeerDeviceId(firstLink, routerId);
  if (!neighborId) {
    return new Set<string>();
  }

  const domain = buildLayer2Domain(topology, neighborId);
  domain.add(neighborId);
  return domain;
}

function interfaceCanReachHost(
  topology: TopologySnapshot,
  host: EndpointDevice,
  router: RouterDevice,
  routerInterface: RouterInterface,
  requireGatewayMatch: boolean
) {
  if (!routerInterface.enabled) {
    return {
      reachable: false,
      reason: createIssue({
        code: "INTERFACE_DISABLED",
        level: "error",
        deviceId: router.id,
        message: `${router.name} ${routerInterface.name} is disabled.`,
        suggestion: `Enable ${routerInterface.name} on ${router.name}.`
      })
    };
  }

  if (!routerInterface.ipAddress || !routerInterface.subnetMask) {
    return {
      reachable: false,
      reason: createIssue({
        code: "INTERFACE_UNCONFIGURED",
        level: "error",
        deviceId: router.id,
        message: `${router.name} ${routerInterface.name} is missing an IP configuration.`,
        suggestion: `Assign an IP address and subnet mask to ${routerInterface.name}.`
      })
    };
  }

  const domain = getConnectedInterfaceDomain(topology, router.id, routerInterface.id);
  if (!domain.has(host.id)) {
    return {
      reachable: false,
      reason: createIssue({
        code: "INTERFACE_NOT_CONNECTED",
        level: "warning",
        deviceId: router.id,
        message: `${host.name} is not physically connected to ${router.name} ${routerInterface.name}.`,
        suggestion: "Connect the host through a switch or directly to the correct router interface."
      })
    };
  }

  if (!areInSameSubnet(
    host.config.ipAddress,
    host.config.subnetMask,
    routerInterface.ipAddress,
    routerInterface.subnetMask
  )) {
    return {
      reachable: false,
      reason: createIssue({
        code: "WRONG_INTERFACE_SUBNET",
        level: "error",
        deviceId: router.id,
        message: `${router.name} ${routerInterface.name} is not in ${host.name}'s subnet.`,
        suggestion: `Put ${routerInterface.name} into the same subnet as ${host.name}.`
      })
    };
  }

  if (requireGatewayMatch && host.config.defaultGateway !== routerInterface.ipAddress) {
    return {
      reachable: false,
      reason: createIssue({
        code: "DEFAULT_GATEWAY_MISMATCH",
        level: "error",
        deviceId: host.id,
        message: `${host.name} is pointing at ${host.config.defaultGateway || "no gateway"} instead of ${routerInterface.ipAddress}.`,
        suggestion: `Set ${host.name}'s default gateway to ${routerInterface.ipAddress}.`
      })
    };
  }

  return { reachable: true, reason: null };
}

function validateHost(device: EndpointDevice) {
  const issues: DiagnosticIssue[] = [];

  if (!device.config.ipAddress) {
    issues.push(
      createIssue({
        code: "HOST_IP_MISSING",
        level: "error",
        deviceId: device.id,
        message: `${device.name} is missing an IP address.`,
        suggestion: `Assign an IPv4 address to ${device.name}.`
      })
    );
  } else if (!isValidIpv4(device.config.ipAddress)) {
    issues.push(
      createIssue({
        code: "HOST_IP_INVALID",
        level: "error",
        deviceId: device.id,
        message: `${device.name} has an invalid IP address.`,
        suggestion: "Use dotted decimal format like 192.168.10.12."
      })
    );
  }

  if (!device.config.subnetMask) {
    issues.push(
      createIssue({
        code: "HOST_MASK_MISSING",
        level: "error",
        deviceId: device.id,
        message: `${device.name} is missing a subnet mask.`,
        suggestion: `Set a subnet mask such as 255.255.255.0 on ${device.name}.`
      })
    );
  } else if (!isValidSubnetMask(device.config.subnetMask)) {
    issues.push(
      createIssue({
        code: "HOST_MASK_INVALID",
        level: "error",
        deviceId: device.id,
        message: `${device.name} has an invalid subnet mask.`,
        suggestion: "Use a valid mask such as 255.255.255.0."
      })
    );
  }

  if (device.config.defaultGateway && !isValidIpv4(device.config.defaultGateway)) {
    issues.push(
      createIssue({
        code: "HOST_GATEWAY_INVALID",
        level: "error",
        deviceId: device.id,
        message: `${device.name} has an invalid default gateway.`,
        suggestion: "Use a valid IPv4 gateway address."
      })
    );
  }

  return issues;
}

export function analyzeTopology(topology: TopologySnapshot) {
  const issues: DiagnosticIssue[] = [];

  for (const device of topology.devices) {
    if (isEndpoint(device)) {
      issues.push(...validateHost(device));
      continue;
    }

    if (!isRouter(device)) {
      continue;
    }

    for (const routerInterface of device.config.interfaces) {
      const links = getRouterInterfaceLinks(topology, device.id, routerInterface.id);

      if (links.length > 1) {
        issues.push(
          createIssue({
            code: "INTERFACE_REUSED",
            level: "error",
            deviceId: device.id,
            message: `${device.name} ${routerInterface.name} is connected to more than one link.`,
            suggestion: "Use one physical link per router interface in this MVP."
          })
        );
      }

      if (routerInterface.ipAddress && !isValidIpv4(routerInterface.ipAddress)) {
        issues.push(
          createIssue({
            code: "ROUTER_IP_INVALID",
            level: "error",
            deviceId: device.id,
            message: `${device.name} ${routerInterface.name} has an invalid IP address.`,
            suggestion: "Use dotted decimal notation like 10.0.10.1."
          })
        );
      }

      if (routerInterface.subnetMask && !isValidSubnetMask(routerInterface.subnetMask)) {
        issues.push(
          createIssue({
            code: "ROUTER_MASK_INVALID",
            level: "error",
            deviceId: device.id,
            message: `${device.name} ${routerInterface.name} has an invalid subnet mask.`,
            suggestion: "Use a valid subnet mask such as 255.255.255.0."
          })
        );
      }

      if (links.length > 0 && routerInterface.enabled && (!routerInterface.ipAddress || !routerInterface.subnetMask)) {
        issues.push(
          createIssue({
            code: "ROUTER_INTERFACE_NEEDS_CONFIG",
            level: "warning",
            deviceId: device.id,
            message: `${device.name} ${routerInterface.name} is connected but not fully configured.`,
            suggestion: `Set an IP address and subnet mask on ${routerInterface.name}.`
          })
        );
      }
    }
  }

  return issues;
}

function buildResult(
  sourceId: string,
  destinationId: string,
  success: boolean,
  summary: string,
  explanation: string,
  path: string[],
  diagnostics: DiagnosticIssue[]
): PingResult {
  return {
    id: crypto.randomUUID(),
    sourceDeviceId: sourceId,
    destinationDeviceId: destinationId,
    success,
    summary,
    explanation,
    path,
    diagnostics,
    createdAt: new Date().toISOString()
  };
}

function describePath(topology: TopologySnapshot, path: string[]) {
  return path
    .map((deviceId) => getDeviceById(topology, deviceId)?.name ?? deviceId)
    .join(" -> ");
}

export function evaluatePing(topology: TopologySnapshot, sourceId: string, destinationId: string) {
  const source = getDeviceById(topology, sourceId);
  const destination = getDeviceById(topology, destinationId);
  const diagnostics = analyzeTopology(topology);

  if (!source || !destination || !isEndpoint(source) || !isEndpoint(destination)) {
    return buildResult(
      sourceId,
      destinationId,
      false,
      "Ping failed",
      "Choose two valid endpoint devices such as PCs or servers.",
      [],
      [
        createIssue({
          code: "INVALID_ENDPOINT_SELECTION",
          level: "error",
          message: "Only PCs and servers can be used as ping endpoints in this MVP."
        })
      ]
    );
  }

  const sourceIssues = validateHost(source);
  const destinationIssues = validateHost(destination);
  if (sourceIssues.length > 0 || destinationIssues.length > 0) {
    return buildResult(
      sourceId,
      destinationId,
      false,
      "Configuration incomplete",
      "One or both endpoints are missing a valid IP configuration, so the ping cannot start.",
      [],
      [...diagnostics, ...sourceIssues, ...destinationIssues]
    );
  }

  const physicalPath = findPath(topology, source.id, destination.id);
  if (!physicalPath) {
    return buildResult(
      sourceId,
      destinationId,
      false,
      "No path found",
      "These devices are not physically connected anywhere in the topology.",
      [],
      [
        ...diagnostics,
        createIssue({
          code: "NO_PHYSICAL_PATH",
          level: "error",
          message: `${source.name} cannot reach ${destination.name} because no cable path exists.`,
          suggestion: "Add links so the devices are connected through a switch or router."
        })
      ]
    );
  }

  const layer2Path = findPath(
    topology,
    source.id,
    destination.id,
    (current, next) => {
      if (current.kind === "router") {
        return false;
      }
      return next.kind !== "router";
    }
  );

  if (areInSameSubnet(
    source.config.ipAddress,
    source.config.subnetMask,
    destination.config.ipAddress,
    destination.config.subnetMask
  )) {
    if (layer2Path) {
      const prefix = subnetMaskToPrefix(source.config.subnetMask);
      return buildResult(
        sourceId,
        destinationId,
        true,
        "Ping successful",
        `${source.name} and ${destination.name} share the same /${prefix} network and have a valid layer 2 path: ${describePath(topology, layer2Path)}.`,
        layer2Path,
        diagnostics
      );
    }

    return buildResult(
      sourceId,
      destinationId,
      false,
      "Layer 2 path missing",
      "The endpoints are in the same subnet, but there is no direct switching path between them.",
      physicalPath,
      [
        ...diagnostics,
        createIssue({
          code: "NO_LAYER2_PATH",
          level: "error",
          message: `${source.name} and ${destination.name} are in the same subnet but not on the same layer 2 path.`,
          suggestion: "Place both endpoints on the same switch segment or connect them directly."
        })
      ]
    );
  }

  const routers = topology.devices.filter(isRouter);
  const routeIssues: DiagnosticIssue[] = [];

  if (!source.config.defaultGateway || !destination.config.defaultGateway) {
    return buildResult(
      sourceId,
      destinationId,
      false,
      "Gateway missing",
      "Cross-subnet traffic needs a default gateway on both hosts so replies can return.",
      physicalPath,
      [
        ...diagnostics,
        createIssue({
          code: "GATEWAY_REQUIRED",
          level: "error",
          message: "One or both endpoints are missing a default gateway.",
          suggestion: "Set the gateway to the router interface inside each endpoint's subnet."
        })
      ]
    );
  }

  for (const router of routers) {
    const reachableFromSource: RouterInterface[] = [];
    const reachableFromDestination: RouterInterface[] = [];

    for (const routerInterface of router.config.interfaces) {
      const sourceReach = interfaceCanReachHost(topology, source, router, routerInterface, true);
      if (sourceReach.reachable) {
        reachableFromSource.push(routerInterface);
      } else if (sourceReach.reason) {
        routeIssues.push(sourceReach.reason);
      }

      const destinationReach = interfaceCanReachHost(topology, destination, router, routerInterface, true);
      if (destinationReach.reachable) {
        reachableFromDestination.push(routerInterface);
      } else if (destinationReach.reason) {
        routeIssues.push(destinationReach.reason);
      }
    }

    for (const sourceInterface of reachableFromSource) {
      for (const destinationInterface of reachableFromDestination) {
        if (sourceInterface.id === destinationInterface.id) {
          continue;
        }

        return buildResult(
          sourceId,
          destinationId,
          true,
          "Ping successful",
          `${source.name} reaches ${destination.name} through ${router.name}. ${sourceInterface.name} handles ${source.name}'s subnet and ${destinationInterface.name} handles ${destination.name}'s subnet.`,
          physicalPath,
          diagnostics
        );
      }
    }
  }

  return buildResult(
    sourceId,
    destinationId,
    false,
    "Routing failed",
    "A physical path exists, but the router, interfaces, or gateway settings do not create a valid routed path between the two subnets.",
    physicalPath,
    [
      ...diagnostics,
      ...routeIssues,
      createIssue({
        code: "NO_VALID_ROUTE",
        level: "error",
        message: `${source.name} cannot find a valid routed path to ${destination.name}.`,
        suggestion: "Check the router interface IPs, enable the right interfaces, and make sure each host points to the correct gateway."
      })
    ]
  );
}

export function summarizeTopology(topology: TopologySnapshot) {
  const endpointCount = topology.devices.filter((device) => device.kind === "pc" || device.kind === "server").length;
  const routerCount = topology.devices.filter((device) => device.kind === "router").length;
  const switchCount = topology.devices.filter((device) => device.kind === "switch").length;

  return {
    deviceCount: topology.devices.length,
    endpointCount,
    routerCount,
    switchCount,
    linkCount: topology.links.length,
    issueCount: analyzeTopology(topology).length
  };
}
