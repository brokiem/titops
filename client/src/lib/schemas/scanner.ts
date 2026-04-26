import { z } from "zod";

export const createScannerSchema = z.object({
  name: z.string().min(1, "Name is required").max(191, "Name is too long"),
});

export type CreateScannerFormValues = z.infer<typeof createScannerSchema>;
