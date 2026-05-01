import {attendance, cardAssignments, members, scanRequests, sessions} from "../../db/schema";
import type {Session, ScanRequest} from "../../db/schema";
import {and, desc, eq} from "drizzle-orm";
import type {AppDatabase} from "../../db/client";
import type {UpdateSessionInput} from "./session.schema";
import {omitUndefinedValues} from "../../utils/util";

export class SessionRepository {
    constructor(private database: AppDatabase) {
    }

    public findAll = async () => {
        return this.database.select().from(sessions);
    }

    public findById = async (id: string) => {
        const [session] = await this.database.select().from(sessions).where(eq(sessions.id, id)).limit(1);
        return session ?? null;
    }

    public findActive = async () => {
        const [session] = await this.database.select().from(sessions).where(eq(sessions.isActive, true)).limit(1);
        return session ?? null;
    }

    public create = async (name: string) => {
        const [result] = await this.database.insert(sessions).values({
            name: name,
        }).$returningId();
        if (!result) {
            return null;
        }

        return this.findById(result.id);
    }

    public updateById = async (id: string, data: UpdateSessionInput) => {
        const existing = await this.findById(id);
        if (!existing) {
            return null;
        }

        await this.database.update(sessions).set(omitUndefinedValues(data)).where(eq(sessions.id, id));
        return this.findById(id);
    }

    public updateModeById = async (id: string, data: { mode: Session["mode"]; startedAt?: Date }) => {
        const existing = await this.findById(id);
        if (!existing) {
            return null;
        }

        await this.database.update(sessions).set(omitUndefinedValues({
            mode: data.mode,
            startedAt: data.startedAt,
        })).where(eq(sessions.id, id));

        return this.findById(id);
    }

    public closeById = async (id: string, closedAt: Date) => {
        const existing = await this.findById(id);
        if (!existing) {
            return null;
        }

        await this.database.update(sessions).set({
            mode: "CLOSED",
            closedAt: closedAt,
            isActive: false,
            activeSingleton: null,
        }).where(eq(sessions.id, id));

        return this.findById(id);
    }

    public findAttendanceBySessionId = async (sessionId: string) => {
        return this.database.select().from(attendance)
            .where(eq(attendance.sessionId, sessionId))
            .orderBy(desc(attendance.checkInAt));
    }

    public findEnrichedAttendanceBySessionId = async (sessionId: string) => {
        return this.database
            .select({
                id: attendance.id,
                sessionId: attendance.sessionId,
                cardAssignmentId: attendance.cardAssignmentId,
                memberName: members.name,
                memberNim: members.nim,
                memberMajor: members.major,
                cardUid: cardAssignments.cardUid,
                checkInAt: attendance.checkInAt,
                checkOutAt: attendance.checkOutAt,
                createdAt: attendance.createdAt,
                updatedAt: attendance.updatedAt,
            })
            .from(attendance)
            .innerJoin(cardAssignments, eq(attendance.cardAssignmentId, cardAssignments.id))
            .innerJoin(members, eq(cardAssignments.memberId, members.id))
            .where(eq(attendance.sessionId, sessionId))
            .orderBy(desc(attendance.checkInAt));
    }

    public findScanRequestsBySessionId = async (sessionId: string, outcome?: ScanRequest["outcome"]) => {
        const conditions = [eq(scanRequests.sessionId, sessionId)];
        if (outcome) {
            conditions.push(eq(scanRequests.outcome, outcome));
        }

        return this.database.select().from(scanRequests)
            .where(and(...conditions))
            .orderBy(desc(scanRequests.createdAt));
    }

    public findAttendanceById = async (sessionId: string, attendanceId: string) => {
        const [attendanceRecord] = await this.database.select().from(attendance).where(
            and(
                eq(attendance.id, attendanceId),
                eq(attendance.sessionId, sessionId),
            )
        ).limit(1);

        return attendanceRecord ?? null;
    }

    public deleteAttendanceById = async (sessionId: string, attendanceId: string) => {
        const existing = await this.findAttendanceById(sessionId, attendanceId);
        if (!existing) {
            return null;
        }

        await this.database.delete(attendance).where(
            and(
                eq(attendance.id, attendanceId),
                eq(attendance.sessionId, sessionId),
            )
        );

        return existing;
    }

    public deleteById = async (id: string) => {
        const existing = await this.findById(id);
        if (!existing) {
            return null;
        }

        await this.database.delete(sessions).where(eq(sessions.id, id));
        return existing;
    }
}
