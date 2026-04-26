import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(191, "Name is too long"),
  nim: z.string().length(10, "NIM must be exactly 10 characters"),
  programStudi: z.string().min(1, "Program Studi is required").max(64, "Program Studi is too long")
});

export const updateMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(191, "Name is too long"),
  nim: z.string().length(10, "NIM must be exactly 10 characters"),
  programStudi: z.string().min(1, "Program Studi is required").max(64, "Program Studi is too long")
}).partial().strict().refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required",
});

export const assignCardSchema = z.object({
  cardUid: z
    .string()
    .regex(/^[0-9a-fA-F]{14}$/, "Card UID must be 14 hex characters"),
});

export type CreateMemberFormValues = z.infer<typeof createMemberSchema>;
export type UpdateMemberFormValues = z.infer<typeof updateMemberSchema>;
