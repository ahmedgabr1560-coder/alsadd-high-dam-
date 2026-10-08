export default async function handler(req: any, res: any) {
  try {
    const { registerHandler } = await import("../../server/_core/directLocalAuth");
    return registerHandler(req, res);
  } catch (error) {
    console.error("[Auth register bootstrap]", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: false, error: "تعذر تشغيل خدمة إنشاء الحساب مؤقتًا." }));
  }
}
