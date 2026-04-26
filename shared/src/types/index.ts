export type SessionMode = "IDLE" | "CLOCK_IN" | "CLOCK_OUT" | "CLOSED";

export type ScanOutcome =
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "ALREADY_CHECKED_IN"
  | "CHECKIN_REQUIRED"
  | "ALREADY_COMPLETED"
  | "INVALID_CHECKOUT_TIME"
  | "UNKNOWN_CARD";

export type ApiEnvelope<T> = {
  data: T;
};

export type ApiErrorResponse = {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type MachineDto = {
  id: string;
  name: string;
  lastHeartbeatAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatedMachineDto = MachineDto & {
  machineKey: string;
};

export type MemberDto = {
  id: string;
  name: string;
  nim: string;
  programStudi: string;
  cardUid?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CardAssignmentDto = {
  id: string;
  memberId: string;
  cardUid: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionDto = {
  id: string;
  name: string;
  mode: SessionMode;
  startedAt: Date | null;
  closedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AttendanceDto = {
  id: string;
  sessionId: string;
  cardAssignmentId: string;
  checkInAt: Date;
  checkOutAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EnrichedAttendanceDto = {
  id: string;
  sessionId: string;
  cardAssignmentId: string;
  memberName: string;
  cardUid: string;
  checkInAt: Date;
  checkOutAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ScanRequestDto = {
  id: string;
  sessionId: string;
  machineId: string;
  cardUid: string;
  idempotencyKey: string;
  outcome: ScanOutcome;
  createdAt: Date;
};

export type ScanRequestResultDto = ScanRequestDto & {
  replayed: boolean;
};
