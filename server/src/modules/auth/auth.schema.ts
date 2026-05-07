import { z } from "zod";

export const loginSchema = z.object({
    email: z.email().transform((value) => value.toLowerCase()),
    password: z.string().min(1),
});

export const createAdminSchema = z.object({
    email: z.email().transform((value) => value.toLowerCase()),
    name: z.string().trim().min(1).max(191),
    password: z.string().min(8).max(191),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
