import express from "express";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { registerLocalAuthRoutes } from "../server/_core/localAuth";
import visitHandler from "./analytics/visit";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Vercel passes the catch-all function path through to the handler. Normalize it
// so the same route table works locally and in production.
app.use((req, _res, next) => {
  if (req.url.startsWith("/api/")) req.url = req.url.slice(4) || "/";
  next();
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.post("/analytics/visit", visitHandler);
registerLocalAuthRoutes(app);
app.use(
  "/trpc",
  createHTTPHandler({
    router: appRouter,
    createContext: ({ req, res }) => createContext({ req, res } as any),
  }),
);

export default app;
