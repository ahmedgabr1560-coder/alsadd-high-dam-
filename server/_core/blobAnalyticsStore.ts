import type { StoredUser } from "./blobAuthStore";
import { loadUsers } from "./blobAuthStore";

const STORE_PATH = "ofoq-analytics/events.json";

export type StoredVisitorEvent = {
  id: number;
  eventType: "visit" | "leave";
  occurredAt: string;
  sessionId: string;
  page: string;
  referrer: string | null;
  language: string | null;
  timezone: string | null;
  screen: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  browser: string | null;
  operatingSystem: string | null;
};

async function loadEvents(): Promise<StoredVisitorEvent[]> {
  const { list, get } = await import("@vercel/blob");
  const result = await list({ prefix: STORE_PATH });
  const blob = result.blobs.find(item => item.pathname === STORE_PATH) ?? result.blobs[0];
  if (!blob) return [];
  const stored = await get(STORE_PATH, { access: "private", useCache: false });
  if (!stored) return [];
  const value = await new Response(stored.stream).json();
  return Array.isArray(value) ? value : [];
}

async function saveEvents(events: StoredVisitorEvent[]) {
  const { put } = await import("@vercel/blob");
  await put(STORE_PATH, JSON.stringify(events), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  });
}

export async function insertBlobVisitorEvent(event: Omit<StoredVisitorEvent, "id" | "occurredAt"> & { occurredAt?: string }) {
  const events = await loadEvents();
  const nextId = events.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  await saveEvents([
    ...events,
    { ...event, id: nextId, occurredAt: event.occurredAt ?? new Date().toISOString() },
  ].slice(-10000));
}

function asNumber(value: unknown) {
  return Number(value ?? 0);
}

type DashboardFilters = {
  days: number;
  eventType?: "visit" | "leave";
  country?: string;
  browser?: string;
};

function matches(event: StoredVisitorEvent, filters: DashboardFilters, since: number) {
  return new Date(event.occurredAt).getTime() >= since
    && (!filters.eventType || event.eventType === filters.eventType)
    && (!filters.country || event.country === filters.country)
    && (!filters.browser || event.browser === filters.browser);
}

function distribution(events: StoredVisitorEvent[], field: keyof StoredVisitorEvent, limit = 8) {
  const counts = new Map<string, number>();
  for (const event of events) {
    const value = String(event[field] || "غير معروف");
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

export async function getBlobAdminSummary() {
  const users = await loadUsers();
  return {
    totalUsers: users.length,
    registeredUsers: users
      .map(({ passwordHash: _passwordHash, ...user }: StoredUser) => user)
      .sort((a, b) => new Date(b.lastSignedIn).getTime() - new Date(a.lastSignedIn).getTime())
      .slice(0, 100),
  };
}

export async function getBlobVisitorDashboard(filters: DashboardFilters) {
  const allEvents = await loadEvents();
  const since = Date.now() - filters.days * 24 * 60 * 60 * 1000;
  const events = allEvents.filter(event => matches(event, filters, since));
  const visits = events.filter(event => event.eventType === "visit");
  const leaves = events.filter(event => event.eventType === "leave");
  const activeSince = Date.now() - 15 * 60 * 1000;
  const activeVisitors = new Set(allEvents.filter(event => event.eventType === "visit" && new Date(event.occurredAt).getTime() >= activeSince).map(event => event.sessionId)).size;
  const byDay = new Map<string, { visits: number; leaves: number }>();
  for (const event of events) {
    const day = event.occurredAt.slice(0, 10);
    const item = byDay.get(day) ?? { visits: 0, leaves: 0 };
    if (event.eventType === "visit") item.visits += 1; else item.leaves += 1;
    byDay.set(day, item);
  }
  return {
    totalEvents: events.length,
    visits: visits.length,
    leaves: leaves.length,
    uniqueSessions: new Set(visits.map(event => event.sessionId)).size,
    activeVisitors,
    daily: [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-Math.min(filters.days, 90)).map(([day, value]) => ({ day, visits: asNumber(value.visits), leaves: asNumber(value.leaves) })),
    countries: distribution(visits, "country"),
    browsers: distribution(visits, "browser"),
    operatingSystems: distribution(visits, "operatingSystem"),
    recent: [...events].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()).slice(0, 50),
  };
}
