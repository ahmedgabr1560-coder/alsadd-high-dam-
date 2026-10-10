import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpLeft,
  CalendarDays,
  ChevronDown,
  Clock3,
  Globe2,
  Laptop2,
  LogIn,
  LogOut,
  Monitor,
  RefreshCw,
  Smartphone,
  Send,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const colors = ["#18b6a4", "#d8aa61", "#176b82", "#d9774a", "#6c7c8c", "#8e6b9d"];

type EventFilter = "" | "visit" | "leave";
type DashboardItem = { label: string; value: number };
type DashboardEvent = { id: number; eventType: "visit" | "leave"; occurredAt: string; city?: string | null; region?: string | null; country?: string | null; timezone?: string | null; browser?: string | null; operatingSystem?: string | null; screen?: string | null; page: string; sessionId: string };
type DashboardData = { totalEvents: number; visits: number; leaves: number; uniqueSessions: number; activeVisitors: number; daily: Array<{ day: string; visits: number; leaves: number }>; countries: DashboardItem[]; browsers: DashboardItem[]; operatingSystems: DashboardItem[]; recent: DashboardEvent[] };
type RegisteredUser = { id: number; name?: string | null; email?: string | null; loginMethod?: string | null; role?: string | null; createdAt: string; lastSignedIn: string };

function formatNumber(value: number) {
  return new Intl.NumberFormat("ar-EG").format(value);
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function StatCard({ icon: Icon, label, value, note, tone = "teal" }: { icon: typeof Users; label: string; value: number; note: string; tone?: "teal" | "gold" | "clay" | "ink" }) {
  return (
    <article className={`dashboard-stat dashboard-stat-${tone}`}>
      <div className="dashboard-stat-icon"><Icon size={19} /></div>
      <p>{label}</p>
      <strong>{formatNumber(value)}</strong>
      <small>{note}</small>
    </article>
  );
}

function DistributionList({ title, icon: Icon, items }: { title: string; icon: typeof Globe2; items: Array<{ label: string; value: number }> }) {
  const max = Math.max(...items.map(item => item.value), 1);
  return (
    <section className="dashboard-panel dashboard-distribution">
      <div className="dashboard-panel-heading">
        <div><span className="dashboard-kicker"><Icon size={15} /> تحليل</span><h2>{title}</h2></div>
        <span className="dashboard-panel-mark">{formatNumber(items.reduce((sum, item) => sum + item.value, 0))}</span>
      </div>
      {items.length === 0 ? <p className="dashboard-empty">لا توجد بيانات كافية بعد.</p> : (
        <div className="distribution-list">
          {items.map((item, index) => (
            <div className="distribution-row" key={`${item.label}-${index}`}>
              <div className="distribution-meta"><span>{item.label}</span><strong>{formatNumber(item.value)}</strong></div>
              <div className="distribution-track"><span style={{ width: `${Math.max(8, (item.value / max) * 100)}%`, background: colors[index % colors.length] }} /></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DashboardContent() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [days, setDays] = useState(30);
  const [eventType, setEventType] = useState<EventFilter>("");
  const [country, setCountry] = useState("");
  const [browser, setBrowser] = useState("");
  const [syncingUsers, setSyncingUsers] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardError, setDashboardError] = useState<{ code?: string; message?: string } | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const syncUsersToTelegram = async () => {
    setSyncingUsers(true);
    setSyncMessage("");
    try {
      const response = await fetch("/api/auth/notify-users", { method: "POST", headers: { "content-type": "application/json" } });
      const result = await response.json();
      setSyncMessage(result.ok ? `تم إرسال ${result.sent} حساب إلى البوت.` : (result.error || "تعذر الإرسال."));
    } catch { setSyncMessage("تعذر الاتصال بمسار المزامنة."); }
    finally { setSyncingUsers(false); }
  };

  const queryInput = useMemo(() => ({
    days,
    eventType: eventType || undefined,
    country: country || undefined,
    browser: browser || undefined,
  }), [browser, country, days, eventType]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const load = async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      const params = new URLSearchParams({ days: String(queryInput.days) });
      if (queryInput.eventType) params.set("eventType", queryInput.eventType);
      if (queryInput.country) params.set("country", queryInput.country);
      if (queryInput.browser) params.set("browser", queryInput.browser);
      try {
        const response = await fetch(`/api/trpc/admin-dashboard?${params.toString()}`, { credentials: "include", cache: "no-store" });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw Object.assign(new Error(result.error || "تعذر تحميل لوحة المدير."), { code: result.code });
        if (!cancelled) setDashboardData(result);
      } catch (error) {
        if (!cancelled) setDashboardError({ code: (error as { code?: string }).code, message: error instanceof Error ? error.message : "تعذر تحميل لوحة المدير." });
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    };
    load();
    const timer = window.setInterval(load, 60_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [isAuthenticated, queryInput, refreshKey]);

  const data = dashboardData?.dashboard as DashboardData | null;
  const registeredUsers = (dashboardData?.registeredUsers ?? []) as RegisteredUser[];
  const totalUsers = dashboardData?.totalUsers ?? 0;
  const dailyMax = Math.max(...(data?.daily.map(item => item.visits + item.leaves) || [1]), 1);

  return (
    <DashboardLayout>
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow"><span /> مركز متابعة الزوار</span>
            <h1>لوحة الماء والزوار</h1>
            <p>قراءة هادئة لحركة الموقع، من أين جاء الزوار وكيف يتصفحون البحث.</p>
          </div>
          <div className="dashboard-header-actions">
            <a href="/" className="dashboard-home-link"><ArrowDownLeft size={15} /> الموقع العام</a>
            {user?.role === "admin" && <Button type="button" variant="outline" onClick={syncUsersToTelegram} disabled={syncingUsers}><Send size={15} /> {syncingUsers ? "جارٍ الإرسال..." : "إرسال الحسابات للبوت"}</Button>}
            {user?.name && <span className="dashboard-user-chip">مرحبًا، {user.name}</span>}
          </div>
        </header>
        {syncMessage && <div className="dashboard-notice">{syncMessage}</div>}

        {authLoading || !isAuthenticated ? null : (
          <>
            <section className="dashboard-toolbar" aria-label="فلاتر لوحة التحكم">
              <div className="dashboard-filter-label"><CalendarDays size={16} /><span>الفترة</span></div>
              <label className="dashboard-select"><span className="sr-only">الفترة الزمنية</span><select value={days} onChange={event => setDays(Number(event.target.value))}><option value={7}>آخر 7 أيام</option><option value={30}>آخر 30 يومًا</option><option value={90}>آخر 90 يومًا</option></select><ChevronDown size={15} /></label>
              <label className="dashboard-select"><span className="sr-only">نوع الحدث</span><select value={eventType} onChange={event => setEventType(event.target.value as EventFilter)}><option value="">كل الأحداث</option><option value="visit">دخول فقط</option><option value="leave">خروج فقط</option></select><ChevronDown size={15} /></label>
              <label className="dashboard-select"><span className="sr-only">الدولة</span><select value={country} onChange={event => setCountry(event.target.value)}><option value="">كل الدول</option>{data?.countries.map(item => <option key={item.label} value={item.label}>{item.label}</option>)}</select><ChevronDown size={15} /></label>
              <label className="dashboard-select"><span className="sr-only">المتصفح</span><select value={browser} onChange={event => setBrowser(event.target.value)}><option value="">كل المتصفحات</option>{data?.browsers.map(item => <option key={item.label} value={item.label}>{item.label}</option>)}</select><ChevronDown size={15} /></label>
              <Button type="button" variant="ghost" className="dashboard-refresh" onClick={() => setRefreshKey(value => value + 1)} disabled={dashboardLoading}><RefreshCw size={16} className={dashboardLoading ? "dashboard-spin" : ""} /> تحديث</Button>
            </section>

            {dashboardLoading && !data ? <div className="dashboard-loading"><Activity size={20} /> جارٍ تجهيز لوحة البيانات...</div> : dashboardError ? <div className="dashboard-error">{dashboardError.code === "FORBIDDEN" ? "هذه المنطقة مخصصة للمدير فقط. سجّل الدخول بالحساب الإداري المصرح له." : dashboardError.message || "تعذر تحميل بيانات لوحة المدير."}</div> : data ? (
              <>
                <section className="dashboard-stat-grid">
                  <StatCard icon={Activity} label="إجمالي الأحداث" value={data.totalEvents} note={`خلال آخر ${days} يومًا`} tone="ink" />
                  <StatCard icon={LogIn} label="زيارات الدخول" value={data.visits} note="بداية جلسات التصفح" tone="teal" />
                  <StatCard icon={Users} label="جلسات فريدة" value={data.uniqueSessions} note="معرّفات مجهولة" tone="gold" />
                  <StatCard icon={Clock3} label="نشطون الآن" value={data.activeVisitors} note="آخر 15 دقيقة تقريبًا" tone="clay" />
                  <StatCard icon={LogOut} label="أحداث الخروج" value={data.leaves} note="إشارات مغادرة تقريبية" tone="ink" />
                  <StatCard icon={UserCheck} label="حسابات مسجلة" value={totalUsers} note="مستخدمو بوابة الموقع" tone="teal" />
                </section>

                <section className="dashboard-main-grid">
                  <section className="dashboard-panel dashboard-chart-panel">
                    <div className="dashboard-panel-heading"><div><span className="dashboard-kicker"><Activity size={15} /> النبض اليومي</span><h2>حركة الزيارات خلال الفترة</h2></div><span className="dashboard-panel-mark">{formatNumber(data.visits)} دخول</span></div>
                    <div className="dashboard-chart" aria-label="مخطط الزيارات اليومية">
                      {data.daily.length === 0 ? <p className="dashboard-empty">ستظهر الحركة هنا بعد أول زيارة مسجلة.</p> : data.daily.map(item => <div className="dashboard-chart-column" key={item.day}><div className="dashboard-chart-bars"><span className="dashboard-bar visits" style={{ height: `${Math.max(4, (item.visits / dailyMax) * 100)}%` }} /><span className="dashboard-bar leaves" style={{ height: `${Math.max(2, (item.leaves / dailyMax) * 100)}%` }} /></div><small>{item.day.slice(5)}</small></div>)}
                    </div>
                    <div className="dashboard-legend"><span><i className="legend-dot visits" /> دخول</span><span><i className="legend-dot leaves" /> خروج تقريبي</span></div>
                  </section>
                  <section className="dashboard-panel dashboard-snapshot"><span className="dashboard-kicker"><Globe2 size={15} /> لقطة سريعة</span><h2>كل زيارة تترك أثرًا مجهولًا.</h2><p>نحفظ إشارات عامة تساعدك على فهم الجمهور دون تخزين عنوان IP الخام.</p><div className="dashboard-snapshot-line"><span>متوسط الأحداث اليومي</span><strong>{formatNumber(Math.round(data.totalEvents / Math.max(days, 1)))}</strong></div><div className="dashboard-snapshot-line"><span>آخر تحديث</span><strong>{new Intl.DateTimeFormat("ar-EG", { timeStyle: "short" }).format(new Date())}</strong></div></section>
                </section>

                <section className="dashboard-analysis-grid">
                  <DistributionList title="الدول" icon={Globe2} items={data.countries} />
                  <DistributionList title="المتصفحات" icon={Laptop2} items={data.browsers} />
                  <DistributionList title="أنظمة التشغيل" icon={Monitor} items={data.operatingSystems} />
                </section>

                <section className="dashboard-panel dashboard-events-panel">
                  <div className="dashboard-panel-heading"><div><span className="dashboard-kicker"><Clock3 size={15} /> سجل حي</span><h2>آخر الأحداث</h2></div><span className="dashboard-panel-mark">50 كحد أقصى</span></div>
                  <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>الحدث</th><th>الوقت</th><th>الموقع التقريبي</th><th>المتصفح والنظام</th><th>الصفحة</th><th>الجلسة</th></tr></thead><tbody>{data.recent.length === 0 ? <tr><td colSpan={6} className="dashboard-empty">لا توجد أحداث مسجلة حتى الآن.</td></tr> : data.recent.map(item => <tr key={item.id}><td><span className={`event-badge ${item.eventType === "visit" ? "event-visit" : "event-leave"}`}>{item.eventType === "visit" ? <ArrowUpLeft size={14} /> : <ArrowDownLeft size={14} />}{item.eventType === "visit" ? "دخول" : "خروج"}</span></td><td>{formatDate(item.occurredAt)}</td><td><strong>{[item.city, item.region, item.country].filter(Boolean).join("، ") || "غير معروف"}</strong><small>{item.timezone || "منطقة زمنية غير معروفة"}</small></td><td><strong>{item.browser || "غير معروف"}</strong><small>{item.operatingSystem || "غير معروف"} · {item.screen || "—"}</small></td><td dir="ltr" className="dashboard-ltr">{item.page}</td><td dir="ltr" className="dashboard-session">{item.sessionId.slice(0, 12)}…</td></tr>)}</tbody></table></div>
                </section>
                <section className="dashboard-panel dashboard-events-panel admin-users-panel">
                  <div className="dashboard-panel-heading"><div><span className="dashboard-kicker"><UserCheck size={15} /> إدارة الحسابات</span><h2>الزوار الذين سجّلوا دخولهم</h2></div><span className="dashboard-panel-mark">{formatNumber(totalUsers)} حساب</span></div>
                  <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>الاسم</th><th>البريد الإلكتروني</th><th>طريقة الدخول</th><th>الدور</th><th>تاريخ التسجيل</th><th>آخر دخول</th></tr></thead><tbody>{registeredUsers.length === 0 ? <tr><td colSpan={6} className="dashboard-empty">لا توجد حسابات مسجلة بعد.</td></tr> : registeredUsers.map(item => <tr key={item.id}><td><strong>{item.name || "زائر بلا اسم"}</strong></td><td dir="ltr" className="dashboard-ltr">{item.email || "—"}</td><td>{item.loginMethod || "البريد الإلكتروني"}</td><td><span className={`event-badge ${item.role === "admin" ? "event-visit" : "event-leave"}`}>{item.role === "admin" ? "مدير" : "زائر مسجل"}</span></td><td>{formatDate(item.createdAt)}</td><td>{formatDate(item.lastSignedIn)}</td></tr>)}</tbody></table></div>
                </section>
                <p className="dashboard-privacy-note"><Smartphone size={15} /> البيانات تقريبية ومجهولة: الدولة من إشارات Vercel، والمتصفح والنظام من User-Agent، ولا يتم تخزين عنوان IP.</p>
              </>
            ) : null}
          </>
        )}
      </main>
    </DashboardLayout>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
