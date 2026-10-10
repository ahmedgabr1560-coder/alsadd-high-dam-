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
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
};

export async function loadUsers(): Promise<StoredUser[]> {
  const { list, get } = await import("@vercel/blob");
  const result = await list({ prefix: STORE_PATH, token: process.env.BLOB_READ_WRITE_TOKEN });
  const blob = result.blobs.find(item => item.pathname === STORE_PATH) ?? result.blobs[0];
  if (!blob) return [];
  const stored = await get("ofoq-auth/users.json", { access: "private", useCache: false, token: process.env.BLOB_READ_WRITE_TOKEN });
  if (!stored) return [];
  const value = await new Response(stored.stream).json();
  return Array.isArray(value) ? value : [];
}

export async function saveUsers(users: StoredUser[]) {
  const { put } = await import("@vercel/blob");
  await put(STORE_PATH, JSON.stringify(users), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: "application/json; charset=utf-8",
  });
}
