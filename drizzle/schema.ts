import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const visitorEvents = mysqlTable(
  "visitor_events",
  {
    id: int("id").autoincrement().primaryKey(),
    eventType: mysqlEnum("eventType", ["visit", "leave"]).notNull(),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    page: varchar("page", { length: 255 }).notNull().default("/"),
    referrer: varchar("referrer", { length: 512 }),
    language: varchar("language", { length: 64 }),
    timezone: varchar("timezone", { length: 128 }),
    screen: varchar("screen", { length: 32 }),
    country: varchar("country", { length: 64 }),
    region: varchar("region", { length: 128 }),
    city: varchar("city", { length: 128 }),
    browser: varchar("browser", { length: 64 }),
    operatingSystem: varchar("operatingSystem", { length: 64 }),
  },
  table => ({
    occurredAtIdx: index("visitor_events_occurred_at_idx").on(table.occurredAt),
    eventTypeIdx: index("visitor_events_event_type_idx").on(table.eventType),
    sessionIdx: index("visitor_events_session_idx").on(table.sessionId),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type VisitorEvent = typeof visitorEvents.$inferSelect;
export type InsertVisitorEvent = typeof visitorEvents.$inferInsert;
