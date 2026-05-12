/**
 * KYPW Workflows — Barrel Export
 *
 * Durable execution engine for KYPW backend processes.
 * Provides step isolation, automatic retries, and full observability.
 *
 * Maps 1:1 to Vercel Workflows programming model.
 * Swap to official `workflow` npm package when deploying to Vercel.
 */

export { runWorkflow, runWorkflowBackground, getWorkflowRun, listWorkflowRuns, getWorkflowStats } from "./engine";
export type { StepDefinition, WorkflowResult } from "./engine";

export { runAiReportWorkflow } from "./ai-report";
export { runNewsletterWorkflow, runNewsletterBackground } from "./newsletter";
export { runContactWorkflow } from "./contact";
export { runEventBroadcastWorkflow, runEventBroadcastBackground } from "./event-broadcast";
export type { EventBroadcastInput, BroadcastResult } from "./event-broadcast";
export { generateICSInvite, type CalendarInviteParams } from "@/lib/calendar";
