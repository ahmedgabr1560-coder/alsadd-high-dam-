export default async function handler(req: any, res: any) {
  try {
    const { logoutHandler } = await import("../../server/_core/directLocalAuth");
    return logoutHandler(req, res);
  } catch (error) {
    console.error("[Auth logout bootstrap]", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: false, error: "تعذر تسجيل الخروج مؤقتًا." }));
  }
}
