import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";

export type AppDatabase = MySql2Database;

export const createDatabase = (databaseUrl: string): AppDatabase => {
    return drizzle(databaseUrl);
};
