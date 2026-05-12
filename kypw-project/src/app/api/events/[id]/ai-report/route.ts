import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { runAiReportWorkflow } from "@/lib/workflows";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  const session = await db.userSession.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check event exists
    const event = await db.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Run as a durable workflow with step isolation and automatic retries:
    // Step 1: Fetch event data from DB (retries 2x)
    // Step 2: Call LLM for report generation (retries 3x with exponential backoff)
    // Step 3: Save report to DB + audit log (retries 2x)
    const result = await runAiReportWorkflow({ eventId: id, userId: user.id });

    if (result.success && result.output?.report) {
      return NextResponse.json({ report: result.output.report, workflowRunId: result.runId }, { status: 201 });
    }

    return NextResponse.json(
      {
        error: result.error ?? "Failed to generate AI report. The workflow completed but produced no output.",
        workflowRunId: result.runId,
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("AI report workflow error:", error);
    return NextResponse.json({ error: "Failed to generate AI report" }, { status: 500 });
  }
}
