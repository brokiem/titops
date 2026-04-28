import {MachineRepository} from "./machine.repository";
import {ConflictError, NotFoundError, UnauthorizedError} from "../../lib/errors";
import {createHmac, randomBytes} from "node:crypto";
import {toCreatedMachineResponse} from "./machine.mapper";
import type {ScanRequest} from "../../db/schema";
import type {UpdateMachineInput} from "./machine.schema";
import {normalizeCardUid} from "../../utils/util";

export class MachineService {
    constructor(
        private machineRespository: MachineRepository,
        private options: { machineKeySecret: string },
    ) {}

    public getAll = async () => {
        return this.machineRespository.findAll();
    }

    public getById = async (id: string) => {
        const machine = await this.machineRespository.findById(id);
        if (!machine) {
            throw new NotFoundError('Machine not found');
        }

        return machine;
    }

    public create = async (name: string) => {
        const machineKey = `mk_${randomBytes(32).toString('hex')}`;

        const digest = this.hashMachineKey(machineKey);

        const result = await this.machineRespository.create(name, digest);
        if (!result) {
            throw new ConflictError('Failed to create machine');
        }

        return toCreatedMachineResponse(result, machineKey);
    }

    public updateById = async (id: string, data: UpdateMachineInput) => {
        const machine = await this.machineRespository.updateById(id, data);
        if (!machine) {
            throw new NotFoundError('Machine not found');
        }

        return machine;
    }

    public deleteById = async (id: string) => {
        const machine = await this.machineRespository.deleteById(id);
        if (!machine) {
            throw new NotFoundError('Machine not found');
        }

        return machine;
    }

    private async validateMachineKey(id: string, machineKey: string) {
        const machine = await this.getById(id);

        const digest = this.hashMachineKey(machineKey);

        if (machine.machineKeyDigest !== digest) {
            throw new UnauthorizedError('Invalid machine key');
        }

        return machine;
    }

    private hashMachineKey(machineKey: string) {
        return createHmac("sha256", this.options.machineKeySecret).update(machineKey).digest("hex");
    }

    public sendHeartbeat = async (id: string, machineKey: string) => {
        await this.validateMachineKey(id, machineKey);

        const machine = await this.machineRespository.touchHeartbeatById(id, new Date());
        if (!machine) {
            throw new NotFoundError('Machine not found');
        }

        return machine;
    }

    public sendScanRequest = async (machineId: string, machineKey: string, cardUidHex: string, idempotencyKey: string) => {
        await this.validateMachineKey(machineId, machineKey);

        return this.machineRespository.transaction(async (repository) => {
            const activeSession = await repository.findActiveSession();
            if (!activeSession) {
                throw new ConflictError('No active session found');
            }

            const existingScan = await repository.findScanRequestByIdempotency(
                activeSession.id,
                machineId,
                idempotencyKey,
            );

            if (existingScan) {
                return {
                    scanRequest: existingScan,
                    replayed: true,
                };
            }

            const now = new Date();
            const cardUidNormalized = normalizeCardUid(cardUidHex);
            const assignment = await repository.findCardAssignmentByUid(cardUidNormalized);

            let outcome: ScanRequest["outcome"] = 'UNKNOWN_CARD';

            if (assignment) {
                let attendance = await repository.findAttendanceBySessionAndCard(activeSession.id, assignment.id);

                if (activeSession.mode === 'CLOCK_IN') {
                    if (!attendance) {
                        try {
                            attendance = await repository.createAttendance(activeSession.id, assignment.id, now);
                            outcome = 'CHECKED_IN';
                        } catch (error) {
                            const dbError = error as { code?: string };
                            if (dbError.code !== 'ER_DUP_ENTRY') {
                                throw error;
                            }

                            attendance = await repository.findAttendanceBySessionAndCard(activeSession.id, assignment.id);
                            outcome = attendance?.checkOutAt ? 'ALREADY_COMPLETED' : 'ALREADY_CHECKED_IN';
                        }
                    } else if (attendance.checkOutAt) {
                        outcome = 'ALREADY_COMPLETED';
                    } else {
                        outcome = 'ALREADY_CHECKED_IN';
                    }
                } else if (activeSession.mode === 'CLOCK_OUT') {
                    if (!attendance) {
                        outcome = 'CHECKIN_REQUIRED';
                    } else if (attendance.checkOutAt) {
                        outcome = 'ALREADY_COMPLETED';
                    } else {
                        await repository.checkOutAttendanceById(attendance.id, now);
                        outcome = 'CHECKED_OUT';
                    }
                } else {
                    outcome = 'CHECKIN_REQUIRED';
                }
            }

            let scanRequest;
            try {
                scanRequest = await repository.createScanRequest({
                    sessionId: activeSession.id,
                    machineId: machineId,
                    cardUid: cardUidNormalized,
                    idempotencyKey: idempotencyKey,
                    outcome: outcome,
                });
            } catch (error) {
                const dbError = error as { code?: string };
                if (dbError.code === 'ER_DUP_ENTRY') {
                    const duplicated = await repository.findScanRequestByIdempotency(
                        activeSession.id,
                        machineId,
                        idempotencyKey,
                    );

                    if (duplicated) {
                        return {
                            scanRequest: duplicated,
                            replayed: true,
                        };
                    }
                }

                throw error;
            }

            if (!scanRequest) {
                throw new ConflictError('Failed to create scan request');
            }

            return {
                scanRequest: scanRequest,
                replayed: false,
            };
        });
    }
}
