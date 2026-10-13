import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { LanguageProvider } from "./contexts/LanguageContext";
import GlobalMusicControl from "./components/GlobalMusicControl";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAdminAuth } from "./_core/hooks/useAdminAuth";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminArticles = lazy(() => import("./pages/AdminArticles"));
const HighDam = lazy(() => import("./pages/HighDam"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(async () => ({ default: (await import("./pages/Login")).AdminLogin }));
const Articles = lazy(() => import("./pages/Articles"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const HighDamArticles = lazy(() => import("./pages/HighDamArticles"));
const Profile = lazy(() => import("./pages/Profile"));
const Quran = lazy(() => import("./pages/Quran"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Register = lazy(async () => ({ default: (await import("./pages/Login")).Register }));

function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  if (loading || !user) {
    return <div className="site-auth-loading" dir="rtl"><span className="login-loader" /><p>جارٍ التحقق من تسجيل الدخول...</p></div>;
  }
  return <>{children}</>;
}

function AdminPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      if (!user) window.location.replace("/admin/login");
      else if (user.role !== "admin") window.location.replace("/");
    }
  }, [loading, user]);
  if (loading || !user) {
    return <div className="site-auth-loading" dir="rtl"><span className="login-loader" /><p>جارٍ التحقق من صلاحية المدير...</p></div>;
  }
  if (user.role !== "admin") {
    return <div className="site-auth-loading" dir="rtl"><span className="login-loader" /><p>جارٍ إعادتك إلى الموقع...</p></div>;
  }
  return <>{children}</>;
}

function Router() {
  return (
    <Suspense fallback={<div className="site-auth-loading" dir="rtl"><span className="login-loader" /><p>جارٍ فتح الصفحة...</p></div>}>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/high-dam"><ProtectedPage><HighDam /></ProtectedPage></Route>
      <Route path="/high-dam/articles" component={HighDamArticles} />
      <Route path="/login" component={Login} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/dashboard"><AdminPage><Dashboard /></AdminPage></Route>
      <Route path="/admin"><AdminPage><Dashboard /></AdminPage></Route>
      <Route path="/admin/articles"><AdminPage><AdminArticles /></AdminPage></Route>
      <Route path="/articles" component={Articles} />
      <Route path="/articles/:slug" component={ArticleDetail} />
      <Route path="/profile"><ProtectedPage><Profile /></ProtectedPage></Route>
      <Route path="/quran"><ProtectedPage><Quran /></ProtectedPage></Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <GlobalMusicControl />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
