import {Hono, type MiddlewareHandler} from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppDatabase } from "../../db/client";
import { created, ok } from "../../lib/response";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { createAdminSchema, loginSchema } from "./auth.schema";
import { toAdminAccountResponse } from "./auth.mapper";
import { type AuthVariables } from "./auth.middleware";

export class AuthRoute {
    public route: Hono<{ Variables: AuthVariables }>;
    public service: AuthService;

    constructor(database: AppDatabase, options: {
        jwtSecret: string;
        superadminEmail: string;
        superadminPassword: string;
    }, authMiddleware: MiddlewareHandler) {
        this.route = new Hono<{ Variables: AuthVariables }>();

        const repo = new AuthRepository(database);
        this.service = new AuthService(repo, options);

        this.registerRoutes(this.service, authMiddleware);
    }

    private registerRoutes(service: AuthService, authMiddleware: MiddlewareHandler) {
        this.route.post('/login', zValidator('json', loginSchema), async (c) => {
            const data = c.req.valid('json');
            const result = await service.login(data);

            return ok(c, result);
        });

        this.route.get('/me', authMiddleware, async (c) => {
            const admin = c.get("admin");
            const account = await service.getAccountById(admin.id);
            return ok(c, toAdminAccountResponse(account));
        });

        this.route.post('/admins', authMiddleware, zValidator('json', createAdminSchema), async (c) => {
            const actor = c.get("admin");
            const data = c.req.valid('json');
            const account = await service.createAdmin(actor, data);

            return created(c, toAdminAccountResponse(account));
        });
    }
}
