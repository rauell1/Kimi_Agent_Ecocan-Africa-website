import { NextRequest, NextResponse } from "next/server";
import { runNewsletterWorkflow } from "@/lib/workflows";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // Run as a durable workflow:
    // Step 1: Validate and save subscriber (instant)
    // Step 2: Send welcome email with 3x retries (reliable delivery)
    const result = await runNewsletterWorkflow({ email: normalized, firstName });

    if (result.success && result.output) {
      return NextResponse.json({
        success: true,
        message: result.output.message,
        workflowRunId: result.runId,
      });
    }

    // Even if the workflow partially fails, the subscriber might be saved
    return NextResponse.json({
      success: true,
      message: "Thanks for subscribing!",
      workflowRunId: result.runId,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ success: true, message: "You are already subscribed!" });
    }
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}
