import dashboardHandler from "../trpc/[...path]";

export default async function handler(req: any, res: any) {
  const originalUrl = req.url;
  const query = originalUrl?.includes("?") ? originalUrl.slice(originalUrl.indexOf("?")) : "";
  req.url = `/api/trpc/admin-dashboard${query}`;
  try {
    return await dashboardHandler(req, res);
  } finally {
    req.url = originalUrl;
  }
}
