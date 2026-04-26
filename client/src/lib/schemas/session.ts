import { z } from "zod";

export const createSessionSchema = z.object({
  name: z.string().min(1, "Name is required").max(191, "Name is too long"),
});

export type CreateSessionFormValues = z.infer<typeof createSessionSchema>;
