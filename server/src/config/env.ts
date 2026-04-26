import { z } from "zod";

const serverEnvSchema = z.object({
    DATABASE_URL: z.url(),
    MACHINE_KEY_SECRET: z.string().min(1),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export const parseServerEnv = (env: NodeJS.ProcessEnv): ServerEnv => {
    return serverEnvSchema.parse(env);
};

export const getServerEnv = (): ServerEnv => {
    cachedEnv ??= parseServerEnv(process.env);
    return cachedEnv;
};
