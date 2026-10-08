import { authenticateLocalRequest } from "../../server/_core/localAuth";

export default async function handler(req: any, res: any) {
  try {
    const user = await authenticateLocalRequest(req);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    if (!user) return res.end(JSON.stringify({ user: null }));
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return res.end(JSON.stringify({ user: safeUser }));
  } catch {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ user: null, error: "تعذر التحقق من الجلسة مؤقتًا." }));
  }
}
