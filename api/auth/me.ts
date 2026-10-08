import { authenticateLocalRequest } from "../../server/_core/localAuth";

export default async function handler(req: any, res: any) {
  const user = await authenticateLocalRequest(req);
  if (!user) return res.status(200).json({ user: null });
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return res.status(200).json({ user: safeUser });
}
