import {z} from "zod";
import {MAJORS} from "../../contracts";

export const createMemberSchema = z.object({
    name: z.string().min(1).max(191),
    nim: z.string().min(10).max(10),
    major: z.enum(MAJORS),
});

export const updateMemberSchema = z.object({
    name: z.string().min(1).max(191),
    nim: z.string().min(10).max(10),
    major: z.enum(MAJORS),
}).partial().strict().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
});

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export const assignCardSchema = z.object({
    cardUid: z.string().regex(/^[0-9a-fA-F]{14}$/, 'cardUid must be 14 hex characters'),
});
