import type {Attendance, Session, ScanRequest} from "@server/db/schema";
import type {AttendanceDto, EnrichedAttendanceDto, ScanRequestDto, SessionDto} from "../../contracts";

export const toSessionResponse = (session: Session): SessionDto => ({
    id: session.id,
    name: session.name,
    mode: session.mode,
    startedAt: session.startedAt,
    closedAt: session.closedAt,
    isActive: session.isActive,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
});

export const toAttendanceResponse = (attendance: Attendance): AttendanceDto => ({
    id: attendance.id,
    sessionId: attendance.sessionId,
    cardAssignmentId: attendance.cardAssignmentId,
    checkInAt: attendance.checkInAt,
    checkOutAt: attendance.checkOutAt,
    createdAt: attendance.createdAt,
    updatedAt: attendance.updatedAt,
});

export const toEnrichedAttendanceResponse = (row: {
    id: string;
    sessionId: string;
    cardAssignmentId: string;
    memberName: string;
    memberNim: string;
    memberMajor: string;
    cardUid: string;
    checkInAt: Date;
    checkOutAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}): EnrichedAttendanceDto => ({
    id: row.id,
    sessionId: row.sessionId,
    cardAssignmentId: row.cardAssignmentId,
    memberName: row.memberName,
    memberNim: row.memberNim,
    memberMajor: row.memberMajor,
    cardUid: row.cardUid,
    checkInAt: row.checkInAt,
    checkOutAt: row.checkOutAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
});

export const toScanRequestResponse = (scanRequest: ScanRequest): ScanRequestDto => ({
    id: scanRequest.id,
    sessionId: scanRequest.sessionId,
    machineId: scanRequest.machineId,
    cardUid: scanRequest.cardUid,
    idempotencyKey: scanRequest.idempotencyKey,
    outcome: scanRequest.outcome,
    createdAt: scanRequest.createdAt,
});
