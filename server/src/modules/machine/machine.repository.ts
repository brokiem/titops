import {attendance, cardAssignments, machines, scanRequests, sessions} from "../../db/schema";
import type {ScanRequest} from "../../db/schema";
import {and, eq} from "drizzle-orm";
import type {AppDatabase} from "../../db/client";
import {omitUndefinedValues} from "../../utils/util";

export class MachineRepository {
    constructor(private database: AppDatabase) {
    }

    public transaction = async <T>(callback: (repository: MachineRepository) => Promise<T>) => {
        return this.database.transaction(async (tx) => {
            return callback(new MachineRepository(tx));
        });
    }

    public findAll = async () => {
        return this.database.select().from(machines);
    }

    public findById = async (id: string) => {
        const [machine] = await this.database.select().from(machines).where(eq(machines.id, id)).limit(1);
        return machine ?? null;
    }

    public create = async (name: string, machineKeyDigest: string) => {
        const [result] = await this.database.insert(machines).values({
            name: name,
            machineKeyDigest: machineKeyDigest,
        }).$returningId();
        if (!result) {
            return null;
        }

        return this.findById(result.id);
    }

    public updateById = async (id: string, data: Partial<{ name: string }>) => {
        const existing = await this.findById(id);
        if (!existing) {
            return null;
        }

        await this.database.update(machines).set(omitUndefinedValues(data)).where(eq(machines.id, id));
        return this.findById(id);
    }

    public deleteById = async (id: string) => {
        const existing = await this.findById(id);
        if (!existing) {
            return null;
        }

        await this.database.delete(machines).where(eq(machines.id, id));
        return existing;
    }

    public touchHeartbeatById = async (id: string, heartbeatAt: Date) => {
        const existing = await this.findById(id);
        if (!existing) {
            return null;
        }

        await this.database.update(machines).set({lastHeartbeatAt: heartbeatAt}).where(eq(machines.id, id));
        return this.findById(id);
    }

    public findActiveSession = async () => {
        const [session] = await this.database.select().from(sessions).where(eq(sessions.isActive, true)).limit(1);
        return session ?? null;
    }

    public findScanRequestByIdempotency = async (sessionId: string, machineId: string, idempotencyKey: string) => {
        const [scanRequest] = await this.database.select().from(scanRequests).where(
            and(
                eq(scanRequests.sessionId, sessionId),
                eq(scanRequests.machineId, machineId),
                eq(scanRequests.idempotencyKey, idempotencyKey),
            )
        ).limit(1);

        return scanRequest ?? null;
    }

    public findCardAssignmentByUid = async (cardUid: string) => {
        const [assignment] = await this.database.select().from(cardAssignments)
            .where(eq(cardAssignments.cardUid, cardUid)).limit(1);

        return assignment ?? null;
    }

    public findAttendanceBySessionAndCard = async (sessionId: string, cardAssignmentId: string) => {
        const [attendanceRecord] = await this.database.select().from(attendance).where(
            and(
                eq(attendance.sessionId, sessionId),
                eq(attendance.cardAssignmentId, cardAssignmentId),
            )
        ).limit(1);

        return attendanceRecord ?? null;
    }

    public createAttendance = async (sessionId: string, cardAssignmentId: string, checkInAt: Date) => {
        const [result] = await this.database.insert(attendance).values({
            sessionId: sessionId,
            cardAssignmentId: cardAssignmentId,
            checkInAt: checkInAt,
        }).$returningId();
        if (!result) {
            return null;
        }

        const [attendanceRecord] = await this.database.select().from(attendance)
            .where(eq(attendance.id, result.id)).limit(1);

        return attendanceRecord ?? null;
    }

    public checkOutAttendanceById = async (attendanceId: string, checkOutAt: Date) => {
        await this.database.update(attendance).set({checkOutAt: checkOutAt}).where(eq(attendance.id, attendanceId));

        const [attendanceRecord] = await this.database.select().from(attendance)
            .where(eq(attendance.id, attendanceId)).limit(1);

        return attendanceRecord ?? null;
    }

    public createScanRequest = async (data: {
        sessionId: string;
        machineId: string;
        cardUid: string;
        idempotencyKey: string;
        outcome: ScanRequest["outcome"];
    }) => {
        const [result] = await this.database.insert(scanRequests).values(data).$returningId();
        if (!result) {
            return null;
        }

        const [scanRequest] = await this.database.select().from(scanRequests)
            .where(eq(scanRequests.id, result.id)).limit(1);

        return scanRequest ?? null;
    }
}
