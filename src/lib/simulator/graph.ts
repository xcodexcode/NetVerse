import type { NetworkDevice, TopologyLink, TopologySnapshot } from "@/types/simulator";

export function getDeviceById(topology: TopologySnapshot, deviceId: string) {
  return topology.devices.find((device) => device.id === deviceId);
}

export function getPeerDeviceId(link: TopologyLink, deviceId: string) {
  if (link.sourceDeviceId === deviceId) {
    return link.targetDeviceId;
  }

  if (link.targetDeviceId === deviceId) {
    return link.sourceDeviceId;
  }

  return null;
}

export function getDeviceLinks(links: TopologyLink[], deviceId: string) {
  return links.filter((link) => link.sourceDeviceId === deviceId || link.targetDeviceId === deviceId);
}

export function findPath(
  topology: TopologySnapshot,
  sourceId: string,
  targetId: string,
  canTraverse?: (current: NetworkDevice, next: NetworkDevice, link: TopologyLink) => boolean
) {
  const queue: string[][] = [[sourceId]];
  const visited = new Set<string>([sourceId]);

  while (queue.length > 0) {
    const path = queue.shift();
    if (!path) {
      continue;
    }

    const currentId = path[path.length - 1];
    if (currentId === targetId) {
      return path;
    }

    const currentDevice = getDeviceById(topology, currentId);
    if (!currentDevice) {
      continue;
    }

    for (const link of getDeviceLinks(topology.links, currentId)) {
      const nextId = getPeerDeviceId(link, currentId);
      if (!nextId || visited.has(nextId)) {
        continue;
      }

      const nextDevice = getDeviceById(topology, nextId);
      if (!nextDevice) {
        continue;
      }

      if (canTraverse && !canTraverse(currentDevice, nextDevice, link)) {
        continue;
      }

      visited.add(nextId);
      queue.push([...path, nextId]);
    }
  }

  return null;
}

export function buildLayer2Domain(topology: TopologySnapshot, startId: string) {
  const queue = [startId];
  const visited = new Set<string>([startId]);

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) {
      continue;
    }

    for (const link of getDeviceLinks(topology.links, currentId)) {
      const nextId = getPeerDeviceId(link, currentId);
      if (!nextId || visited.has(nextId)) {
        continue;
      }

      const nextDevice = getDeviceById(topology, nextId);
      if (!nextDevice || nextDevice.kind === "router") {
        continue;
      }

      visited.add(nextId);
      queue.push(nextId);
    }
  }

  return visited;
}
