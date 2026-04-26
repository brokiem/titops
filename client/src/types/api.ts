export type {
  SessionMode,
  ScanOutcome,
  ApiEnvelope,
  ApiErrorResponse,
  MachineDto,
  CreatedMachineDto,
  MemberDto,
  CardAssignmentDto,
  SessionDto,
  AttendanceDto,
  EnrichedAttendanceDto,
  ScanRequestDto,
  ScanRequestResultDto,
} from "shared";

export interface MemberCreateInput {
  name: string;
  nim: string;
  programStudi: string;
}

export interface MemberUpdateInput {
  name?: string;
  nim?: string;
}

export interface SessionCreateInput {
  name: string;
}

export interface SessionUpdateInput {
  name: string;
}

export interface ScannerCreateInput {
  name: string;
}

export interface ScannerUpdateInput {
  name: string;
}

export interface ScanRequestInput {
  cardUid: string;
  idempotencyKey: string;
}

export interface CardAssignInput {
  cardUid: string;
}
