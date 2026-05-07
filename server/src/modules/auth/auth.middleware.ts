import { createMiddleware } from "hono/factory";
import { UnauthorizedError } from "../../lib/errors";
import type { AdminAccount } from "../../db/schema";
import { verifyJwt } from "./jwt";

export type AuthVariables = {
    admin: Pick<AdminAccount, "id" | "email" | "name" | "role">;
};

export const createAuthMiddleware = (jwtSecret: string) => createMiddleware<{ Variables: AuthVariables }>(
    async (c, next) => {
        const header = c.req.header("authorization");
        const [scheme, token] = header?.split(" ") ?? [];
        if (scheme !== "Bearer" || !token) {
            throw new UnauthorizedError("Missing bearer token");
        }

        const payload = await verifyJwt(token, jwtSecret);

        c.set("admin", {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            role: payload.role,
        });

        await next();
    },
);
