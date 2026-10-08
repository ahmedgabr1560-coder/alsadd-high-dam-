import express from "express";
import { authenticateLocalRequest, registerLocalAuthRoutes } from "./localAuth";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use((req, _res, next) => {
  if (req.url.startsWith("/api/")) req.url = req.url.slice(4) || "/";
  next();
});

registerLocalAuthRoutes(app, "");
app.get("/auth/me", async (req, res) => {
  const user = await authenticateLocalRequest(req);
  if (!user) return res.json({ user: null });
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return res.json({ user: safeUser });
});

export default app;
