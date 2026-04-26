import {Hono} from 'hono'
import {MachineRepository} from './machine.repository'
import {MachineService} from './machine.service'
import {zValidator} from "@hono/zod-validator";
import {createMachineSchema, createScanRequestSchema, updateMachineSchema} from "./machine.schema";
import {created, ok} from "../../lib/response";
import {toMachineResponse, toScanRequestResponse} from "./machine.mapper";
import type { AppDatabase } from "@server/db/client";
import {UnauthorizedError} from "../../lib/errors";

export class MachineRoute {
    public route: Hono

    constructor(database: AppDatabase, options: { machineKeySecret: string }) {
        this.route = new Hono();

        const repo = new MachineRepository(database);
        const service = new MachineService(repo, options);

        this.registerRoutes(service);
    }

    private registerRoutes(service: MachineService) {
        this.route.get('/', async (c) => {
            const machines = await service.getAll();
            return ok(c, machines.map(toMachineResponse));
        });

        this.route.get('/:id', async (c) => {
            const id = c.req.param('id');
            const machine = await service.getById(id);
            return ok(c, toMachineResponse(machine));
        });

        this.route.post('/', zValidator('json', createMachineSchema), async (c) => {
            const {name} = c.req.valid('json');

            const machine = await service.create(name);
            return created(c, machine);
        });

        this.route.patch('/:id', zValidator('json', updateMachineSchema), async (c) => {
            const id = c.req.param('id');
            const data = c.req.valid('json');

            const machine = await service.updateById(id, data);
            return ok(c, toMachineResponse(machine));
        });

        this.route.post('/:id/heartbeat', async (c) => {
            const id = c.req.param('id');
            const machineKey = c.req.header('x-machine-key');
            if (!machineKey) {
                throw new UnauthorizedError('Missing x-machine-key header');
            }

            const machine = await service.sendHeartbeat(id, machineKey);
            return ok(c, toMachineResponse(machine));
        });

        this.route.post('/:id/scan-requests', zValidator('json', createScanRequestSchema), async (c) => {
            const id = c.req.param('id');
            const {cardUid, idempotencyKey} = c.req.valid('json');
            const machineKey = c.req.header('x-machine-key');
            if (!machineKey) {
                throw new UnauthorizedError('Missing x-machine-key header');
            }

            const result = await service.sendScanRequest(id, machineKey, cardUid, idempotencyKey);
            const payload = {
                ...toScanRequestResponse(result.scanRequest),
                replayed: result.replayed,
            };

            if (result.replayed) {
                return ok(c, payload);
            }

            return created(c, payload);
        });

        this.route.delete('/:id', async (c) => {
            const id = c.req.param('id');
            const machine = await service.deleteById(id);
            return ok(c, toMachineResponse(machine));
        });
    }
}
