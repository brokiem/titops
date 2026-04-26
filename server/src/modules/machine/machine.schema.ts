import { z } from 'zod'

export const createMachineSchema = z.object({
    name: z.string().min(1).max(191),
});

export const updateMachineSchema = z.object({
    name: z.string().min(1).max(191),
}).partial().strict().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
});

export type UpdateMachineInput = z.infer<typeof updateMachineSchema>;

export const createScanRequestSchema = z.object({
    cardUid: z.string().regex(/^[0-9a-fA-F]{14}$/, 'cardUid must be 14 hex characters'),
    idempotencyKey: z.string().min(1).max(128),
});
