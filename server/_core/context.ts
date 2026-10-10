import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { StoredUser } from "./blobAuthStore";
import { authenticateLocalRequest } from "./localAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: StoredUser | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  const user = await authenticateLocalRequest(opts.req);
  return { req: opts.req, res: opts.res, user };
}
