import { authenticateLocalRequest } from "../../server/_core/localAuth";

export default async function handler(req: any, res: any) {
  const user = await authenticateLocalRequest(req);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!user) return res.end(JSON.stringify({ user: null }));
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return res.end(JSON.stringify({ user: safeUser }));
}
