import { NextRequest, NextResponse } from "next/server";
import { runContactWorkflow } from "@/lib/workflows";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
    }

    // Run as a durable workflow: saves message to DB first, then sends email with retries
    const { runId } = runContactWorkflow({ name, email, message });

    return NextResponse.json({ success: true, workflowRunId: runId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
