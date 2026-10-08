export default async function handler(req: any, res: any) {
  try {
    const { loginHandler } = await import("../../server/_core/directLocalAuth");
    return loginHandler(req, res);
  } catch (error) {
    console.error("[Auth login bootstrap]", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: false, error: "تعذر تشغيل خدمة تسجيل الدخول مؤقتًا." }));
  }
}
