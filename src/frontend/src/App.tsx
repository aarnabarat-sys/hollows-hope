import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/hooks/useTheme";
import { AdminPage } from "@/pages/AdminPage";
import { AuthPage } from "@/pages/AuthPage";
import { ChatPage } from "@/pages/ChatPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DiaryFeedPage } from "@/pages/DiaryFeedPage";
import { NewEntryPage } from "@/pages/NewEntryPage";
import { WeeklyAnalysisPage } from "@/pages/WeeklyAnalysisPage";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/auth" />,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

const newEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/new-entry",
  component: () => (
    <ProtectedRoute>
      <NewEntryPage />
    </ProtectedRoute>
  ),
});

const diaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/diary",
  component: () => (
    <ProtectedRoute>
      <DiaryFeedPage />
    </ProtectedRoute>
  ),
});

const analysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analysis",
  component: () => (
    <ProtectedRoute>
      <WeeklyAnalysisPage />
    </ProtectedRoute>
  ),
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: () => (
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  dashboardRoute,
  newEntryRoute,
  diaryRoute,
  analysisRoute,
  chatRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
