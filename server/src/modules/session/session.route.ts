import {Hono} from "hono";
import {SessionRepository} from "./session.repository";
import {SessionService} from "./session.service";
import {created, ok} from "../../lib/response";
import {toAttendanceResponse, toEnrichedAttendanceResponse, toScanRequestResponse, toSessionResponse} from "./session.mapper";
import {zValidator} from "@hono/zod-validator";
import {createSessionSchema, updateSessionModeSchema, updateSessionSchema} from "./session.schema";
import type { AppDatabase } from "../../db/client";
import type { ScanOutcome } from "../../contracts";

export class SessionRoute {
    public route: Hono;

    constructor(database: AppDatabase) {
        this.route = new Hono();

        const repo = new SessionRepository(database);
        const service = new SessionService(repo);

        this.registerRoutes(service);
    }

    private registerRoutes(service: SessionService) {
        this.route.get('/', async (c) => {
            const sessions = await service.getAll();
            return ok(c, sessions.map(toSessionResponse));
        });

        this.route.get('/:id', async (c) => {
            const id = c.req.param('id');
            const session = await service.getById(id);
            return ok(c, toSessionResponse(session));
        });

        this.route.post('/', zValidator('json', createSessionSchema), async (c) => {
            const {name} = c.req.valid('json');

            const session = await service.create(name);
            return created(c, toSessionResponse(session));
        });

        this.route.patch('/:id', zValidator('json', updateSessionSchema), async (c) => {
            const id = c.req.param('id');
            const data = c.req.valid('json');

            const session = await service.updateById(id, data);
            return ok(c, toSessionResponse(session));
        });

        this.route.patch('/:id/mode', zValidator('json', updateSessionModeSchema), async (c) => {
            const id = c.req.param('id');
            const {mode} = c.req.valid('json');

            const session = await service.updateModeById(id, mode);
            return ok(c, toSessionResponse(session));
        });

        this.route.post('/:id/close', async (c) => {
            const id = c.req.param('id');
            const session = await service.closeById(id);
            return ok(c, toSessionResponse(session));
        });

        this.route.get('/:id/attendance', async (c) => {
            const id = c.req.param('id');
            const attendance = await service.listAttendance(id);
            return ok(c, attendance.map(toAttendanceResponse));
        });

        this.route.get('/:id/enriched-attendance', async (c) => {
            const id = c.req.param('id');
            const attendance = await service.listEnrichedAttendance(id);
            return ok(c, attendance.map(toEnrichedAttendanceResponse));
        });

        this.route.get('/:id/scans', async (c) => {
            const id = c.req.param('id');
            const outcome = c.req.query('outcome') as ScanOutcome | undefined;
            const scans = await service.listScanRequests(id, outcome);
            return ok(c, scans.map(toScanRequestResponse));
        });

        this.route.get('/:id/attendance/:attendanceId', async (c) => {
            const id = c.req.param('id');
            const attendanceId = c.req.param('attendanceId')!;
            const attendance = await service.findAttendanceById(id, attendanceId);
            return ok(c, toAttendanceResponse(attendance));
        });

        this.route.delete('/:id/attendance/:attendanceId', async (c) => {
            const id = c.req.param('id');
            const attendanceId = c.req.param('attendanceId');
            const attendance = await service.deleteAttendanceById(id, attendanceId);
            return ok(c, toAttendanceResponse(attendance));
        });

        this.route.delete('/:id', async (c) => {
            const id = c.req.param('id');
            const session = await service.deleteById(id);
            return ok(c, toSessionResponse(session));
        });
    }
}
