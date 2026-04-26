import { z } from "zod";

export const simulatorScanSchema = z.object({
  cardUid: z
    .string()
    .regex(/^[0-9a-fA-F]{14}$/, "Card UID must be 14 hex characters"),
});

export type SimulatorScanFormValues = z.infer<typeof simulatorScanSchema>;
