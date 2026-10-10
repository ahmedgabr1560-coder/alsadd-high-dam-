export default function handler(_req: any, res: any) {
  res.statusCode = 200;
  res.setHeader("Set-Cookie", "alsadd_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: true }));
}
