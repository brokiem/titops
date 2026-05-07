import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createAdminSchema = z.object({
  email: z.email("Enter a valid email address"),
  name: z.string().trim().min(1, "Name is required").max(191, "Name is too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(191, "Password is too long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type CreateAdminFormValues = z.infer<typeof createAdminSchema>;
