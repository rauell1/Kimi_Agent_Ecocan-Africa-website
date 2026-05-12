"use client";

import { useEffect } from "react";
import {
  Calendar, LayoutDashboard, LogOut, Droplets, Database,
  Settings, BarChart3, Newspaper, Bell, Users, Image, Mail, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  currentRoute: string;
  user: { id: string; email: string; displayName?: string; role?: string };
  onNavigate: (route: string) => void;
  onSignOut: () => void;
  children: React.ReactNode;
  params?: Record<string, string>;
}

const MAIN_NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/events", label: "Events", icon: Calendar },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/news", label: "News", icon: Newspaper },
] as const;

const ADMIN_NAV = [
  { to: "/dashboard/users", label: "Users", icon: Users },
  { to: "/dashboard/newsletter", label: "Newsletter", icon: Mail },
  { to: "/dashboard/workflows", label: "Workflows", icon: Activity },
  { to: "/dashboard/supabase", label: "Supabase", icon: Database },
] as const;

const BOTTOM_NAV = [
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
] as const;

export function DashboardLayout({ currentRoute, user, onNavigate, onSignOut, children }: DashboardLayoutProps) {
  const userRole = user.role ?? "viewer";
  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (!user) onNavigate("/auth");
  }, [user, onNavigate]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Redirecting…</div>
      </div>
    );
  }

  const allNav = [...MAIN_NAV, ...(isAdmin ? ADMIN_NAV : []), ...BOTTOM_NAV];

  return (
    <div className="flex min-h-screen bg-secondary/20">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-none border-r border-border/60 bg-card md:flex md:flex-col">
        <button onClick={() => onNavigate("/")} className="flex items-center gap-2.5 border-b border-border/60 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, #1a3a5c, #3d6d8a)" }}>
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold">KYPW</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Dashboard</div>
          </div>
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {MAIN_NAV.map((item) => {
            const active = currentRoute === item.to || (item.to !== "/dashboard" && currentRoute.startsWith(item.to));
            return (
              <button
                key={item.to}
                onClick={() => onNavigate(item.to)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-2 border-t border-border/60" />
              {ADMIN_NAV.map((item) => {
                const active = currentRoute.startsWith(item.to);
                return (
                  <button
                    key={item.to}
                    onClick={() => onNavigate(item.to)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </>
          )}

          <div className="my-2 border-t border-border/60" />
          {BOTTOM_NAV.map((item) => {
            const active = currentRoute.startsWith(item.to);
            return (
              <button
                key={item.to}
                onClick={() => onNavigate(item.to)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border/60 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {(user.displayName ?? user.email)?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user.displayName ?? user.email}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{userRole}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={onSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 md:hidden">
          <button onClick={() => onNavigate("/")} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, #1a3a5c, #3d6d8a)" }}>
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-semibold">KYPW</span>
          </button>
          <div className="flex gap-1 overflow-x-auto">
            {allNav.map((item) => (
              <button key={item.to} onClick={() => onNavigate(item.to)} className="shrink-0 rounded-md p-2 text-foreground/70 hover:bg-secondary">
                <item.icon className="h-4 w-4" />
              </button>
            ))}
            <button onClick={onSignOut} className="shrink-0 rounded-md p-2 text-foreground/70 hover:bg-secondary">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <main className="flex-1 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
