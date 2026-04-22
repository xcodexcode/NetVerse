export interface ParsedAddress {
  address: string;
  value: number;
}

export interface ParsedNetwork {
  address: string;
  subnetMask: string;
  ipValue: number;
  maskValue: number;
  networkValue: number;
}

export function parseIpv4(address: string): ParsedAddress | null {
  const segments = address.trim().split(".");
  if (segments.length !== 4) {
    return null;
  }

  const values = segments.map((segment) => Number(segment));
  if (values.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    return null;
  }

  const value = values.reduce((accumulator, current) => (accumulator << 8) + current, 0) >>> 0;
  return { address, value };
}

export function isValidIpv4(address: string) {
  return parseIpv4(address) !== null;
}

export function isValidSubnetMask(subnetMask: string) {
  const parsedMask = parseIpv4(subnetMask);
  if (!parsedMask) {
    return false;
  }

  const binary = parsedMask.value.toString(2).padStart(32, "0");
  return !binary.includes("01");
}

export function subnetMaskToPrefix(subnetMask: string) {
  const parsedMask = parseIpv4(subnetMask);
  if (!parsedMask) {
    return null;
  }

  return parsedMask.value.toString(2).split("").filter((bit) => bit === "1").length;
}

export function parseNetwork(address: string, subnetMask: string): ParsedNetwork | null {
  const parsedAddress = parseIpv4(address);
  const parsedMask = parseIpv4(subnetMask);

  if (!parsedAddress || !parsedMask || !isValidSubnetMask(subnetMask)) {
    return null;
  }

  return {
    address,
    subnetMask,
    ipValue: parsedAddress.value,
    maskValue: parsedMask.value,
    networkValue: parsedAddress.value & parsedMask.value
  };
}

export function areInSameSubnet(
  leftAddress: string,
  leftMask: string,
  rightAddress: string,
  rightMask: string
) {
  const left = parseNetwork(leftAddress, leftMask);
  const right = parseNetwork(rightAddress, rightMask);

  if (!left || !right) {
    return false;
  }

  return left.networkValue === right.networkValue && left.maskValue === right.maskValue;
}
