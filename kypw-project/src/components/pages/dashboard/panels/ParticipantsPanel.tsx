"use client";

import { useState, useRef, type FormEvent } from "react";
import { Users, Plus, Trash2, Upload, FileDown, FileSpreadsheet, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Participant, CsvValidationResult } from "../event-detail-types";

const CSV_HEADERS = "full_name,email,phone,organization,region,gender,age_group,role_at_event";

interface Props {
  eventId: string; participants: Participant[]; canManage: boolean; reload: () => void;
}

export function ParticipantsPanel({ eventId, participants, canManage, reload }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fullName = (fd.get("full_name") as string)?.trim();
    if (!fullName) { toast.error("Name is required"); return; }
    try {
      const res = await fetch(`/api/events/${eventId}/participants`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName, email: (fd.get("email") as string) || null, phone: (fd.get("phone") as string) || null,
          organization: (fd.get("organization") as string) || null, region: (fd.get("region") as string) || null,
          gender: (fd.get("gender") as string) || null, ageGroup: (fd.get("age_group") as string) || null,
          roleAtEvent: (fd.get("role_at_event") as string) || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Participant added"); setAddOpen(false); reload();
    } catch { toast.error("Failed to add participant"); }
  }

  async function toggleAttended(p: Participant) {
    try {
      await fetch(`/api/events/${eventId}/participants`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: p.id, attended: !p.attended }),
      }); reload();
    } catch { toast.error("Failed to update"); }
  }

  async function remove(id: string) {
    if (!confirm("Remove this participant?")) return;
    try {
      await fetch(`/api/events/${eventId}/participants?participantId=${id}`, { method: "DELETE" }); reload();
    } catch { toast.error("Failed to remove"); }
  }

  function exportCsv(filtered?: Participant[]) {
    const data = filtered ?? participants;
    const headers = CSV_HEADERS.split(",");
    const rows = data.map((p) => [
      p.fullName, p.email ?? "", p.phone ?? "", p.organization ?? "", p.region ?? "",
      p.gender ?? "", p.ageGroup ?? "", p.roleAtEvent ?? "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    downloadFile(csv, `participants-${eventId.slice(0, 8)}.csv`, "text/csv");
    toast.success(`Exported ${data.length} participants`);
  }

  const stats = {
    total: participants.length,
    attended: participants.filter((p) => p.attended).length,
    women: participants.filter((p) => p.gender?.toLowerCase() === "female").length,
    youth: participants.filter((p) => p.ageGroup === "18-35").length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {canManage && (
          <>
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Upload className="mr-1.5 h-4 w-4" />Import CSV</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <CsvImportDialog eventId={eventId} reload={reload} onClose={() => setImportOpen(false)} />
              </DialogContent>
            </Dialog>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Add participant</Button></DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Add participant</DialogTitle></DialogHeader>
                <form onSubmit={handleAdd} className="space-y-3">
                  <div><Label>Full name *</Label><Input name="full_name" required maxLength={120} className="mt-1" /></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><Label>Email</Label><Input name="email" type="email" maxLength={255} className="mt-1" /></div>
                    <div><Label>Phone</Label><Input name="phone" maxLength={40} className="mt-1" /></div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><Label>Organization</Label><Input name="organization" maxLength={150} className="mt-1" /></div>
                    <div><Label>Region / County</Label><Input name="region" maxLength={100} className="mt-1" /></div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label>Gender</Label><Select name="gender"><SelectTrigger className="mt-1"><SelectValue placeholder="-" /></SelectTrigger>
                        <SelectContent><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem><SelectItem value="other">Other</SelectItem><SelectItem value="prefer_not">Prefer not to say</SelectItem></SelectContent></Select>
                    </div>
                    <div>
                      <Label>Age group</Label><Select name="age_group"><SelectTrigger className="mt-1"><SelectValue placeholder="-" /></SelectTrigger>
                        <SelectContent><SelectItem value="under-18">Under 18</SelectItem><SelectItem value="18-35">18 - 35</SelectItem><SelectItem value="36-50">36 - 50</SelectItem><SelectItem value="50+">50+</SelectItem></SelectContent></Select>
                      </div>
                    <div><Label>Role</Label><Input name="role_at_event" maxLength={100} className="mt-1" placeholder="Speaker, attendee…" /></div>
                  </div>
                  <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button type="submit">Add</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
        {participants.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => exportCsv()}><FileDown className="mr-1.5 h-4 w-4" />Export CSV</Button>
        )}
      </div>

      {participants.length === 0 ? (
        <EmptyState icon={Users} title="No participants yet" hint="Add manually or import a CSV file." />
      ) : (
        <div className="overflow-x-auto overflow-hidden rounded-2xl border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Organization</th>
                <th className="px-5 py-3 font-medium">Region</th><th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Attended</th>{canManage && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {participants.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/20">
                  <td className="px-5 py-3"><div className="font-medium">{p.fullName}</div><div className="text-xs text-muted-foreground">{p.email ?? p.phone ?? ""}</div></td>
                  <td className="px-5 py-3 text-muted-foreground">{p.organization ?? "-" }</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.region ?? "-" }</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.roleAtEvent ?? "-" }</td>
                  <td className="px-5 py-3">
                    <button disabled={!canManage} onClick={() => toggleAttended(p)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${p.attended ? "bg-civic/15 text-civic" : "bg-secondary text-muted-foreground"} ${canManage ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"}`}>
                      {p.attended ? "Yes" : "No"}
                    </button>
                  </td>
                  {canManage && <td className="px-5 py-3 text-right"><button onClick={() => remove(p.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---- CSV Import Dialog ---- */

function CsvImportDialog({ eventId, reload, onClose }: { eventId: string; reload: () => void; onClose: () => void }) {
  const [csvText, setCsvText] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [mode, setMode] = useState<"insert" | "update">("insert");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CsvValidationResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("File too large (max 2 MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => { setCsvText(reader.result as string); setResult(null); };
    reader.readAsText(file);
  }

  async function handleValidate() {
    if (!csvText.trim()) { toast.error("Paste or upload CSV content first"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/participants/import`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText, dryRun: true, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");
      setResult(data);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Validation failed"); }
    setLoading(false);
  }

  async function handleImport() {
    if (!csvText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/participants/import`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText, dryRun: false, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data);
      toast.success(`Imported ${data.inserted} new, updated ${data.updated} participants`);
      reload();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Import failed"); }
    setLoading(false);
  }

  function downloadTemplate() {
    const sample = `${CSV_HEADERS}\n"Jane Doe","jane@example.com","0712345678","KYPW","Nairobi","female","18-35","Facilitator"`;
    downloadFile(sample, "participant-template.csv", "text/csv");
  }

  function downloadRejected() {
    if (!result?.rejected?.length) return;
    const headers = [...CSV_HEADERS.split(","), "_error"];
    const rows = result.rejected.map((r) =>
      [...CSV_HEADERS.split(",").map((h) => `"${String((r.data as Record<string, string | undefined>)[h] ?? "").replace(/"/g, '""')}"`), `"${r.errors.join("; ")}"`].join(",")
    );
    downloadFile([headers.join(","), ...rows].join("\n"), "rejected-rows.csv", "text/csv");
  }

  return (
    <>
      <DialogHeader><DialogTitle><FileSpreadsheet className="mr-2 h-5 w-5 inline" />Import Participants</DialogTitle></DialogHeader>
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={downloadTemplate}><FileDown className="mr-1.5 h-3.5 w-3.5" />Download template</Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="csv-file" className="text-xs">Or upload:</Label>
            <Input id="csv-file" ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="max-w-[180px] h-8 text-xs" />
          </div>
        </div>

        <div><Label>CSV content</Label><Textarea value={csvText} onChange={(e) => { setCsvText(e.target.value); setResult(null); }} rows={6} className="mt-1 font-mono text-xs" placeholder="Paste CSV here or upload a file…" /></div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/70 bg-secondary/20 p-3">
          <div className="flex items-center gap-2">
            <Switch id="dry-run" checked={dryRun} onCheckedChange={setDryRun} />
            <Label htmlFor="dry-run" className="text-sm cursor-pointer">Dry-run mode <span className="text-muted-foreground">(validate only)</span></Label>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Label className="text-sm">Mode:</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as "insert" | "update")}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="insert">Insert new</SelectItem><SelectItem value="update">Update existing by email</SelectItem></SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          {dryRun || !result ? (
            <Button onClick={handleValidate} disabled={loading || !csvText.trim()}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validating…</> : <><AlertTriangle className="mr-2 h-4 w-4" />Validate CSV</>}
            </Button>
          ) : null}
          {!dryRun && result && result.dryRun === false && (
            <Button onClick={handleValidate} disabled={loading}><AlertTriangle className="mr-2 h-4 w-4" />Re-validate</Button>
          )}
          {result && (result.dryRun === true || result.dryRun === false) && (
            <Button variant="outline" onClick={downloadRejected} disabled={!result.rejected?.length}>
              <FileDown className="mr-1.5 h-3.5 w-3.5" />Export rejected ({result.rejectedRows})
            </Button>
          )}
          {result && result.dryRun && result.validRows > 0 && (
            <Button onClick={() => setDryRun(false)}><CheckCircle2 className="mr-2 h-4 w-4" />Proceed with import</Button>
          )}
          {dryRun && result && result.dryRun === false && (
            <p className="text-sm text-muted-foreground self-center">Import complete. Switch to dry-run to re-validate.</p>
          )}
        </div>

        {result && (
          <ScrollArea className="max-h-64">
            <div className="space-y-3 pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ResultCard label="Total rows" value={result.totalRows} />
                <ResultCard label="Valid" value={result.validRows} color="text-green-600" />
                <ResultCard label="Rejected" value={result.rejectedRows} color="text-red-600" />
                {result.inserted !== undefined && <ResultCard label="Inserted" value={result.inserted} color="text-civic" />}
                {result.updated !== undefined && <ResultCard label="Updated" value={result.updated} color="text-civic" />}
              </div>
              {result.rejected.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-red-600 mb-2">Rejected rows</p>
                  <div className="space-y-1.5">
                    {result.rejected.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-2.5 text-xs">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <div><span className="font-semibold text-red-700 dark:text-red-400">Row {r.rowNumber}:</span>{" "}
                          <span className="text-muted-foreground">{r.data.full_name ?? "(no name)"}</span>
                          <div className="mt-1 text-red-600 dark:text-red-400">{r.errors.join("; ")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.importErrors && result.importErrors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-2">Import errors</p>
                  <div className="space-y-1.5">
                    {result.importErrors.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2.5 text-xs">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <div><span className="font-semibold">Row {r.rowNumber}:</span> {r.errors.join("; ")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
      <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
    </>
  );
}

function ResultCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-xl font-semibold ${color ?? ""}`}>{value}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint }: { icon: typeof Users; title: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <Icon className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export { downloadFile, EmptyState };
