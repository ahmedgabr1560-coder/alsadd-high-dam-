import { readTelegramSession } from "./auth";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });
  const user = readTelegramSession(req);
  return res.status(200).json({ ok: true, authenticated: Boolean(user), user: user || null });
}
