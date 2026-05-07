import { createMiddleware } from "hono/factory";
import { UnauthorizedError } from "../../lib/errors";
import type { AdminAccount } from "../../db/schema";
import type { AuthService } from "./auth.service";

export type AuthVariables = {
    admin: AdminAccount;
};

export const createAuthMiddleware = (authService: AuthService) => createMiddleware<{ Variables: AuthVariables }>(
    async (c, next) => {
        await authService.ensureSuperadmin();

        const header = c.req.header("authorization");
        const [scheme, token] = header?.split(" ") ?? [];
        if (scheme !== "Bearer" || !token) {
            throw new UnauthorizedError("Missing bearer token");
        }

        const admin = await authService.authenticateToken(token);
        c.set("admin", admin);

        await next();
    },
);
