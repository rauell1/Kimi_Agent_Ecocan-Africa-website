/**
 * Newsletter Subscribe Workflow
 *
 * Durable multi-step workflow for newsletter subscriptions.
 *
 * Why this is a workflow:
 * - Email sending can fail (Resend downtime, rate limits) → automatic retry
 * - Subscriber data is saved FIRST, then email is sent → no data loss
 * - Re-subscription flow is atomic → consistent state
 * - Full audit trail → debugging delivery issues
 */

import { db } from "@/lib/db";
import { runWorkflow, runWorkflowBackground, type StepDefinition } from "./engine";

interface NewsletterInput {
  email: string;
  firstName?: string;
}

interface NewsletterOutput {
  status: "subscribed" | "re-subscribed" | "already-subscribed";
  message: string;
}

/**
 * Step 1: Validate and save subscriber to database.
 * This step is the critical one — it must succeed before anything else.
 */
async function saveSubscriber(input: NewsletterInput): Promise<NewsletterOutput> {
  const normalized = input.email.trim().toLowerCase();

  const existing = await db.newsletterSubscriber.findUnique({
    where: { email: normalized },
  });

  if (existing) {
    if (existing.status === "active") {
      return { status: "already-subscribed", message: "You are already subscribed!" };
    }
    // Re-subscribe
    await db.newsletterSubscriber.update({
      where: { id: existing.id },
      data: { status: "active", unsubscribedAt: null, firstName: input.firstName?.trim() || null },
    });
    return { status: "re-subscribed", message: "Welcome back! You have been re-subscribed." };
  }

  await db.newsletterSubscriber.create({
    data: {
      email: normalized,
      firstName: input.firstName?.trim() || null,
      source: "website",
      status: "active",
    },
  });

  return { status: "subscribed", message: "Thanks for subscribing!" };
}

/**
 * Step 2: Send welcome email.
 * Runs AFTER the subscriber is saved. Retries 3 times with backoff.
 * If this fails, the subscriber is still saved — no data loss.
 */
async function sendWelcomeEmail(subscriptionResult: NewsletterOutput & { email: string; firstName?: string }) {
  const { sendNewsletterWelcome } = await import("@/lib/email");
  const result = await sendNewsletterWelcome({
    email: subscriptionResult.email,
    firstName: subscriptionResult.firstName,
  });

  if (!result.success) {
    throw new Error(`Failed to send welcome email: ${result.error ?? "unknown error"}`);
  }

  return { emailSent: true, emailId: result.id };
}

// ── Public API ─────────────────────────────────────────

/**
 * Run the newsletter subscribe workflow.
 * Subscriber is saved first, then welcome email is sent reliably.
 */
export async function runNewsletterWorkflow(input: NewsletterInput) {
  return runWorkflow<NewsletterOutput>("newsletter.subscribe", input, [
    {
      name: "save-subscriber",
      fn: saveSubscriber,
      retries: 2,
      retryDelayMs: 500,
    },
    {
      name: "send-welcome-email",
      fn: async (prevResult) =>
        sendWelcomeEmail({
          ...((prevResult as NewsletterOutput) ?? {}),
          email: input.email,
          firstName: input.firstName,
        }),
      retries: 3,
      retryDelayMs: 2000,
      continueOnError: true, // Don't fail the workflow if email fails — subscriber is already saved
    },
  ]);
}

/**
 * Run newsletter workflow in the background (fire-and-forget).
 * Use this when you want to return a response immediately
 * and let the email send happen in the background.
 */
export function runNewsletterBackground(input: NewsletterInput) {
  return runWorkflowBackground<NewsletterOutput>("newsletter.subscribe", input, [
    {
      name: "save-subscriber",
      fn: saveSubscriber,
      retries: 2,
      retryDelayMs: 500,
    },
    {
      name: "send-welcome-email",
      fn: async (prevResult) =>
        sendWelcomeEmail({
          ...((prevResult as NewsletterOutput) ?? {}),
          email: input.email,
          firstName: input.firstName,
        }),
      retries: 3,
      retryDelayMs: 2000,
      continueOnError: true,
    },
  ]);
}
