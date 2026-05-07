import type { AdminAccount } from "../../db/schema";
import type { AdminAccountDto } from "../../contracts";

export const toAdminAccountResponse = (account: AdminAccount): AdminAccountDto => ({
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
});
