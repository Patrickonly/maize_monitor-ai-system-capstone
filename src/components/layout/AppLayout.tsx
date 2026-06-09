import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sparkles, Sun } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Your maize analytics and AI assistant",
  },
  "/recent": {
    title: "Recent Analyses",
    subtitle: "Pinned and latest chat sessions",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Personalize your Smart Maize workspace",
  },
  "/create-analysing": {
    title: "New Analysis",
    subtitle: "",
  },
};

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isContentLoading, setIsContentLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setIsContentLoading(true);
    const timer = window.setTimeout(() => setIsContentLoading(false), 320);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const pageMeta = PAGE_META[location.pathname] ?? {
    title: "Smart Maize",
    subtitle: "AI crop intelligence platform",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main id="app-main-scroll" className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-lg md:px-6">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/maize-logo.svg"
                alt="Smart Maize logo"
                className="h-10 w-10 rounded-xl border border-primary/25 bg-primary/10 p-1"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">Smart Maize Health Monitor</p>
                <h1 className="font-display text-lg font-bold leading-tight md:text-xl">{pageMeta.title}</h1>
                {pageMeta.subtitle ? <p className="text-xs text-muted-foreground">{pageMeta.subtitle}</p> : null}
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
              <Sparkles className="hidden h-4 w-4 text-primary sm:inline" />
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
          {isContentLoading ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4">
                    <Skeleton className="mb-3 h-10 w-10 rounded-xl" />
                    <Skeleton className="mb-2 h-7 w-24" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                <div className="glass-card rounded-2xl p-5 xl:col-span-2">
                  <Skeleton className="mb-4 h-5 w-48" />
                  <Skeleton className="h-72 w-full rounded-xl" />
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <Skeleton className="mb-4 h-5 w-40" />
                  <Skeleton className="h-72 w-full rounded-xl" />
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>

        <footer className="border-t border-border/70 bg-background/70 px-4 py-4 backdrop-blur-sm md:px-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {currentYear} <span className="font-medium text-foreground">Smart Maize Health Monitor</span>. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};
