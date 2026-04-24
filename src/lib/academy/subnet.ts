export type SubnetResult = {
  input: string;
  cidr: number;
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  subnetMask: string;
  wildcardMask: string;
  hostCount: number;
  binaryAddress: string;
};

function parseIpv4(address: string) {
  const octets = address.trim().split(".");

  if (octets.length !== 4) {
    throw new Error("Enter an IPv4 address with four octets.");
  }

  return octets.map((octet) => {
    if (!/^\d+$/.test(octet)) {
      throw new Error("IPv4 octets must be numbers.");
    }

    const value = Number(octet);

    if (value < 0 || value > 255) {
      throw new Error("IPv4 octets must be between 0 and 255.");
    }

    return value;
  });
}

function octetsToNumber(octets: number[]) {
  return (
    ((octets[0] << 24) >>> 0) +
    ((octets[1] << 16) >>> 0) +
    ((octets[2] << 8) >>> 0) +
    (octets[3] >>> 0)
  ) >>> 0;
}

function numberToIp(value: number) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255
  ].join(".");
}

function numberToBinaryIp(value: number) {
  return [24, 16, 8, 0]
    .map((shift) => ((value >>> shift) & 255).toString(2).padStart(8, "0"))
    .join(".");
}

export function calculateSubnet(value: string): SubnetResult {
  const [address, cidrText] = value.trim().split("/");
  const cidr = Number(cidrText);

  if (!address || !Number.isInteger(cidr) || cidr < 0 || cidr > 32) {
    throw new Error("Use CIDR notation, for example 192.168.10.25/24.");
  }

  const ipNumber = octetsToNumber(parseIpv4(address));
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const network = (ipNumber & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const hostCount = cidr >= 31 ? Math.pow(2, 32 - cidr) : Math.max(Math.pow(2, 32 - cidr) - 2, 0);
  const firstUsable = cidr >= 31 ? network : network + 1;
  const lastUsable = cidr >= 31 ? broadcast : broadcast - 1;

  return {
    input: value.trim(),
    cidr,
    networkAddress: numberToIp(network),
    broadcastAddress: numberToIp(broadcast),
    firstUsable: numberToIp(firstUsable),
    lastUsable: numberToIp(lastUsable),
    subnetMask: numberToIp(mask),
    wildcardMask: numberToIp(wildcard),
    hostCount,
    binaryAddress: numberToBinaryIp(ipNumber)
  };
}
