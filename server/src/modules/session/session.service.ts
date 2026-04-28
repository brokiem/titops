import {SessionRepository} from "./session.repository";
import {BadRequestError, ConflictError, NotFoundError} from "../../lib/errors";
import type {Session, ScanRequest} from "../../db/schema";
import type {UpdateSessionInput} from "./session.schema";

export class SessionService {
    constructor(private repository: SessionRepository) {
    }

    public getAll = async () => {
        return this.repository.findAll();
    }

    public getById = async (id: string) => {
        const session = await this.repository.findById(id);
        if (!session) {
            throw new NotFoundError('Session not found');
        }

        return session;
    }

    public create = async (name: string) => {
        const activeSession = await this.repository.findActive();
        if (activeSession) {
            throw new ConflictError('Active session already exists');
        }

        const session = await this.repository.create(name);
        if (!session) {
            throw new ConflictError('Failed to create session');
        }

        return session;
    }

    public updateById = async (id: string, data: UpdateSessionInput) => {
        const session = await this.repository.updateById(id, data);
        if (!session) {
            throw new NotFoundError('Session not found');
        }

        return session;
    }

    public updateModeById = async (id: string, mode: Session["mode"]) => {
        const session = await this.repository.findById(id);
        if (!session) {
            throw new NotFoundError('Session not found');
        }

        if (!session.isActive || session.mode === 'CLOSED') {
            throw new ConflictError('Cannot update mode of a closed session');
        }

        if (mode === 'CLOSED') {
            throw new BadRequestError('Use close session endpoint to close session');
        }

        const startedAt = mode === 'CLOCK_IN' && !session.startedAt ? new Date() : session.startedAt ?? undefined;
        const updatedSession = await this.repository.updateModeById(id, {mode, startedAt});

        if (!updatedSession) {
            throw new NotFoundError('Session not found');
        }

        return updatedSession;
    }

    public closeById = async (id: string) => {
        const session = await this.repository.findById(id);
        if (!session) {
            throw new NotFoundError('Session not found');
        }

        if (!session.isActive || session.mode === 'CLOSED') {
            throw new ConflictError('Session already closed');
        }

        const closedSession = await this.repository.closeById(id, new Date());
        if (!closedSession) {
            throw new NotFoundError('Session not found');
        }

        return closedSession;
    }

    public listAttendance = async (sessionId: string) => {
        await this.getById(sessionId);
        return this.repository.findAttendanceBySessionId(sessionId);
    }

    public listEnrichedAttendance = async (sessionId: string) => {
        await this.getById(sessionId);
        return this.repository.findEnrichedAttendanceBySessionId(sessionId);
    }

    public listScanRequests = async (sessionId: string, outcome?: ScanRequest["outcome"]) => {
        await this.getById(sessionId);
        return this.repository.findScanRequestsBySessionId(sessionId, outcome);
    }

    public findAttendanceById = async (sessionId: string, attendanceId: string) => {
        await this.getById(sessionId);

        const attendance = await this.repository.findAttendanceById(sessionId, attendanceId);
        if (!attendance) {
            throw new NotFoundError('Attendance not found');
        }

        return attendance;
    }

    public deleteAttendanceById = async (sessionId: string, attendanceId: string) => {
        await this.getById(sessionId);

        const attendance = await this.repository.deleteAttendanceById(sessionId, attendanceId);
        if (!attendance) {
            throw new NotFoundError('Attendance not found');
        }

        return attendance;
    }

    public deleteById = async (id: string) => {
        const session = await this.repository.deleteById(id);
        if (!session) {
            throw new NotFoundError('Session not found');
        }

        return session;
    }
}
