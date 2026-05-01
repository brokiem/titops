import { relations, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import {
    boolean,
    char,
    datetime,
    index,
    int,
    mysqlEnum,
    mysqlTable,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

const createId = () => randomUUID();

/** Enums */
export const sessionModeEnum = mysqlEnum("session_mode", ["IDLE", "CLOCK_IN", "CLOCK_OUT", "CLOSED"]);
export const scanOutcomeEnum = mysqlEnum("scan_outcome", [
    "CHECKED_IN",
    "CHECKED_OUT",
    "ALREADY_CHECKED_IN",
    "CHECKIN_REQUIRED",
    "ALREADY_COMPLETED",
    "INVALID_CHECKOUT_TIME",
    "UNKNOWN_CARD"
]);

/** Tables */
export const sessions = mysqlTable(
    "sessions",
    {
        id: char("id", { length: 36 }).primaryKey().$defaultFn(createId),
        name: varchar("name", { length: 191 }).notNull(),
        mode: sessionModeEnum.notNull().default("IDLE"),
        startedAt: datetime("started_at", { fsp: 3 }),
        closedAt: datetime("closed_at", { fsp: 3 }),
        isActive: boolean("is_active").notNull().default(true),
        activeSingleton: int("active_singleton"),
        createdAt: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
        updatedAt: datetime("updated_at", { fsp: 3 })
            .notNull()
            .default(sql`CURRENT_TIMESTAMP(3)`)
            .$onUpdate(() => new Date())
    },
    (t) => ({
        activeSingletonUq: uniqueIndex("sessions_active_singleton_uq").on(t.activeSingleton),
        startedAtIdx: index("sessions_started_at_idx").on(t.startedAt),
        modeIdx: index("sessions_mode_idx").on(t.mode)
    })
);

export const members = mysqlTable(
    "members",
    {
        id: char("id", { length: 36 }).primaryKey().$defaultFn(createId),
        name: varchar("name", { length: 191 }).notNull(),
        nim: char("nim", { length: 10 }).notNull().unique(),
        major: varchar("major", { length: 64 }).notNull(),
        createdAt: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
        updatedAt: datetime("updated_at", { fsp: 3 })
            .notNull()
            .default(sql`CURRENT_TIMESTAMP(3)`)
            .$onUpdate(() => new Date())
    },
    (t) => ({
        nameIdx: index("members_name_idx").on(t.name)
    })
);

export const cardAssignments = mysqlTable(
    "card_assignments",
    {
        id: char("id", { length: 36 }).primaryKey().$defaultFn(createId),
        memberId: char("member_id", { length: 36 })
            .notNull()
            .references(() => members.id, { onDelete: "cascade", onUpdate: "cascade" }),
        cardUid: varchar("card_uid", { length: 20 }).notNull(),
        createdAt: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
        updatedAt: datetime("updated_at", { fsp: 3 })
            .notNull()
            .default(sql`CURRENT_TIMESTAMP(3)`)
            .$onUpdate(() => new Date())
    },
    (t) => ({
        cardUidUq: uniqueIndex("card_assignments_card_uid_uq").on(t.cardUid),
        memberIdUq: uniqueIndex("card_assignments_member_id_uq").on(t.memberId),
        memberIdx: index("card_assignments_member_id_idx").on(t.memberId),
        memberCreatedIdx: index("card_assignments_member_created_idx").on(t.memberId, t.createdAt)
    })
);

export const machines = mysqlTable(
    "machines",
    {
        id: char("id", { length: 36 }).primaryKey().$defaultFn(createId),
        name: varchar("name", { length: 191 }).notNull(),
        machineKeyDigest: char("machine_key_digest", { length: 64 }).notNull(),
        lastHeartbeatAt: datetime("last_heartbeat_at", { fsp: 3 }),
        createdAt: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
        updatedAt: datetime("updated_at", { fsp: 3 })
            .notNull()
            .default(sql`CURRENT_TIMESTAMP(3)`)
            .$onUpdate(() => new Date())
    },
    (t) => ({
        nameIdx: index("machines_name_idx").on(t.name),
    })
);

export const attendance = mysqlTable(
    "attendance",
    {
        id: char("id", { length: 36 }).primaryKey().$defaultFn(createId),
        sessionId: char("session_id", { length: 36 })
            .notNull()
            .references(() => sessions.id, { onDelete: "restrict", onUpdate: "cascade" }),
        cardAssignmentId: char("card_assignment_id", { length: 36 })
            .notNull()
            .references(() => cardAssignments.id, { onDelete: "restrict", onUpdate: "cascade" }),
        checkInAt: datetime("check_in_at", { fsp: 3 }).notNull(),
        checkOutAt: datetime("check_out_at", { fsp: 3 }),
        createdAt: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
        updatedAt: datetime("updated_at", { fsp: 3 })
            .notNull()
            .default(sql`CURRENT_TIMESTAMP(3)`)
            .$onUpdate(() => new Date())
    },
    (t) => ({
        // one check-in per card assignment per session
        sessionCardUq: uniqueIndex("attendance_session_card_assignment_uq").on(t.sessionId, t.cardAssignmentId),
        sessionCheckInIdx: index("attendance_session_check_in_idx").on(t.sessionId, t.checkInAt),
        cardAssignmentIdx: index("attendance_card_assignment_idx").on(t.cardAssignmentId)
    })
);

export const scanRequests = mysqlTable(
    "scan_requests",
    {
        id: char("id", { length: 36 }).primaryKey().$defaultFn(createId),
        sessionId: char("session_id", { length: 36 })
            .notNull()
            .references(() => sessions.id, { onDelete: "restrict", onUpdate: "cascade" }),
        machineId: char("machine_id", { length: 36 })
            .notNull()
            .references(() => machines.id, { onDelete: "restrict", onUpdate: "cascade" }),
        cardUid: varchar("card_uid", { length: 20 }).notNull(),
        idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull(),
        outcome: scanOutcomeEnum.notNull(),
        createdAt: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`)
    },
    (t) => ({
        idempotencyUq: uniqueIndex("scan_requests_session_machine_idem_uq").on(
            t.sessionId,
            t.machineId,
            t.idempotencyKey
        ),
        sessionCreatedIdx: index("scan_requests_session_created_idx").on(t.sessionId, t.createdAt),
        machineCreatedIdx: index("scan_requests_machine_created_idx").on(t.machineId, t.createdAt)
    })
);

/** Relations */
export const sessionsRelations = relations(sessions, ({ many }) => ({
    attendance: many(attendance),
    scanRequests: many(scanRequests)
}));

export const membersRelations = relations(members, ({ one }) => ({
    card: one(cardAssignments)
}));

export const cardAssignmentsRelations = relations(cardAssignments, ({ one, many }) => ({
    member: one(members, {
        fields: [cardAssignments.memberId],
        references: [members.id]
    }),
    attendance: many(attendance)
}));

export const machinesRelations = relations(machines, ({ many }) => ({
    scanRequests: many(scanRequests)
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
    session: one(sessions, {
        fields: [attendance.sessionId],
        references: [sessions.id]
    }),
    cardAssignment: one(cardAssignments, {
        fields: [attendance.cardAssignmentId],
        references: [cardAssignments.id]
    })
}));

export const scanRequestsRelations = relations(scanRequests, ({ one }) => ({
    session: one(sessions, {
        fields: [scanRequests.sessionId],
        references: [sessions.id]
    }),
    machine: one(machines, {
        fields: [scanRequests.machineId],
        references: [machines.id]
    })
}));

// SELECT types
export type Session = InferSelectModel<typeof sessions>
export type Member = InferSelectModel<typeof members>
export type CardAssignment = InferSelectModel<typeof cardAssignments>
export type Machine = InferSelectModel<typeof machines>
export type Attendance = InferSelectModel<typeof attendance>
export type ScanRequest = InferSelectModel<typeof scanRequests>
// INSERT types
export type NewSession = InferInsertModel<typeof sessions>
export type NewMember = InferInsertModel<typeof members>
export type NewCardAssignment = InferInsertModel<typeof cardAssignments>
export type NewMachine = InferInsertModel<typeof machines>
export type NewAttendance = InferInsertModel<typeof attendance>
export type NewScanRequest = InferInsertModel<typeof scanRequests>
