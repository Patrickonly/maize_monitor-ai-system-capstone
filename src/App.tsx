import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RouteSkeleton } from "@/components/RouteSkeleton";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthModalProvider, AuthModals } from "@/contexts/AuthModalContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserChats from "./pages/AdminUserChats";
import CreateAnalysing from "./pages/CreateAnalysing";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import RecentChats from "./pages/RecentChats";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const RouteLoader = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  if (loading) return <RouteSkeleton />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AuthModalProvider>
                <AuthModals />
                <Routes>
                  <Route path="/" element={<RouteLoader><Landing /></RouteLoader>} />
                  <Route path="/create-analysing" element={<CreateAnalysing />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/users/:userId/chats" element={<ProtectedRoute><AdminUserChats /></ProtectedRoute>} />
                  <Route path="/recent" element={<RecentChats />} />
                  <Route path="/reports" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<RouteLoader><NotFound /></RouteLoader>} />
                </Routes>
              </AuthModalProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
