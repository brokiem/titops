CREATE TABLE `admin_accounts` (
	`id` char(36) NOT NULL,
	`email` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`password_hash` varchar(191) NOT NULL,
	`admin_role` enum('SUPERADMIN','ADMIN') NOT NULL DEFAULT 'ADMIN',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `admin_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_accounts_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `admin_accounts_role_idx` ON `admin_accounts` (`admin_role`);