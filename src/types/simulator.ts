export type DeviceKind = "pc" | "switch" | "router" | "server";

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface HostConfig {
  ipAddress: string;
  subnetMask: string;
  defaultGateway: string;
}

export interface RouterInterface {
  id: string;
  name: string;
  ipAddress: string;
  subnetMask: string;
  enabled: boolean;
}

interface BaseDevice {
  id: string;
  name: string;
  kind: DeviceKind;
  position: CanvasPosition;
}

export interface PcDevice extends BaseDevice {
  kind: "pc";
  config: HostConfig;
}

export interface ServerDevice extends BaseDevice {
  kind: "server";
  config: HostConfig;
}

export interface SwitchDevice extends BaseDevice {
  kind: "switch";
  config: {
    unmanaged: true;
  };
}

export interface RouterDevice extends BaseDevice {
  kind: "router";
  config: {
    interfaces: RouterInterface[];
  };
}

export type NetworkDevice = PcDevice | ServerDevice | SwitchDevice | RouterDevice;
export type EndpointDevice = PcDevice | ServerDevice;

export interface TopologyLink {
  id: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  sourceInterfaceId?: string;
  targetInterfaceId?: string;
}

export type DiagnosticLevel = "info" | "warning" | "error";

export interface DiagnosticIssue {
  code: string;
  level: DiagnosticLevel;
  message: string;
  suggestion?: string;
  deviceId?: string;
  linkId?: string;
}

export interface PingResult {
  id: string;
  sourceDeviceId: string;
  destinationDeviceId: string;
  success: boolean;
  summary: string;
  explanation: string;
  path: string[];
  diagnostics: DiagnosticIssue[];
  createdAt: string;
}

export interface TopologySnapshot {
  devices: NetworkDevice[];
  links: TopologyLink[];
  selectedDeviceId: string | null;
  recentPing: PingResult | null;
}
