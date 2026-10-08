CREATE TABLE `visitor_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('visit','leave') NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`sessionId` varchar(64) NOT NULL,
	`page` varchar(255) NOT NULL DEFAULT '/',
	`referrer` varchar(512),
	`language` varchar(64),
	`timezone` varchar(128),
	`screen` varchar(32),
	`country` varchar(64),
	`region` varchar(128),
	`city` varchar(128),
	`browser` varchar(64),
	`operatingSystem` varchar(64),
	CONSTRAINT `visitor_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `visitor_events_occurred_at_idx` ON `visitor_events` (`occurredAt`);--> statement-breakpoint
CREATE INDEX `visitor_events_event_type_idx` ON `visitor_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `visitor_events_session_idx` ON `visitor_events` (`sessionId`);