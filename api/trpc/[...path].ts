// Vercel does not consistently route nested tRPC calls through the root catch-all
// in this project. Reuse the same Express handler through an explicit tRPC catch-all.
import app from "../[...path]";

export default app;
