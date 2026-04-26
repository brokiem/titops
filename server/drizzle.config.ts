import { defineConfig } from 'drizzle-kit';
import { parseServerEnv } from './src/config/env';

const env = parseServerEnv(process.env);

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'mysql',
    dbCredentials: {
        url: env.DATABASE_URL,
    },
});
