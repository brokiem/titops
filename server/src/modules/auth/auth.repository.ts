import { and, eq } from "drizzle-orm";
import { adminAccounts } from "../../db/schema";
import type { AdminAccount } from "../../db/schema";
import type { AppDatabase } from "../../db/client";

export class AuthRepository {
    constructor(private database: AppDatabase) {
    }

    public findById = async (id: string) => {
        const [account] = await this.database.select().from(adminAccounts)
            .where(eq(adminAccounts.id, id))
            .limit(1);

        return account ?? null;
    }

    public findActiveById = async (id: string) => {
        const [account] = await this.database.select().from(adminAccounts)
            .where(and(eq(adminAccounts.id, id), eq(adminAccounts.isActive, true)))
            .limit(1);

        return account ?? null;
    }

    public findByEmail = async (email: string) => {
        const [account] = await this.database.select().from(adminAccounts)
            .where(eq(adminAccounts.email, email))
            .limit(1);

        return account ?? null;
    }

    public findSuperadmin = async () => {
        const [account] = await this.database.select().from(adminAccounts)
            .where(eq(adminAccounts.role, "SUPERADMIN"))
            .limit(1);

        return account ?? null;
    }

    public create = async (data: {
        email: string;
        name: string;
        passwordHash: string;
        role: AdminAccount["role"];
    }) => {
        const now = new Date();
        const [result] = await this.database.insert(adminAccounts).values({
            ...data,
            createdAt: now,
            updatedAt: now,
        }).$returningId();
        if (!result) {
            return null;
        }

        return this.findById(result.id);
    }
}
