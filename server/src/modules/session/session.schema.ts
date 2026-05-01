import {z} from "zod";

const updatableSessionModes = ["IDLE", "CLOCK_IN", "CLOCK_OUT"] as const;

export const createSessionSchema = z.object({
    name: z.string().min(1).max(191),
});

export const updateSessionSchema = z.object({
    name: z.string().min(1).max(191),
}).partial().strict().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
});

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

export const updateSessionModeSchema = z.object({
    mode: z.enum(updatableSessionModes),
});
