"use client";

import { useState } from "react";
import { Sparkles, Trash2, FileDown, FileText, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { EventRow, Participant, Metrics, ReportItem } from "../event-detail-types";

interface Props {
  eventId: string; event: EventRow; participants: Participant[]; metrics: Metrics | null;
  reports: ReportItem[]; canManage: boolean; reload: () => void;
}

export function ReportPanel({ eventId, event, participants, metrics, reports, canManage, reload }: Props) {
  const [generating, setGenerating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  async function generateMarkdown() {
    if (!canManage) return;
    setGenerating(true);
    try {
      const sections: string[] = [];

      // Header
      sections.push(`# ${event.title} - Event Report`);
      sections.push(`Generated on ${new Date().toLocaleDateString("en-KE")}\n`);

      // Event Summary
      sections.push(`## Event Summary\n`);
      sections.push(`This ${event.eventType.replace(/_/g, " ")} event was held${event.region ? ` in ${event.region}` : ""}${event.startAt ? ` on ${new Date(event.startAt).toLocaleDateString("en-KE", { month: "long", day: "numeric", year: "numeric" })}` : ""}.\n`);
      sections.push(`**Status:** ${event.status}`);
      sections.push(`${event.description ? "\n" + event.description + "\n" : ""}`);

      // Participant Summary
      if (participants.length > 0) {
        sections.push(`## Participant Summary\n`);
        sections.push(`- **Total registered:** ${participants.length}`);
        sections.push(`- **Attended:** ${participants.filter((p) => p.attended).length}`);
        sections.push(`- **Female:** ${participants.filter((p) => p.gender?.toLowerCase() === "female").length}`);
        sections.push(`- **Youth (18-35):** ${participants.filter((p) => p.ageGroup === "18-35").length}`);
        sections.push("");
        sections.push("### Participant List\n");
        sections.push("| Name | Email | Organization | Region | Gender | Age Group | Attended |");
        sections.push("|------|-------|-------------|--------|--------|-----------|----------|");
        for (const p of participants) {
          sections.push(`| ${p.fullName} | ${p.email ?? ""} | ${p.organization ?? ""} | ${p.region ?? ""} | ${p.gender ?? ""} | ${p.ageGroup ?? ""} | ${p.attended ? "Yes" : "No"} |`);
        }
        sections.push("");
      }

      // Impact Metrics
      if (metrics) {
        sections.push(`## Impact Metrics\n`);
        sections.push(`| Metric | Value |`);
        sections.push(`|--------|-------|`);
        sections.push(`| Total Participants | ${metrics.participantsTotal} |`);
        sections.push(`| Youth Count | ${metrics.youthCount} |`);
        sections.push(`| Women Count | ${metrics.womenCount} |`);
        sections.push(`| Counties Reached | ${metrics.countiesReached} |`);
        sections.push(`| Water Points Assessed | ${metrics.waterPointsAssessed} |`);
        sections.push(`| Communities Engaged | ${metrics.communitiesEngaged} |`);
        sections.push(`| Partnerships Formed | ${metrics.partnershipsFormed} |`);
        sections.push(`| Budget Spent | ${metrics.currency} ${metrics.budgetSpent.toLocaleString()} |`);
        sections.push("");
        if (metrics.narrativeSummary) {
          sections.push(`### Narrative Summary\n${metrics.narrativeSummary}\n`);
        }
      }

      const report = sections.join("\n");

      const res = await fetch(`/api/events/${eventId}/reports`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: report }),
      });
      if (!res.ok) throw new Error();
      toast.success("Report generated"); reload();
    } catch { toast.error("Failed to generate report"); }
    setGenerating(false);
  }

  async function generatePdf() {
    setGeneratingPdf(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      const addBrandedHeader = (pageNum: number, totalPages: number) => {
        // Top accent bar
        doc.setFillColor(6, 182, 212); // cyan-500
        doc.rect(0, 0, pageWidth, 3, "F");

        // Logo area
        doc.setFillColor(6, 182, 212);
        doc.roundedRect(margin, 8, 8, 8, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.text("W", margin + 4, 13.5, { align: "center" });

        // Organization name
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("KYPW", margin + 12, 15);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text("Kenya Young Professionals in Water", margin + 12, 20);

        // Header line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, 24, pageWidth - margin, 24);
        yPos = 28;

        // Page number in footer
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
        doc.text("Confidential - KYPW Impact Report", margin, pageHeight - 8);

        // Bottom accent bar
        doc.setFillColor(6, 182, 212);
        doc.rect(0, pageHeight - 3, pageWidth, 3, "F");
      };

      // We need to know total pages for headers, so we'll add headers post-hoc
      // Build content first without page numbers, then count pages

      // Helper to check if we need a new page
      const checkPageBreak = (needed: number) => {
        if (yPos + needed > pageHeight - 20) {
          doc.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // === TITLE PAGE ===
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, pageWidth, 3, "F");

      yPos = 80;
      doc.setFontSize(8);
      doc.setTextColor(6, 182, 212);
      doc.setFont("helvetica", "bold");
      doc.text("IMPACT REPORT", margin, yPos);

      yPos += 12;
      doc.setFontSize(22);
      doc.setTextColor(30, 30, 30);
      doc.text(event.title, margin, yPos, { maxWidth: contentWidth });

      yPos += 15;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`${event.eventType.replace(/_/g, " ").toUpperCase()} · ${event.status.toUpperCase()}`, margin, yPos);

      if (event.startAt || event.region) {
        yPos += 8;
        const details: string[] = [];
        if (event.region) details.push(event.region);
        if (event.startAt) details.push(new Date(event.startAt).toLocaleDateString("en-KE", { month: "long", day: "numeric", year: "numeric" }));
        doc.text(details.join(" · "), margin, yPos);
      }

      yPos += 15;
      doc.setDrawColor(6, 182, 212);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, margin + 40, yPos);

      yPos += 10;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated on ${new Date().toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, margin, yPos);

      if (event.description) {
        yPos += 10;
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const lines = doc.splitTextToSize(event.description, contentWidth);
        doc.text(lines, margin, yPos);
      }

      doc.setFillColor(6, 182, 212);
      doc.rect(0, pageHeight - 3, pageWidth, 3, "F");

      // === SECTION: Executive Summary ===
      doc.addPage();
      yPos = margin;

      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, pageWidth, 3, "F");

      yPos = 32;
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.text("1. Executive Summary", margin, yPos);
      yPos += 10;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);

      const summaryLines = [
        `This impact report summarizes the outcomes and key metrics for "${event.title}", a ${event.eventType.replace(/_/g, " ")} event ${event.region ? `held in ${event.region}` : ""}${event.startAt ? ` on ${new Date(event.startAt).toLocaleDateString("en-KE")}` : ""}.`,
        "",
        `Event Status: ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}`,
        `Total Registered Participants: ${participants.length}`,
        `Attendance Rate: ${participants.length > 0 ? Math.round((participants.filter((p) => p.attended).length / participants.length) * 100) : 0}%`,
        `Female Participation: ${participants.length > 0 ? Math.round((participants.filter((p) => p.gender?.toLowerCase() === "female").length / participants.length) * 100) : 0}%`,
        `Youth Participation (18-35): ${participants.length > 0 ? Math.round((participants.filter((p) => p.ageGroup === "18-35").length / participants.length) * 100) : 0}%`,
      ];

      if (metrics?.narrativeSummary) {
        summaryLines.push("", "Narrative:", metrics.narrativeSummary);
      }

      const summaryText = doc.splitTextToSize(summaryLines.join("\n"), contentWidth);
      doc.text(summaryText, margin, yPos);
      yPos += summaryText.length * 4.5;

      // === SECTION: Impact Metrics ===
      checkPageBreak(60);
      yPos += 8;
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.text("2. Impact Metrics", margin, yPos);
      yPos += 10;

      if (metrics) {
        const metricsData = [
          ["Total Participants", String(metrics.participantsTotal)],
          ["Youth (18-35)", String(metrics.youthCount)],
          ["Women", String(metrics.womenCount)],
          ["Counties Reached", String(metrics.countiesReached)],
          ["Water Points Assessed", String(metrics.waterPointsAssessed)],
          ["Communities Engaged", String(metrics.communitiesEngaged)],
          ["Partnerships Formed", String(metrics.partnershipsFormed)],
          ["Budget Spent", `${metrics.currency} ${metrics.budgetSpent.toLocaleString()}`],
        ];

        autoTable(doc, {
          startY: yPos,
          margin: { left: margin, right: margin },
          head: [["Metric", "Value"]],
          body: metricsData,
          theme: "grid",
          headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
          bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
        });

        yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }

      // === SECTION: Gender & Age Distribution ===
      checkPageBreak(60);
      yPos += 4;
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.text("3. Demographics", margin, yPos);
      yPos += 10;

      const genderFemale = participants.filter((p) => p.gender?.toLowerCase() === "female").length;
      const genderMale = participants.filter((p) => p.gender?.toLowerCase() === "male").length;
      const genderOther = participants.filter((p) => p.gender && !["male", "female"].includes(p.gender.toLowerCase())).length;
      const genderUnknown = participants.filter((p) => !p.gender).length;

      autoTable(doc, {
        startY: yPos,
        margin: { left: margin, right: margin },
        head: [["Category", "Female", "Male", "Other", "Unknown", "Total"]],
        body: [["Gender", String(genderFemale), String(genderMale), String(genderOther), String(genderUnknown), String(participants.length)]],
        theme: "grid",
        headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // Age distribution
      const ageData = [
        ["Under 18", String(participants.filter((p) => p.ageGroup === "under-18").length)],
        ["18-35", String(participants.filter((p) => p.ageGroup === "18-35").length)],
        ["36-50", String(participants.filter((p) => p.ageGroup === "36-50").length)],
        ["50+", String(participants.filter((p) => p.ageGroup === "50+").length)],
        ["Not specified", String(participants.filter((p) => !p.ageGroup).length)],
      ];

      autoTable(doc, {
        startY: yPos,
        margin: { left: margin, right: margin },
        head: [["Age Group", "Count"]],
        body: ageData,
        theme: "grid",
        headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

      // === SECTION: Participant List ===
      doc.addPage();
      yPos = margin;

      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, pageWidth, 3, "F");

      yPos = 32;
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.text("4. Participant List", margin, yPos);
      yPos += 4;

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "normal");
      doc.text(`${participants.length} participants registered`, margin, yPos);
      yPos += 8;

      if (participants.length > 0) {
        const participantRows = participants.map((p) => [
          p.fullName,
          p.email ?? "-" ,
          p.organization ?? "-" ,
          p.region ?? "-" ,
          p.gender ?? "-" ,
          p.ageGroup ?? "-" ,
          p.attended ? "Yes" : "No",
        ]);

        autoTable(doc, {
          startY: yPos,
          margin: { left: margin, right: margin, bottom: 25 },
          head: [["Name", "Email", "Organization", "Region", "Gender", "Age", "Attended"]],
          body: participantRows,
          theme: "grid",
          headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
          bodyStyles: { fontSize: 7, textColor: [60, 60, 60], cellPadding: 2 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          columnStyles: {
            0: { cellWidth: 35, fontStyle: "bold" },
            1: { cellWidth: 35 },
            2: { cellWidth: 28 },
            3: { cellWidth: 22 },
            4: { cellWidth: 18 },
            5: { cellWidth: 15 },
            6: { cellWidth: 15 },
          },
          didDrawPage: (data) => {
            // Add header and footer to each page of the table
            doc.setFillColor(6, 182, 212);
            doc.rect(0, 0, pageWidth, 3, "F");

            doc.setFillColor(6, 182, 212);
            doc.roundedRect(margin, 8, 8, 8, 2, 2, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.text("W", margin + 4, 13.5, { align: "center" });
            doc.setTextColor(30, 30, 30);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("KYPW", margin + 12, 15);
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            doc.text("Kenya Young Professionals in Water", margin + 12, 20);
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, 24, pageWidth - margin, 24);

            // Footer
            doc.setFillColor(6, 182, 212);
            doc.rect(0, pageHeight - 3, pageWidth, 3, "F");
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text("Confidential - KYPW Impact Report", margin, pageHeight - 8);
            doc.text(`Participant List - ${event.title}`, pageWidth - margin, pageHeight - 8, { align: "right" });
          },
        });
      }

      // Add page numbers to all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        // Add page number to pages that don't already have one from autoTable
        if (i === 1 || i === 2) {
          // Title page and exec summary don't have footer from autoTable
          doc.setFillColor(6, 182, 212);
          doc.rect(0, pageHeight - 3, pageWidth, 3, "F");
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text("Confidential - KYPW Impact Report", margin, pageHeight - 8);
          doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
        }
      }

      // Generate blob URL for preview
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfPreviewOpen(true);

      // Also download
      doc.save(`${event.title.replace(/[^\w]+/g, "-").toLowerCase()}-impact-report.pdf`);
      toast.success("PDF report generated");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF report");
    }
    setGeneratingPdf(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this report?")) return;
    await fetch(`/api/events/${eventId}/reports?reportId=${id}`, { method: "DELETE" }); reload();
  }

  function download(r: ReportItem) {
    const blob = new Blob([r.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${event.title.replace(/[^\w]+/g, "-").toLowerCase()}-report-${r.createdAt.slice(0, 10)}.md`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Generation Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card to-secondary/30 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-civic/15">
              <FileText className="h-5 w-5 text-civic" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-sm font-semibold">Markdown Report</h3>
              <p className="mt-1 text-xs text-muted-foreground">Generate a structured markdown report with participant tables and metrics.</p>
              <Button className="mt-3" size="sm" onClick={generateMarkdown} disabled={generating || !canManage}>
                {generating ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Generating…</> : <><Sparkles className="mr-1.5 h-3.5 w-3.5" />Generate .md</>}
              </Button>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card to-secondary/30 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-civic/15">
              <Download className="h-5 w-5 text-civic" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-sm font-semibold">PDF Impact Report</h3>
              <p className="mt-1 text-xs text-muted-foreground">Branded PDF with header, footer, sections, pagination, and participant table with page breaks.</p>
              <Button className="mt-3" size="sm" onClick={generatePdf} disabled={generatingPdf || !canManage}>
                {generatingPdf ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Generating…</> : <><Download className="mr-1.5 h-3.5 w-3.5" />Generate PDF</>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Reports */}
      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-display text-xl font-semibold">No reports yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Generate your first report using the buttons above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold">Saved Reports</h3>
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/70 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{new Date(r.createdAt).toLocaleString("en-KE")}</p>
                  <Badge variant="outline" className="text-[10px]">Markdown</Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => download(r)}><FileDown className="mr-1.5 h-3.5 w-3.5" />Download .md</Button>
                  {canManage && <button onClick={() => remove(r.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </div>
              <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap p-5 font-sans text-sm leading-relaxed">{r.content}</pre>
            </div>
          ))}
        </div>
      )}

      {/* PDF Preview Dialog */}
      <Dialog open={pdfPreviewOpen} onOpenChange={(o) => { setPdfPreviewOpen(o); if (!o && pdfUrl) URL.revokeObjectURL(pdfUrl); }}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader><DialogTitle>PDF Preview</DialogTitle></DialogHeader>
          {pdfUrl && <iframe src={pdfUrl} className="w-full h-full rounded-lg border" title="PDF Preview" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
