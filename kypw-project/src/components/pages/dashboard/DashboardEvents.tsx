"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Calendar, MapPin, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DashboardEventsProps {
  user: { id: string; email: string; name: string | null; role: string };
  onNavigate: (route: string) => void;
}

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  status: string;
  startAt: string | null;
  endAt: string | null;
  region: string | null;
  locationName: string | null;
  locationType: string;
  coverImageUrl: string | null;
}

const STATUSES = ["draft", "planned", "published", "ongoing", "completed", "archived"] as const;
const TYPES = ["webinar", "workshop", "hackathon", "dialogue", "field_visit"] as const;

export function DashboardEvents({ user, onNavigate }: DashboardEventsProps) {
  const canManage = user.role === "admin" || user.role === "coordinator";
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      toast.error("Failed to load events");
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: (fd.get("title") as string)?.trim() || "",
      description: (fd.get("description") as string)?.trim() || null,
      eventType: fd.get("event_type") as string,
      status: fd.get("status") as string,
      startAt: (fd.get("start_at") as string) || null,
      endAt: (fd.get("end_at") as string) || null,
      region: (fd.get("region") as string)?.trim() || null,
      locationName: (fd.get("location_name") as string)?.trim() || null,
      locationType: fd.get("location_type") as string,
    };

    if (!payload.title || payload.title.length < 2) {
      toast.error("Title must be at least 2 characters");
      return;
    }

    try {
      if (editing) {
        const res = await fetch(`/api/events/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Event updated");
      } else {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Event created");
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch {
      toast.error("Failed to save event");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Event deleted");
      load();
    } catch {
      toast.error("Failed to delete event");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-civic">Operations</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Plan, publish and document KYPW events.</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New event</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit event" : "Create event"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required maxLength={200} defaultValue={editing?.title ?? ""} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={3} maxLength={2000} defaultValue={editing?.description ?? ""} className="mt-1.5" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Type</Label>
                    <Select name="event_type" defaultValue={editing?.eventType ?? "workshop"}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select name="status" defaultValue={editing?.status ?? "draft"}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Start</Label>
                    <Input name="start_at" type="datetime-local" defaultValue={editing?.startAt?.slice(0, 16) ?? ""} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>End</Label>
                    <Input name="end_at" type="datetime-local" defaultValue={editing?.endAt?.slice(0, 16) ?? ""} className="mt-1.5" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Location type</Label>
                    <Select name="location_type" defaultValue={editing?.locationType ?? "physical"}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Region / County</Label>
                    <Input name="region" maxLength={100} defaultValue={editing?.region ?? ""} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Venue / Platform</Label>
                    <Input name="location_name" maxLength={200} defaultValue={editing?.locationName ?? ""} className="mt-1.5" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit">{editing ? "Save changes" : "Create"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!canManage && (
        <div className="rounded-xl border border-border/70 bg-secondary/40 p-4 text-sm text-muted-foreground">
          You have view-only access. Ask an admin to grant you the <strong>coordinator</strong> role to create events.
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-shimmer rounded-xl bg-gradient-to-r from-muted via-muted/60 to-muted" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-display text-xl font-semibold">No events yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create the first event to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-hidden rounded-2xl border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Where</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {events.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-secondary/20">
                  <td className="px-5 py-4 font-medium">{e.title}</td>
                  <td className="px-5 py-4 text-muted-foreground">{e.eventType.replace(/_/g, " ")}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusStyle(e.status)}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {e.startAt ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(e.startAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {(e.region || e.locationName) ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {e.region ?? e.locationName}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => onNavigate(`/dashboard/events/${e.id}`)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Open">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {canManage && (
                        <>
                          <button onClick={() => { setEditing(e); setOpen(true); }} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Edit">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(e.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function statusStyle(s: string) {
  switch (s) {
    case "published": return "bg-civic/15 text-civic";
    case "ongoing": return "bg-accent text-accent-foreground";
    case "completed": return "bg-clay/15 text-clay";
    case "draft": return "bg-secondary text-muted-foreground";
    case "planned": return "bg-primary/10 text-primary";
    default: return "bg-secondary text-muted-foreground";
  }
}
