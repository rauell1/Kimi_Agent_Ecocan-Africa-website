import { NextRequest, NextResponse } from "next/server";
import { getWorkflowRun, listWorkflowRuns, getWorkflowStats } from "@/lib/workflows";

/** GET /api/workflows?workflow=ai-report&status=completed&limit=20 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Single run lookup
    const runId = searchParams.get("runId");
    if (runId) {
      const run = await getWorkflowRun(runId);
      if (!run) return NextResponse.json({ error: "Workflow run not found" }, { status: 404 });
      return NextResponse.json({ run });
    }

    // Stats endpoint
    if (searchParams.get("stats") === "true") {
      const stats = await getWorkflowStats();
      return NextResponse.json({ stats });
    }

    // List runs with optional filters
    const workflow = searchParams.get("workflow") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const runs = await listWorkflowRuns({ workflow, status, limit, offset });
    return NextResponse.json({ runs });
  } catch (error) {
    console.error("Workflows fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch workflow data" }, { status: 500 });
  }
}
