"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, BellOff, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api/client";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "event_reminder":
    case "event_update":
      return "📅";
    case "document_uploaded":
    case "document_required":
      return "📄";
    case "participant_added":
    case "attendance":
      return "👥";
    case "system":
      return "⚙️";
    case "achievement":
      return "🏆";
    default:
      return "🔔";
  }
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get<{ notifications: Notification[] }>("/notifications");
      setNotifications(data.notifications);
    } catch {
      // Silent fail for background refreshes
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(fetchNotifications, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchNotifications]);

  async function markAsRead(id: string, link?: string | null) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (link) {
        // Navigate via hash routing
        window.location.hash = link;
      }
    } catch {
      toast.error("Failed to mark notification as read");
    }
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <Bell className="h-5 w-5 text-civic" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle className="text-base">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-1 text-[10px] px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={markAllAsRead}
              disabled={markingAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {markingAll ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              )}
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <BellOff className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No notifications
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-1 pr-4">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id, notification.link)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    notification.read
                      ? "border-transparent bg-transparent hover:bg-muted/50"
                      : "border-border/70 bg-muted/30 hover:bg-muted/60 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg leading-none flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-civic flex-shrink-0" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground/70">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {notification.link && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
