import {cardAssignments, members, scanRequests} from "@server/db/schema";
import {and, eq} from "drizzle-orm";
import type {AppDatabase} from "@server/db/client";
import {omitUndefinedValues} from "@server/utils/util";

export class MemberRepository {
    constructor(private database: AppDatabase) {
    }

    public findAll = async () => {
        return this.database.select({
            id: members.id,
            name: members.name,
            nim: members.nim,
            major: members.major,
            createdAt: members.createdAt,
            updatedAt: members.updatedAt,
            cardUid: cardAssignments.cardUid,
        }).from(members).leftJoin(cardAssignments, eq(members.id, cardAssignments.memberId));
    }

    public findById = async (id: string) => {
        const [member] = await this.database.select({
            id: members.id,
            name: members.name,
            nim: members.nim,
            major: members.major,
            createdAt: members.createdAt,
            updatedAt: members.updatedAt,
            cardUid: cardAssignments.cardUid,
        }).from(members).leftJoin(cardAssignments, eq(members.id, cardAssignments.memberId)).where(eq(members.id, id)).limit(1);
        return member ?? null;
    }

    public create = async (name: string, nim: string, major: string) => {
        const [result] = await this.database.insert(members).values({
            name: name,
            nim: nim,
            major: major
        }).$returningId();

        if (!result) {
            return null;
        }

        return this.findById(result.id);
    }

    public updateById = async (id: string, data: Partial<{ name: string; nim: string }>) => {
        const existing = await this.findById(id);
        if (!existing) {
            return null;
        }

        await this.database.update(members).set(omitUndefinedValues(data)).where(eq(members.id, id));
        return this.findById(id);
    }

    public deleteById = async (id: string) => {
        const existing = await this.findById(id);
        if (!existing) {
            return null;
        }

        await this.database.delete(members).where(eq(members.id, id));
        return existing;
    }

    public findCardAssignmentByUid = async (cardUid: string) => {
        const [assignment] = await this.database.select().from(cardAssignments)
            .where(eq(cardAssignments.cardUid, cardUid)).limit(1);

        return assignment ?? null;
    }

    public createCardAssignment = async (memberId: string, cardUid: string) => {
        const [result] = await this.database.insert(cardAssignments).values({
            memberId: memberId,
            cardUid: cardUid,
        }).$returningId();
        if (!result) {
            return null;
        }

        const [assignment] = await this.database.select().from(cardAssignments)
            .where(eq(cardAssignments.id, result.id)).limit(1);

        return assignment ?? null;
    }

    public findCardAssignmentByMemberId = async (memberId: string) => {
        const [assignment] = await this.database.select().from(cardAssignments)
            .where(eq(cardAssignments.memberId, memberId)).limit(1);
        return assignment ?? null;
    }

    public updateCardAssignment = async (id: string, cardUid: string) => {
        await this.database.update(cardAssignments).set({cardUid: cardUid}).where(eq(cardAssignments.id, id));
        const [assignment] = await this.database.select().from(cardAssignments)
            .where(eq(cardAssignments.id, id)).limit(1);
        return assignment ?? null;
    }

    public deleteUnknownScanRequestsByCardUid = async (cardUid: string) => {
        await this.database.delete(scanRequests)
            .where(and(
                eq(scanRequests.cardUid, cardUid),
                eq(scanRequests.outcome, "UNKNOWN_CARD")
            ));
    }
}
