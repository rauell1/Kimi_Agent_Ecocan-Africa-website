"use client";

import { useState, useEffect, type FormEvent } from "react";
import { FileText, Upload, Trash2, Download, ImageIcon, CheckCircle2, Circle, Settings2, ListChecks, RotateCcw, Loader2, Pencil, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocItem, DocRequirement } from "../event-detail-types";

interface Props {
  eventId: string; event: { title: string; eventType: string };
  docs: DocItem[]; canManage: boolean; reload: () => void;
}

const EVENT_TYPES = [
  { value: "workshop", label: "Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "field_visit", label: "Field Visit" },
  { value: "hackathon", label: "Hackathon" },
  { value: "conference", label: "Conference" },
  { value: "dialogue", label: "Dialogue" },
  { value: "campaign", label: "Campaign" },
  { value: "other", label: "Other" },
];

export function DocumentationPanel({ eventId, event, docs, canManage, reload }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [requirements, setRequirements] = useState<DocRequirement[]>([]);

  const loadRequirements = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/documentation/requirements`);
      const data = await res.json();
      setRequirements(data.requirements ?? []);
    } catch { /* silent */ }
  };

  useEffect(() => { loadRequirements(); }, [eventId]);

  async function handleAddDoc(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string)?.trim();
    if (!title || title.length < 2) { toast.error("Title is required"); return; }
    try {
      const res = await fetch(`/api/events/${eventId}/documentation`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type: fd.get("type") || "photo", description: (fd.get("description") as string) || null, externalUrl: (fd.get("external_url") as string) || null }),
      });
      if (!res.ok) throw new Error();
      toast.success("Documentation added"); setAddOpen(false); reload(); loadRequirements();
    } catch { toast.error("Failed to add documentation"); }
  }

  async function removeDoc(id: string) {
    if (!confirm("Remove this item?")) return;
    await fetch(`/api/events/${eventId}/documentation?docId=${id}`, { method: "DELETE" });
    reload(); loadRequirements();
  }

  const completedCount = requirements.filter((r) => r.completed).length;
  const requiredCount = requirements.filter((r) => r.required).length;
  const completedRequired = requirements.filter((r) => r.required && r.completed).length;
  const progressPercent = requiredCount > 0 ? Math.round((completedRequired / requiredCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Checklist Progress */}
      {requirements.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-civic" />
              <h3 className="font-display text-sm font-semibold">Documentation Checklist</h3>
            </div>
            <Badge variant={progressPercent === 100 ? "default" : "secondary"} className="text-[10px]">
              {completedRequired}/{requiredCount} required
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground">{progressPercent}% complete · {completedCount} of {requirements.length} total items done</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {requirements.map((req) => (
              <Badge key={req.id} variant={req.completed ? "default" : "outline"} className="text-[10px] gap-1">
                {req.completed ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                {req.label}
                {!req.required && <span className="opacity-50">(opt)</span>}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap justify-end gap-2">
        {canManage && (
          <>
            <Dialog open={checklistOpen} onOpenChange={(o) => { setChecklistOpen(o); if (o) loadRequirements(); }}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Settings2 className="mr-1.5 h-4 w-4" />Edit checklist</Button></DialogTrigger>
              <DialogContent className="max-w-xl max-h-[90vh]">
                <ChecklistEditor eventId={eventId} eventType={event.eventType} requirements={requirements} onSave={() => { reload(); loadRequirements(); }} onClose={() => setChecklistOpen(false)} />
              </DialogContent>
            </Dialog>
            <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Pencil className="mr-1.5 h-4 w-4" />Bulk edit</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <BulkEditDialog currentEventType={event.eventType} onSave={loadRequirements} onClose={() => setBulkOpen(false)} />
              </DialogContent>
            </Dialog>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild><Button size="sm"><Upload className="mr-1.5 h-4 w-4" />Add item</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add documentation</DialogTitle></DialogHeader>
                <form onSubmit={handleAddDoc} className="space-y-3">
                  <div><Label>Title *</Label><Input name="title" required maxLength={150} className="mt-1" /></div>
                  <div>
                    <Label>Type</Label><Select name="type" defaultValue="photo"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{["photo", "video", "attendance_sheet", "feedback_form", "report", "other"].map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div><Label>Description</Label><Textarea name="description" rows={2} maxLength={500} className="mt-1" /></div>
                  <div><Label>External URL</Label><Input name="external_url" type="url" placeholder="https://…" className="mt-1" /></div>
                  <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button type="submit">Add</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {/* Documentation Grid */}
      {docs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-display text-xl font-semibold">No documentation yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Upload photos, attendance sheets, feedback or reports.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <div key={d.id} className="overflow-hidden rounded-xl border border-border/70 bg-card">
              <div className="flex h-40 items-center justify-center bg-secondary/40">
                {d.type === "photo" ? <ImageIcon className="h-10 w-10 text-muted-foreground/50" /> : <FileText className="h-10 w-10 text-muted-foreground/50" />}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-civic">{d.type.replace(/_/g, " ")}</p>
                    <h3 className="mt-1 truncate font-medium">{d.title}</h3>
                    {d.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>}
                  </div>
                  {canManage && <button onClick={() => removeDoc(d.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
                </div>
                {(d.fileUrl || d.externalUrl) && (
                  <a href={d.fileUrl ?? d.externalUrl!} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-civic hover:underline">Open <Download className="h-3 w-3" /></a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Checklist Editor ---- */

function ChecklistEditor({ eventId, eventType, requirements: initialReqs, onSave, onClose }: {
  eventId: string; eventType: string; requirements: DocRequirement[]; onSave: () => void; onClose: () => void;
}) {
  const [items, setItems] = useState(initialReqs.map((r) => ({ ...r, _editing: false })));
  const [saving, setSaving] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  function addItem() {
    setItems([...items, { id: `new-${Date.now()}`, docType: "other", label: "", hint: null, required: true, sortOrder: items.length, completed: false, _editing: true }]);
  }

  function updateItem(index: number, field: string, value: string | boolean) {
    const updated = [...items];
    (updated[index] as Record<string, unknown>)[field] = value;
    setItems(updated);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function save() {
    const valid = items.filter((i) => i.label.trim());
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}/documentation/requirements`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements: valid.map((r, i) => ({ docType: r.docType, label: r.label.trim(), hint: r.hint, required: r.required, sortOrder: i })) }),
      });
      if (!res.ok) throw new Error();
      toast.success("Checklist updated"); onSave(); onClose();
    } catch { toast.error("Failed to update checklist"); }
    setSaving(false);
  }

  async function resetToTemplate() {
    setLoadingTemplate(true);
    try {
      const res = await fetch(`/api/events/${eventId}/documentation/requirements`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setItems(data.template.map((t: DocRequirement, i: number) => ({ ...t, sortOrder: i, completed: false })));
      toast.success("Checklist reset to template defaults");
    } catch { toast.error("Failed to reset checklist"); }
    setLoadingTemplate(false);
  }

  return (
    <>
      <DialogHeader><DialogTitle><Settings2 className="mr-2 h-5 w-5 inline" />Edit Documentation Checklist</DialogTitle></DialogHeader>
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">Current event type: <span className="font-semibold capitalize">{eventType.replace(/_/g, " ")}</span></p>
          <Button size="sm" variant="outline" onClick={resetToTemplate} disabled={loadingTemplate}>
            {loadingTemplate ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Resetting…</> : <><RotateCcw className="mr-1.5 h-3.5 w-3.5" />Reset to defaults</>}
          </Button>
        </div>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-2 pr-4">
            {items.map((item, idx) => (
              <div key={item.id} className="rounded-lg border border-border/70 bg-card p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] font-mono text-muted-foreground">#{idx + 1}</span>
                  <Select value={item.docType} onValueChange={(v) => updateItem(idx, "docType", v)}>
                    <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["photo", "video", "attendance_sheet", "feedback_form", "report", "other"].map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Label className="text-[10px]">Req.</Label>
                    <Switch checked={item.required} onCheckedChange={(v) => updateItem(idx, "required", v)} className="scale-75" />
                    <button onClick={() => removeItem(idx)} className="rounded p-1 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Input value={item.label} onChange={(e) => updateItem(idx, "label", e.target.value)} placeholder="Label" className="h-7 text-xs flex-1 min-w-[120px]" />
                  <Input value={item.hint ?? ""} onChange={(e) => updateItem(idx, "hint", e.target.value)} placeholder="Hint (optional)" className="h-7 text-xs flex-1 min-w-[120px]" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Button size="sm" variant="ghost" onClick={addItem}>+ Add checklist item</Button>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save checklist"}</Button>
      </DialogFooter>
    </>
  );
}

/* ---- Bulk Edit Dialog ---- */

function BulkEditDialog({ currentEventType, onSave, onClose }: { currentEventType: string; onSave: () => void; onClose: () => void }) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([currentEventType]);
  const [docTypeFilter, setDocTypeFilter] = useState<string>("");
  const [label, setLabel] = useState("");
  const [hint, setHint] = useState("");
  const [required, setRequired] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  function toggleType(type: string) {
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  }

  async function handleBulkUpdate() {
    if (selectedTypes.length === 0) { toast.error("Select at least one event type"); return; }
    const updates: Record<string, unknown> = {};
    if (docTypeFilter) updates.docType = docTypeFilter;
    if (label.trim()) updates.label = label.trim();
    if (hint.trim()) updates.hint = hint.trim();
    if (required !== null) updates.required = required;
    if (Object.keys(updates).length === 0) { toast.error("Specify at least one field to update"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/documentation/requirements/bulk", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventTypes: selectedTypes, updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk update failed");
      toast.success(`Updated ${data.requirementsUpdated} requirements across ${data.eventsAffected} events`);
      onSave(); onClose();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Bulk update failed"); }
    setSaving(false);
  }

  return (
    <>
      <DialogHeader><DialogTitle><Pencil className="mr-2 h-5 w-5 inline" />Bulk Edit Checklist</DialogTitle></DialogHeader>
      <div className="space-y-4 pt-2">
        <div>
          <Label className="text-xs uppercase tracking-widest">Apply to event types</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => (
              <button key={t.value} onClick={() => toggleType(t.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${selectedTypes.includes(t.value) ? "border-civic bg-civic/15 text-civic" : "border-border text-muted-foreground hover:border-foreground/30"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs uppercase tracking-widest">Filter by doc type (optional)</Label>
          <Select value={docTypeFilter || "_all"} onValueChange={(v) => setDocTypeFilter(v === "_all" ? "" : v)}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent><SelectItem value="_all">All doc types</SelectItem>{["photo", "video", "attendance_sheet", "feedback_form", "report", "other"].map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div><Label>Set label</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Leave empty to skip" className="mt-1" /></div>
          <div><Label>Set hint</Label><Input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Leave empty to skip" className="mt-1" /></div>
          <div>
            <Label>Set required status</Label>
            <Select value={required === null ? "_skip" : String(required)} onValueChange={(v) => setRequired(v === "_skip" ? null : v === "true")}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Don't change" /></SelectTrigger>
              <SelectContent><SelectItem value="_skip">Don't change</SelectItem><SelectItem value="true">Required</SelectItem><SelectItem value="false">Optional</SelectItem></SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3 text-xs text-amber-800 dark:text-amber-300">
          This will update checklist requirements for all events matching the selected types. This action is logged in the audit trail.
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleBulkUpdate} disabled={saving || selectedTypes.length === 0}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating…</> : `Apply to ${selectedTypes.length} type(s)`}
        </Button>
      </DialogFooter>
    </>
  );
}
