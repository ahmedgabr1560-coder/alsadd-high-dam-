const STORE_PATH = "ofoq-auth/users.json";

export type StoredUser = {
  id: number;
  openId: string;
  name: string;
  email: string;
  passwordHash: string;
  profileImage: string;
  birthDate: string;
  loginMethod: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
};

export async function loadUsers(): Promise<StoredUser[]> {
  const { list } = await import("@vercel/blob");
  const result = await list({ prefix: STORE_PATH });
  const blob = result.blobs.find(item => item.pathname === STORE_PATH) ?? result.blobs[0];
  if (!blob) return [];
  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Blob read failed: ${response.status}`);
  const value = await response.json();
  return Array.isArray(value) ? value : [];
}

export async function saveUsers(users: StoredUser[]) {
  const { put } = await import("@vercel/blob");
  await put(STORE_PATH, JSON.stringify(users), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  });
}
