async function loadUsers() {
  const { list } = await import("@vercel/blob");
  const result = await list({ prefix: "ofoq-auth/users.json" });
  const blob = result.blobs.find((item: any) => item.pathname === "ofoq-auth/users.json") ?? result.blobs[0];
  if (!blob) return [];
  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Blob read failed: ${response.status}`);
  const value = await response.json();
  return Array.isArray(value) ? value : [];
}
export default async function handler(req: any, res: any) {
  const reply = (body: unknown) => { res.statusCode = 200; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(body)); };
  try {
    const crypto = await import("node:crypto");
    const raw = String(req.headers?.cookie || "").split(";").map((item: string) => item.trim()).find((item: string) => item.startsWith("alsadd_session="))?.slice("alsadd_session=".length);
    if (!raw) return reply({ user: null });
    const token = decodeURIComponent(raw);
    const dot = token.lastIndexOf(".");
    if (dot < 1) return reply({ user: null });
    const encoded = token.slice(0, dot);
    const signature = token.slice(dot + 1);
    const expected = crypto.createHmac("sha256", process.env.AUTH_SECRET || "alsadd-local-auth-development-only").update(encoded).digest("base64url");
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return reply({ user: null });
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!session.userId || Number(session.exp) < Date.now()) return reply({ user: null });
    const user = (await loadUsers()).find(item => item.id === Number(session.userId));
    if (!user) return reply({ user: null });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return reply({ user: safeUser });
  } catch (error) {
    console.error("[session]", error);
    return reply({ user: null });
  }
}
