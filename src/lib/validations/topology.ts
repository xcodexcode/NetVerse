import { z } from "zod";

import { isValidIpv4, isValidSubnetMask } from "@/lib/simulator/ip";

const blankableIpv4 = z.string().refine((value) => value === "" || isValidIpv4(value), {
  message: "Enter a valid IPv4 address."
});

export const hostConfigSchema = z.object({
  ipAddress: blankableIpv4,
  subnetMask: z.string().refine((value) => value === "" || isValidSubnetMask(value), {
    message: "Enter a valid subnet mask."
  }),
  defaultGateway: blankableIpv4
});
