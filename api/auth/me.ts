export default async function handler(req: any, res: any) {
  try {
    const { authenticateLocalRequest } = await import("../../server/_core/localAuth");
    const user = await authenticateLocalRequest(req);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    if (!user) return res.end(JSON.stringify({ user: null }));
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return res.end(JSON.stringify({ user: safeUser }));
  } catch (error) {
    console.error("[Auth session bootstrap]", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ user: null, error: "تعذر التحقق من الجلسة مؤقتًا." }));
  }
}
