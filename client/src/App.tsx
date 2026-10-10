import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import HighDam from "./pages/HighDam";
import Login, { Register } from "./pages/Login";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import HighDamArticles from "./pages/HighDamArticles";
import Profile from "./pages/Profile";
import Quran from "./pages/Quran";
import { LanguageProvider } from "./contexts/LanguageContext";
import GlobalMusicControl from "./components/GlobalMusicControl";
import { useAuth } from "@/_core/hooks/useAuth";

function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  if (loading || !user) {
    return <div className="site-auth-loading" dir="rtl"><span className="login-loader" /><p>جارٍ التحقق من تسجيل الدخول...</p></div>;
  }
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/high-dam"><ProtectedPage><HighDam /></ProtectedPage></Route>
      <Route path="/high-dam/articles"><ProtectedPage><HighDamArticles /></ProtectedPage></Route>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard"><ProtectedPage><Dashboard /></ProtectedPage></Route>
      <Route path="/admin"><ProtectedPage><Dashboard /></ProtectedPage></Route>
      <Route path="/articles"><ProtectedPage><Articles /></ProtectedPage></Route>
      <Route path="/articles/:slug"><ProtectedPage><ArticleDetail /></ProtectedPage></Route>
      <Route path="/profile"><ProtectedPage><Profile /></ProtectedPage></Route>
      <Route path="/quran"><ProtectedPage><Quran /></ProtectedPage></Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
