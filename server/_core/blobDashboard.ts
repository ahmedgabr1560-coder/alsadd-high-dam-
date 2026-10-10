import { loadBlobEvents, type StoredVisitorEvent } from "./blobAnalytics";

type Filters = { days: number; eventType?: "visit" | "leave"; country?: string; browser?: string };
const number = (value: unknown) => Number(value || 0);
const list = (events: StoredVisitorEvent[], key: keyof StoredVisitorEvent) => {
  const counts = new Map<string, number>();
  for (const event of events) { const label = String(event[key] || "غير معروف"); counts.set(label, (counts.get(label) || 0) + 1); }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));
};

export async function getBlobVisitorDashboard(filters: Filters) {
  const since = Date.now() - filters.days * 24 * 60 * 60 * 1000;
  const events = (await loadBlobEvents()).filter(event => {
    if (new Date(event.occurredAt).getTime() < since) return false;
    if (filters.eventType && event.eventType !== filters.eventType) return false;
    if (filters.country && event.country !== filters.country) return false;
    if (filters.browser && event.browser !== filters.browser) return false;
    return true;
  });
  const visits = events.filter(event => event.eventType === "visit");
  const leaves = events.filter(event => event.eventType === "leave");
  const dailyMap = new Map<string, { visits: number; leaves: number }>();
  for (const event of events) { const day = event.occurredAt.slice(0, 10); const row = dailyMap.get(day) || { visits: 0, leaves: 0 }; event.eventType === "visit" ? row.visits++ : row.leaves++; dailyMap.set(day, row); }
  const activeSince = Date.now() - 15 * 60 * 1000;
  const active = new Set((await loadBlobEvents()).filter(event => event.eventType === "visit" && new Date(event.occurredAt).getTime() >= activeSince).map(event => event.sessionId));
  return {
    totalEvents: events.length,
    visits: visits.length,
    leaves: leaves.length,
    uniqueSessions: new Set(visits.map(event => event.sessionId)).size,
    activeVisitors: active.size,
    daily: [...dailyMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-Math.min(filters.days, 90)).map(([day, value]) => ({ day, visits: number(value.visits), leaves: number(value.leaves) })),
    countries: list(visits, "country"),
    browsers: list(visits, "browser"),
    operatingSystems: list(visits, "operatingSystem"),
    recent: events.slice().sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()).slice(0, 50),
  };
}
