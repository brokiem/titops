import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {MachineRoute} from "./modules/machine/machine.route";
import {AppError} from "./lib/errors";
import {MemberRoute} from "./modules/member/member.route";
import {SessionRoute} from "./modules/session/session.route";
import type {ApiErrorResponse} from "./contracts";
import {createDatabase, type AppDatabase} from "./db/client";
import {getServerEnv, type ServerEnv} from "./config/env";
import {AuthRoute} from "./modules/auth/auth.route";
import {createAuthMiddleware} from "./modules/auth/auth.middleware";

type CreateAppOptions = {
    db?: AppDatabase;
    env?: ServerEnv;
    logger?: Pick<Console, "error">;
};

export const createApp = (options: CreateAppOptions = {}) => {
    const env = options.env ?? getServerEnv();
    const db = options.db ?? createDatabase(env.DATABASE_URL);
    const logger = options.logger ?? console;

    const rootApp = new Hono();

    const app = rootApp.basePath('/api');

    app.use('*', cors());
    app.get('/', (c) => c.json({status: 'ok'}));

    setupErrorHandler(rootApp, logger);

    const authModule = new AuthRoute(db, {
        jwtSecret: env.JWT_SECRET,
        superadminEmail: env.SUPERADMIN_EMAIL,
        superadminPassword: env.SUPERADMIN_PASSWORD,
    });
    void authModule.service.ensureSuperadmin().catch((error: unknown) => logger.error(error));

    const authMiddleware = createAuthMiddleware(authModule.service);
    app.route('/auth', authModule.route);

    const machineModule = new MachineRoute(db, {machineKeySecret: env.MACHINE_KEY_SECRET}, authMiddleware);
    app.route('/machines', machineModule.route);

    const memberModule = new MemberRoute(db, authMiddleware);
    app.route('/members', memberModule.route);

    const sessionModule = new SessionRoute(db, authMiddleware);
    app.route('/sessions', sessionModule.route);

    return rootApp;
}

const setupErrorHandler = (app: Hono, logger: Pick<Console, "error">) => {
    app.onError((err, c) => {
        if (err instanceof AppError) {
            return c.json(
                {
                    error: {
                        message: err.message,
                        code: err.code,
                        details: err.details,
                    },
                } satisfies ApiErrorResponse,
                err.statusCode
            );
        }

        logger.error(err);

        return c.json(
            {
                error: {
                    message: 'Internal Server Error',
                    code: 'UNKNOWN_ERROR',
                },
            } satisfies ApiErrorResponse,
            500
        )
    });
}
