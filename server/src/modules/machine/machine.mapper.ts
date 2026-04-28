import type {Machine, ScanRequest} from "../../db/schema";
import type { CreatedMachineDto, MachineDto, ScanRequestDto } from "../../contracts";

export const toMachineResponse = (machine: Machine): MachineDto => ({
    id: machine.id,
    name: machine.name,
    lastHeartbeatAt: machine.lastHeartbeatAt,
    createdAt: machine.createdAt,
    updatedAt: machine.updatedAt,
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

export const toCreatedMachineResponse = (
    machine: Machine,
    machineKey: string,
): CreatedMachineDto => ({
    ...toMachineResponse(machine),
    machineKey,
});
