import { and, desc, eq, gte, sql } from "drizzle-orm";
import type { InsertUser, InsertVisitorEvent } from "../drizzle/schema";
import { ENV } from './_core/env';

type Database = ReturnType<(typeof import("drizzle-orm/mysql2"))["drizzle"]>;
let _db: Database | null = null;
type UsersTable = (typeof import("../drizzle/schema"))["users"];
type VisitorEventsTable = (typeof import("../drizzle/schema"))["visitorEvents"];
let usersTable: UsersTable | null = null;
let visitorEventsTable: VisitorEventsTable | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const { drizzle } = await import("drizzle-orm/mysql2");
      const schema = await import("../drizzle/schema");
      _db = drizzle(process.env.DATABASE_URL);
      usersTable = schema.users;
      visitorEventsTable = schema.visitorEvents;
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function getTables() {
  if (!usersTable || !visitorEventsTable) throw new Error("Database tables are not initialized");
  return { users: usersTable, visitorEvents: visitorEventsTable };
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "passwordHash", "profileImage", "birthDate", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId || (user.email && ENV.adminEmail && user.email.toLowerCase() === ENV.adminEmail.toLowerCase())) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(usersTable!).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select().from(usersTable!).where(eq(usersTable!.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select().from(usersTable!).where(eq(usersTable!.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function deleteUserById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(usersTable!).where(eq(usersTable!.id, id));
}

export async function createLocalUser(input: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(usersTable!).values(input);
  return getUserByEmail(String(input.email));
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(usersTable!).where(eq(usersTable!.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function insertVisitorEvent(event: InsertVisitorEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(visitorEventsTable!).values(event);
}

export async function getAdminSummary() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const countRows = await db.select({ value: sql<number>`count(*)` }).from(usersTable!);
  const registeredUsers = await db
    .select({
      id: usersTable!.id,
      name: usersTable!.name,
      email: usersTable!.email,
      role: usersTable!.role,
      loginMethod: usersTable!.loginMethod,
      createdAt: usersTable!.createdAt,
      lastSignedIn: usersTable!.lastSignedIn,
    })
    .from(usersTable!)
    .orderBy(desc(usersTable!.lastSignedIn))
    .limit(100);

  return {
    totalUsers: asNumber(countRows[0]?.value),
    registeredUsers,
  };
}

type DashboardFilters = {
  days: number;
  eventType?: "visit" | "leave";
  country?: string;
  browser?: string;
};

function buildVisitorConditions(filters: DashboardFilters) {
  const since = new Date(Date.now() - filters.days * 24 * 60 * 60 * 1000);
  const conditions = [gte(visitorEventsTable!.occurredAt, since)];
  if (filters.eventType) conditions.push(eq(visitorEventsTable!.eventType, filters.eventType));
  if (filters.country) conditions.push(eq(visitorEventsTable!.country, filters.country));
  if (filters.browser) conditions.push(eq(visitorEventsTable!.browser, filters.browser));
  return and(...conditions);
}

function asNumber(value: unknown) {
  return Number(value ?? 0);
}

export async function getVisitorDashboard(filters: DashboardFilters) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const conditions = buildVisitorConditions(filters);
  const visitsConditions = and(conditions, eq(visitorEventsTable!.eventType, "visit"));
  const totalRows = await db.select({ value: sql<number>`count(*)` }).from(visitorEventsTable!).where(conditions);
  const uniqueRows = await db.select({ value: sql<number>`count(distinct ${visitorEventsTable!.sessionId})` }).from(visitorEventsTable!).where(visitsConditions);
  const activeRows = await db
    .select({ value: sql<number>`count(distinct ${visitorEventsTable!.sessionId})` })
    .from(visitorEventsTable!)
    .where(and(eq(visitorEventsTable!.eventType, "visit"), gte(visitorEventsTable!.occurredAt, new Date(Date.now() - 15 * 60 * 1000))));
  const visitRows = await db.select({ value: sql<number>`count(*)` }).from(visitorEventsTable!).where(visitsConditions);
  const leaveRows = await db.select({ value: sql<number>`count(*)` }).from(visitorEventsTable!).where(and(conditions, eq(visitorEventsTable!.eventType, "leave")));

  const dayExpression = sql<string>`date(${visitorEventsTable!.occurredAt})`;
  const dailyRows = await db
    .select({
      day: dayExpression,
      visits: sql<number>`sum(case when ${visitorEventsTable!.eventType} = 'visit' then 1 else 0 end)`,
      leaves: sql<number>`sum(case when ${visitorEventsTable!.eventType} = 'leave' then 1 else 0 end)`,
    })
    .from(visitorEventsTable!)
    .where(conditions)
    .groupBy(dayExpression)
    .orderBy(dayExpression)
    .limit(Math.min(filters.days, 90));

  const countryRows = await db
    .select({ label: visitorEventsTable!.country, value: sql<number>`count(*)` })
    .from(visitorEventsTable!)
    .where(visitsConditions)
    .groupBy(visitorEventsTable!.country)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
  const browserRows = await db
    .select({ label: visitorEventsTable!.browser, value: sql<number>`count(*)` })
    .from(visitorEventsTable!)
    .where(visitsConditions)
    .groupBy(visitorEventsTable!.browser)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
  const operatingSystemRows = await db
    .select({ label: visitorEventsTable!.operatingSystem, value: sql<number>`count(*)` })
    .from(visitorEventsTable!)
    .where(visitsConditions)
    .groupBy(visitorEventsTable!.operatingSystem)
    .orderBy(desc(sql`count(*)`))
    .limit(8);

  const recent = await db
    .select({
      id: visitorEventsTable!.id,
      eventType: visitorEventsTable!.eventType,
      occurredAt: visitorEventsTable!.occurredAt,
      sessionId: visitorEventsTable!.sessionId,
      page: visitorEventsTable!.page,
      language: visitorEventsTable!.language,
      timezone: visitorEventsTable!.timezone,
      screen: visitorEventsTable!.screen,
      country: visitorEventsTable!.country,
      region: visitorEventsTable!.region,
      city: visitorEventsTable!.city,
      browser: visitorEventsTable!.browser,
      operatingSystem: visitorEventsTable!.operatingSystem,
    })
    .from(visitorEventsTable!)
    .where(conditions)
    .orderBy(desc(visitorEventsTable!.occurredAt))
    .limit(50);

  return {
    totalEvents: asNumber(totalRows[0]?.value),
    visits: asNumber(visitRows[0]?.value),
    leaves: asNumber(leaveRows[0]?.value),
    uniqueSessions: asNumber(uniqueRows[0]?.value),
    activeVisitors: asNumber(activeRows[0]?.value),
    daily: dailyRows.map(row => ({ day: row.day, visits: asNumber(row.visits), leaves: asNumber(row.leaves) })),
    countries: countryRows.map(row => ({ label: row.label || "غير معروف", value: asNumber(row.value) })),
    browsers: browserRows.map(row => ({ label: row.label || "غير معروف", value: asNumber(row.value) })),
    operatingSystems: operatingSystemRows.map(row => ({ label: row.label || "غير معروف", value: asNumber(row.value) })),
    recent,
  };
}
