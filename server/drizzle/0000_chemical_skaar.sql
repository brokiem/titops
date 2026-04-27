CREATE TABLE `attendance` (
	`id` char(36) NOT NULL,
	`session_id` char(36) NOT NULL,
	`card_assignment_id` char(36) NOT NULL,
	`check_in_at` datetime(3) NOT NULL,
	`check_out_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_session_card_assignment_uq` UNIQUE(`session_id`,`card_assignment_id`)
);
--> statement-breakpoint
CREATE TABLE `card_assignments` (
	`id` char(36) NOT NULL,
	`member_id` char(36) NOT NULL,
	`card_uid` varchar(20) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `card_assignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `card_assignments_card_uid_uq` UNIQUE(`card_uid`),
	CONSTRAINT `card_assignments_member_id_uq` UNIQUE(`member_id`)
);
--> statement-breakpoint
CREATE TABLE `machines` (
	`id` char(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`machine_key_digest` char(64) NOT NULL,
	`last_heartbeat_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `machines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` char(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`nim` char(10) NOT NULL,
	`major` varchar(64) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `members_id` PRIMARY KEY(`id`),
	CONSTRAINT `members_nim_unique` UNIQUE(`nim`)
);
--> statement-breakpoint
CREATE TABLE `scan_requests` (
	`id` char(36) NOT NULL,
	`session_id` char(36) NOT NULL,
	`machine_id` char(36) NOT NULL,
	`card_uid` varchar(20) NOT NULL,
	`idempotency_key` varchar(128) NOT NULL,
	`scan_outcome` enum('CHECKED_IN','CHECKED_OUT','ALREADY_CHECKED_IN','CHECKIN_REQUIRED','ALREADY_COMPLETED','INVALID_CHECKOUT_TIME','UNKNOWN_CARD') NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `scan_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `scan_requests_session_machine_idem_uq` UNIQUE(`session_id`,`machine_id`,`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` char(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`session_mode` enum('IDLE','CLOCK_IN','CLOCK_OUT','CLOSED') NOT NULL DEFAULT 'IDLE',
	`started_at` datetime(3),
	`closed_at` datetime(3),
	`is_active` boolean NOT NULL DEFAULT true,
	`active_singleton` int,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_active_singleton_uq` UNIQUE(`active_singleton`)
);
--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_card_assignment_id_card_assignments_id_fk` FOREIGN KEY (`card_assignment_id`) REFERENCES `card_assignments`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `card_assignments` ADD CONSTRAINT `card_assignments_member_id_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `scan_requests` ADD CONSTRAINT `scan_requests_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `scan_requests` ADD CONSTRAINT `scan_requests_machine_id_machines_id_fk` FOREIGN KEY (`machine_id`) REFERENCES `machines`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `attendance_session_check_in_idx` ON `attendance` (`session_id`,`check_in_at`);--> statement-breakpoint
CREATE INDEX `attendance_card_assignment_idx` ON `attendance` (`card_assignment_id`);--> statement-breakpoint
CREATE INDEX `card_assignments_member_id_idx` ON `card_assignments` (`member_id`);--> statement-breakpoint
CREATE INDEX `card_assignments_member_created_idx` ON `card_assignments` (`member_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `machines_name_idx` ON `machines` (`name`);--> statement-breakpoint
CREATE INDEX `members_name_idx` ON `members` (`name`);--> statement-breakpoint
CREATE INDEX `scan_requests_session_created_idx` ON `scan_requests` (`session_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `scan_requests_machine_created_idx` ON `scan_requests` (`machine_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `sessions_started_at_idx` ON `sessions` (`started_at`);--> statement-breakpoint
CREATE INDEX `sessions_mode_idx` ON `sessions` (`session_mode`);