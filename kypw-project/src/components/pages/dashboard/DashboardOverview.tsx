"use client";

import { useEffect, useState } from "react";
import { Calendar, Users, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardOverviewProps {
  user: { id: string; email: string; name: string | null; role: string };
  onNavigate: (route: string) => void;
}

export function DashboardOverview({ user, onNavigate }: DashboardOverviewProps) {
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, participants: 0 });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-civic">Welcome</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
            Hello, {user?.name ?? user?.email?.split("@")[0]}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across the Parliament right now.
          </p>
        </div>
        <Button onClick={() => onNavigate("/dashboard/events")}>
          Manage events <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Calendar, label: "Total events", value: stats.total, tone: "text-primary" },
          { icon: Clock, label: "Upcoming", value: stats.upcoming, tone: "text-civic" },
          { icon: CheckCircle2, label: "Completed", value: stats.completed, tone: "text-clay" },
          { icon: Users, label: "Participants", value: stats.participants, tone: "text-accent-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 font-display text-3xl font-semibold">{s.value}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-gradient-hero p-8 text-primary-foreground shadow-elevated">
        <h2 className="font-display text-2xl font-semibold">Plan your next event</h2>
        <p className="mt-2 max-w-xl text-primary-foreground/85">
          Draft an event in minutes - set the type, location, dates and assigned team. Move it through draft, planned,
          published and completed as your work unfolds.
        </p>
        <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onNavigate("/dashboard/events")}>
          Create event
        </Button>
      </div>
    </div>
  );
}
