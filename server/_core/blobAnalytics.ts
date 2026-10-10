import { get, list, put } from "@vercel/blob";

export type StoredVisitorEvent = {
  id: number;
  eventType: "visit" | "leave";
  occurredAt: string;
  sessionId: string;
  page: string;
  referrer?: string | null;
  language?: string | null;
  timezone?: string | null;
  screen?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
};

const eventsPath = "ofoq-analytics/events.json";
const usersPath = "ofoq-auth/users.json";

async function readJson(path: string, fallback: unknown) {
  const result = await list({ prefix: path });
  if (!result.blobs.some(item => item.pathname === path)) return fallback;
  const stored = await get(path, { access: "private", useCache: false });
  if (!stored) return fallback;
  return new Response(stored.stream).json();
}

export async function loadBlobEvents(): Promise<StoredVisitorEvent[]> {
  const value = await readJson(eventsPath, []);
  return Array.isArray(value) ? value : [];
}

export async function appendBlobEvent(event: Omit<StoredVisitorEvent, "id">) {
  const events = await loadBlobEvents();
  const nextId = events.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  await put(eventsPath, JSON.stringify([...events.slice(-4999), { ...event, id: nextId }]), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json; charset=utf-8" });
}

export async function loadBlobUsers() {
  const value = await readJson(usersPath, []);
  return Array.isArray(value) ? value : [];
}
