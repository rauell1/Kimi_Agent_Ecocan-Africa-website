/**
 * AI Report Generation Workflow
 *
 * Durable multi-step workflow for generating AI impact reports.
 *
 * Why this is a workflow instead of a single request:
 * - LLM calls can timeout or fail transiently → automatic retry with backoff
 * - Event data fetch and report save are isolated → data loss prevention
 * - Full audit trail of every step → debugging and observability
 * - If the server restarts, step state is preserved in DB
 */

import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { runWorkflow, type StepDefinition } from "./engine";

const SYSTEM_PROMPT = `You are a professional impact report writer for KYPW (Kenya Youth Parliament for Water), a youth-led, non-profit network dedicated to water security and sanitation across Kenya, and the officially recognised Kenyan national chapter of the World Youth Parliament for Water (WYPW) and the African Youth Parliament for Water (AYPW).

Your task is to write a donor-ready narrative impact report in Markdown format based on the event data provided. The report should be:

1. **Professional and compelling** — Write in a tone suitable for donors, government partners, and stakeholders.
2. **Data-driven** — Incorporate all metrics, participant demographics, and event details naturally into the narrative.
3. **Well-structured** — Use clear Markdown headings (##, ###), bullet points, and tables where appropriate.
4. **Impact-focused** — Emphasise outcomes, community reach, partnerships, and the broader significance of the event within the KYPW-WYPW-AYPW network.
5. **Kenyan context** — Reference counties, regions, and local relevance where applicable.

Report structure:
- **Title**: "# {Event Title} — AI Impact Report"
- **Executive Summary**: A 2-3 paragraph overview of the event, its purpose, and key outcomes
- **Event Overview**: Date, location, type, and description
- **Participant Demographics**: Gender breakdown, youth representation, geographic spread
- **Impact Metrics**: All available metrics presented in a narrative format with a summary table
- **Key Outcomes and Achievements**: Highlight significant results, partnerships formed, communities engaged
- **Recommendations**: Forward-looking suggestions based on the data
- **Conclusion**: A strong closing statement about the event's contribution to KYPW's mission and SDG 6

Do NOT fabricate data. Only use the information provided. If a field is missing, omit it gracefully.`;

interface AiReportInput {
  eventId: string;
  userId: string;
}

interface AiReportOutput {
  report: { id: string; content: string; model: string };
}

/**
 * Build the comprehensive event data object from the database.
 * This is isolated as its own step so failures here don't affect the LLM call.
 */
async function fetchEventData(eventId: string) {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      participants: true,
      metrics: true,
      documentation: { orderBy: { createdAt: "desc" }, take: 10 },
      docRequirements: true,
    },
  });

  if (!event) throw new Error(`Event not found: ${eventId}`);

  const participantStats = {
    total: event.participants.length,
    attended: event.participants.filter((p) => p.attended).length,
    female: event.participants.filter((p) => p.gender?.toLowerCase() === "female").length,
    male: event.participants.filter((p) => p.gender?.toLowerCase() === "male").length,
    youth: event.participants.filter((p) => p.ageGroup === "18-35").length,
    regions: [...new Set(event.participants.map((p) => p.region).filter(Boolean))],
    organizations: [...new Set(event.participants.map((p) => p.organization).filter(Boolean))],
  };

  return {
    eventId: event.id,
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    status: event.status,
    startDate: event.startAt
      ? new Date(event.startAt).toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
      : null,
    endDate: event.endAt
      ? new Date(event.endAt).toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
      : null,
    region: event.region,
    locationName: event.locationName,
    locationType: event.locationType,
    participants: participantStats,
    participantList: event.participants.map((p) => ({
      fullName: p.fullName,
      email: p.email,
      organization: p.organization,
      region: p.region,
      gender: p.gender,
      ageGroup: p.ageGroup,
      attended: p.attended,
    })),
    metrics: event.metrics
      ? {
          participantsTotal: event.metrics.participantsTotal,
          youthCount: event.metrics.youthCount,
          womenCount: event.metrics.womenCount,
          countiesReached: event.metrics.countiesReached,
          waterPointsAssessed: event.metrics.waterPointsAssessed,
          communitiesEngaged: event.metrics.communitiesEngaged,
          partnershipsFormed: event.metrics.partnershipsFormed,
          budgetSpent: event.metrics.budgetSpent,
          currency: event.metrics.currency,
          narrativeSummary: event.metrics.narrativeSummary,
        }
      : null,
    documentationCount: event.documentation.length,
    documentationTypes: [...new Set(event.documentation.map((d) => d.type))],
    generatedAt: new Date().toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  };
}

/**
 * Call the LLM to generate the report.
 * Retries 3 times with exponential backoff — handles transient API failures.
 */
async function generateReport(eventData: unknown): Promise<string> {
  const data = eventData as ReturnType<typeof fetchEventData> extends Promise<infer T> ? T : never;
  const userPrompt = `Generate a comprehensive donor-ready impact report for the following KYPW event data:\n\n${JSON.stringify(data, null, 2)}\n\nWrite the report in professional Markdown format following the structure described in your system instructions.`;

  const zai = await ZAI.create();
  const response = await zai.chat.completions.create({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const message = (response as Record<string, unknown>).choices?.[0] as Record<string, unknown> | undefined;
  const report =
    ((message?.message as Record<string, unknown>)?.content as string) ??
    (response as Record<string, unknown>).content as string ??
    JSON.stringify(response);

  if (!report || report.length < 100) {
    throw new Error(`AI returned insufficient content (${report?.length ?? 0} chars). The model may be unavailable.`);
  }

  return report;
}

/**
 * Save the generated report to the database and log audit trail.
 */
async function saveReport(params: { reportContent: string; eventId: string; userId: string }) {
  const savedReport = await db.eventReport.create({
    data: {
      eventId: params.eventId,
      content: params.reportContent,
      model: "ai",
    },
  });

  // Audit log
  const { logAudit } = await import("@/lib/audit");
  await logAudit({
    eventId: params.eventId,
    userId: params.userId,
    action: "report.create",
    entityType: "EventReport",
    entityId: savedReport.id,
    after: { model: "ai", contentLength: params.reportContent.length },
  });

  return savedReport;
}

// ── Public API ─────────────────────────────────────────

/**
 * Run the AI report generation workflow.
 * Returns the run ID immediately; the workflow executes steps with full durability.
 */
export async function runAiReportWorkflow(input: AiReportInput) {
  return runWorkflow<AiReportOutput>("ai-report", input, [
    {
      name: "fetch-event-data",
      fn: async (inp) => fetchEventData((inp as AiReportInput).eventId),
      retries: 2,
      retryDelayMs: 500,
    },
    {
      name: "call-llm",
      fn: generateReport,
      retries: 3,
      retryDelayMs: 2000, // LLM calls may need longer backoff
    },
    {
      name: "save-report",
      fn: async (params) => {
        const p = params as { reportContent: string };
        const inp = input; // closure over original input
        return saveReport({ reportContent: p.reportContent, eventId: inp.eventId, userId: inp.userId });
      },
      retries: 2,
      retryDelayMs: 1000,
    },
  ]);
}
