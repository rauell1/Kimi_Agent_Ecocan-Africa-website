/**
 * Contact Notification Workflow
 *
 * Durable workflow for handling contact form submissions.
 *
 * - Step 1: Save message to database (critical — must succeed)
 * - Step 2: Send email notification to KYPW team (retries if Resend is down)
 */

import { db } from "@/lib/db";
import { runWorkflowBackground, type StepDefinition } from "./engine";

interface ContactInput {
  name: string;
  email: string;
  message: string;
}

/**
 * Step 1: Save contact message to database.
 */
async function saveMessage(input: ContactInput) {
  const message = await db.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      message: input.message,
    },
  });

  return { messageId: message.id, savedAt: message.createdAt };
}

/**
 * Step 2: Send email notification to KYPW team.
 * Retries 3 times. If this fails, the message is still saved in DB.
 */
async function sendNotification(input: ContactInput & { messageId: string }) {
  const { sendContactNotification } = await import("@/lib/email");
  const result = await sendContactNotification({
    name: input.name,
    email: input.email,
    message: input.message,
  });

  if (!result.success) {
    throw new Error(`Failed to send contact notification: ${result.error ?? "unknown error"}`);
  }

  return { emailSent: true, emailId: result.id };
}

// ── Public API ─────────────────────────────────────────

/**
 * Run the contact notification workflow in the background.
 * Message is saved immediately; email notification is sent reliably.
 * Returns runId for tracking.
 */
export function runContactWorkflow(input: ContactInput) {
  return runWorkflowBackground("contact.notify", input, [
    {
      name: "save-message",
      fn: saveMessage,
      retries: 2,
      retryDelayMs: 500,
    },
    {
      name: "send-email-notification",
      fn: async (prev) => sendNotification({ ...input, ...(prev as { messageId: string }) }),
      retries: 3,
      retryDelayMs: 2000,
      continueOnError: true, // Message is saved — email failure is non-critical
    },
  ]);
}
