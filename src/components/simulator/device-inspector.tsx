"use client";

import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSimulatorStore } from "@/store/simulator-store";
import type { RouterDevice, RouterInterface } from "@/types/simulator";

function updateRouterInterface(
  router: RouterDevice,
  interfaceId: string,
  updater: (routerInterface: RouterInterface) => RouterInterface
) {
  return {
    ...router,
    config: {
      interfaces: router.config.interfaces.map((item) =>
        item.id === interfaceId ? updater(item) : item
      )
    }
  };
}

export function DeviceInspector() {
  const topology = useSimulatorStore((state) => state.topology);
  const updateDevice = useSimulatorStore((state) => state.updateDevice);
  const removeDevice = useSimulatorStore((state) => state.removeDevice);
  const selectedDevice = topology.devices.find((device) => device.id === topology.selectedDeviceId) ?? null;

  if (!selectedDevice) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Badge variant="info" className="w-fit">
            Inspector
          </Badge>
          <CardTitle>Select a device</CardTitle>
          <CardDescription>
            Click any node on the canvas to inspect and edit its network settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="default" className="mb-3 w-fit">
              {selectedDevice.kind}
            </Badge>
            <CardTitle>{selectedDevice.name}</CardTitle>
            <CardDescription>Adjust the settings that define how this device behaves in the network.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => removeDevice(selectedDevice.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <ScrollArea className="h-[420px]">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="device-name">Device name</Label>
            <Input
              id="device-name"
              value={selectedDevice.name}
              onChange={(event) =>
                updateDevice(selectedDevice.id, (device) => ({ ...device, name: event.target.value }))
              }
            />
          </div>

          {selectedDevice.kind === "switch" ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
              Switches are unmanaged in this lab model and act as simple layer 2 forwarding devices.
            </div>
          ) : null}

          {selectedDevice.kind === "pc" || selectedDevice.kind === "server" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="ip-address">IP address</Label>
                <Input
                  id="ip-address"
                  value={selectedDevice.config.ipAddress}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateDevice(selectedDevice.id, (device) =>
                      device.kind === "pc" || device.kind === "server"
                        ? {
                            ...device,
                            config: {
                              ...device.config,
                              ipAddress: nextValue
                            }
                          }
                        : device
                    );
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subnet-mask">Subnet mask</Label>
                <Input
                  id="subnet-mask"
                  value={selectedDevice.config.subnetMask}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateDevice(selectedDevice.id, (device) =>
                      device.kind === "pc" || device.kind === "server"
                        ? {
                            ...device,
                            config: {
                              ...device.config,
                              subnetMask: nextValue
                            }
                          }
                        : device
                    );
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-gateway">Default gateway</Label>
                <Input
                  id="default-gateway"
                  value={selectedDevice.config.defaultGateway}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateDevice(selectedDevice.id, (device) =>
                      device.kind === "pc" || device.kind === "server"
                        ? {
                            ...device,
                            config: {
                              ...device.config,
                              defaultGateway: nextValue
                            }
                          }
                        : device
                    );
                  }}
                />
              </div>
            </>
          ) : null}

          {selectedDevice.kind === "router" ? (
            <div className="space-y-4">
              {selectedDevice.config.interfaces.map((routerInterface) => (
                <div key={routerInterface.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{routerInterface.name}</p>
                      <p className="text-xs text-muted-foreground">Router interface</p>
                    </div>
                    <Button
                      variant={routerInterface.enabled ? "secondary" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateDevice(selectedDevice.id, (device) =>
                          updateRouterInterface(device as RouterDevice, routerInterface.id, (item) => ({
                            ...item,
                            enabled: !item.enabled
                          }))
                        )
                      }
                    >
                      {routerInterface.enabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>IP address</Label>
                      <Input
                        value={routerInterface.ipAddress}
                        onChange={(event) =>
                          updateDevice(selectedDevice.id, (device) =>
                            updateRouterInterface(device as RouterDevice, routerInterface.id, (item) => ({
                              ...item,
                              ipAddress: event.target.value
                            }))
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subnet mask</Label>
                      <Input
                        value={routerInterface.subnetMask}
                        onChange={(event) =>
                          updateDevice(selectedDevice.id, (device) =>
                            updateRouterInterface(device as RouterDevice, routerInterface.id, (item) => ({
                              ...item,
                              subnetMask: event.target.value
                            }))
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
