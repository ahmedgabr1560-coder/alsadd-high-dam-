import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertVisitorEvent, users, visitorEvents } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
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

    const textFields = ["name", "email", "loginMethod"] as const;
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function insertVisitorEvent(event: InsertVisitorEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(visitorEvents).values(event);
}

export async function getAdminSummary() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const countRows = await db.select({ value: sql<number>`count(*)` }).from(users);
  const registeredUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      loginMethod: users.loginMethod,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .orderBy(desc(users.lastSignedIn))
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
  const conditions = [gte(visitorEvents.occurredAt, since)];
  if (filters.eventType) conditions.push(eq(visitorEvents.eventType, filters.eventType));
  if (filters.country) conditions.push(eq(visitorEvents.country, filters.country));
  if (filters.browser) conditions.push(eq(visitorEvents.browser, filters.browser));
  return and(...conditions);
}

function asNumber(value: unknown) {
  return Number(value ?? 0);
}

export async function getVisitorDashboard(filters: DashboardFilters) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const conditions = buildVisitorConditions(filters);
  const visitsConditions = and(conditions, eq(visitorEvents.eventType, "visit"));
  const totalRows = await db.select({ value: sql<number>`count(*)` }).from(visitorEvents).where(conditions);
  const uniqueRows = await db.select({ value: sql<number>`count(distinct ${visitorEvents.sessionId})` }).from(visitorEvents).where(visitsConditions);
  const activeRows = await db
    .select({ value: sql<number>`count(distinct ${visitorEvents.sessionId})` })
    .from(visitorEvents)
    .where(and(eq(visitorEvents.eventType, "visit"), gte(visitorEvents.occurredAt, new Date(Date.now() - 15 * 60 * 1000))));
  const visitRows = await db.select({ value: sql<number>`count(*)` }).from(visitorEvents).where(visitsConditions);
  const leaveRows = await db.select({ value: sql<number>`count(*)` }).from(visitorEvents).where(and(conditions, eq(visitorEvents.eventType, "leave")));

  const dayExpression = sql<string>`date(${visitorEvents.occurredAt})`;
  const dailyRows = await db
    .select({
      day: dayExpression,
      visits: sql<number>`sum(case when ${visitorEvents.eventType} = 'visit' then 1 else 0 end)`,
      leaves: sql<number>`sum(case when ${visitorEvents.eventType} = 'leave' then 1 else 0 end)`,
    })
    .from(visitorEvents)
    .where(conditions)
    .groupBy(dayExpression)
    .orderBy(dayExpression)
    .limit(Math.min(filters.days, 90));

  const countryRows = await db
    .select({ label: visitorEvents.country, value: sql<number>`count(*)` })
    .from(visitorEvents)
    .where(visitsConditions)
    .groupBy(visitorEvents.country)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
  const browserRows = await db
    .select({ label: visitorEvents.browser, value: sql<number>`count(*)` })
    .from(visitorEvents)
    .where(visitsConditions)
    .groupBy(visitorEvents.browser)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
  const operatingSystemRows = await db
    .select({ label: visitorEvents.operatingSystem, value: sql<number>`count(*)` })
    .from(visitorEvents)
    .where(visitsConditions)
    .groupBy(visitorEvents.operatingSystem)
    .orderBy(desc(sql`count(*)`))
    .limit(8);

  const recent = await db
    .select({
      id: visitorEvents.id,
      eventType: visitorEvents.eventType,
      occurredAt: visitorEvents.occurredAt,
      sessionId: visitorEvents.sessionId,
      page: visitorEvents.page,
      language: visitorEvents.language,
      timezone: visitorEvents.timezone,
      screen: visitorEvents.screen,
      country: visitorEvents.country,
      region: visitorEvents.region,
      city: visitorEvents.city,
      browser: visitorEvents.browser,
      operatingSystem: visitorEvents.operatingSystem,
    })
    .from(visitorEvents)
    .where(conditions)
    .orderBy(desc(visitorEvents.occurredAt))
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
