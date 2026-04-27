import {Hono} from "hono";
import {MemberRepository} from "./member.repository";
import {MemberService} from "./member.service";
import {created, ok} from "../../lib/response";
import {toCardAssignmentResponse, toMemberResponse} from "./member.mapper";
import {zValidator} from "@hono/zod-validator";
import {assignCardSchema, createMemberSchema, updateMemberSchema} from "./member.schema";
import type { AppDatabase } from "@server/db/client";

export class MemberRoute {
    public route: Hono;

    constructor(database: AppDatabase) {
        this.route = new Hono();

        const repo = new MemberRepository(database);
        const service = new MemberService(repo);

        this.registerRoutes(service);
    }

    private registerRoutes(service: MemberService) {
        this.route.get('/', async (c) => {
            const members = await service.getAll();
            return ok(c, members.map(toMemberResponse));
        });

        this.route.get('/:id', async (c) => {
            const id = c.req.param('id');
            const member = await service.getById(id);
            return ok(c, toMemberResponse(member));
        });

        this.route.post('/', zValidator('json', createMemberSchema), async (c) => {
            const {name, nim, major} = c.req.valid('json');

            const member = await service.create(name, nim, major);
            return created(c, toMemberResponse(member));
        });

        this.route.patch('/:id', zValidator('json', updateMemberSchema), async (c) => {
            const id = c.req.param('id');
            const data = c.req.valid('json');

            const member = await service.updateById(id, data);
            return ok(c, toMemberResponse(member));
        });

        this.route.post('/:id/cards', zValidator('json', assignCardSchema), async (c) => {
            const id = c.req.param('id');
            const {cardUid} = c.req.valid('json');

            const assignment = await service.assignCardById(id, cardUid);
            return created(c, toCardAssignmentResponse(assignment));
        });

        this.route.delete('/:id', async (c) => {
            const id = c.req.param('id');
            const member = await service.deleteById(id);
            return ok(c, toMemberResponse(member));
        });

        this.route.get('/:id/card', async (c) => {
            const id = c.req.param('id');
            const card = await service.getCardByMemberId(id);
            return ok(c, card ? toCardAssignmentResponse(card) : null);
        });
    }
}
