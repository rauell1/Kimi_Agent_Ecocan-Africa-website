/**
 * Event Broadcast Workflow
 *
 * Durable multi-step workflow for broadcasting a published event to all
 * active newsletter subscribers via personalized email with .ics attachment.
 *
 * Why this is a workflow:
 * - Email sending can fail (Resend downtime, rate limits) → automatic retry
 * - Batched sends (50 per batch) → no overwhelming of email service
 * - Per-subscriber tracking → know exactly who got the invite
 * - Full audit trail → debugging delivery issues
 *
 * Steps:
 *   1. fetch-event        — fetch event details from DB
 *   2. fetch-subscribers  — get all active newsletter subscribers
 *   3. send-invites       — batch-send personalized emails with .ics attachments
 */

import { db } from "@/lib/db";
import { runWorkflow, runWorkflowBackground, type StepDefinition } from "./engine";
import { generateICSInvite, type CalendarInviteParams } from "@/lib/calendar";

// ── Types ──────────────────────────────────────────────

export interface EventBroadcastInput {
  eventId: string;
  userId: string; // who triggered the broadcast
}

interface EventData {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  eventType: string;
  startAt: Date | null;
  endAt: Date | null;
  region: string | null;
  locationName: string | null;
  createdBy: string | null;
}

interface SubscriberData {
  id: string;
  email: string;
  firstName: string | null;
}

interface SendBatchInput {
  event: EventData;
  subscribers: SubscriberData[];
  organizerName: string;
  organizerEmail: string;
}

interface BroadcastResult {
  totalSubscribers: number;
  sent: number;
  failed: number;
  failures: Array<{ email: string; error: string }>;
}

// ── Step Implementations ───────────────────────────────

/**
 * Step 1: Fetch the event details from the database.
 */
async function fetchEvent(input: EventBroadcastInput): Promise<EventData> {
  const event = await db.event.findUnique({
    where: { id: input.eventId },
  });

  if (!event) {
    throw new Error(`Event not found: ${input.eventId}`);
  }

  return event;
}

/**
 * Step 2: Fetch all active newsletter subscribers.
 */
async function fetchSubscribers(
  _prev: EventData,
): Promise<{ event: EventData; subscribers: SubscriberData[]; organizerName: string; organizerEmail: string }> {
  // Fetch subscribers
  const subscribers = await db.newsletterSubscriber.findMany({
    where: { status: "active" },
    select: { id: true, email: true, firstName: true },
    orderBy: { subscribedAt: "asc" },
  });

  // Get the event from previous step — we need it passed through
  // Since the engine passes lastOutput, we access it from the prev step context
  // But actually, the engine passes the output of the previous step
  // So we need to restructure: let's pass event ID through
  // Actually, looking at the engine more carefully: `lastOutput` is the output of the previous step.
  // So `_prev` IS the EventData from step 1. We just can't type it properly here.
  // We'll use a workaround: re-fetch the event from the input context.
  // Better approach: use the previous step output properly.

  // We'll re-fetch because the typing doesn't flow through in a generic way
  const prevEvent = _prev as unknown as EventData;

  // Determine organizer info
  let organizerName = "Kenya Youth Parliament for Water";
  let organizerEmail = "kypwyouthforwater@gmail.com";

  if (prevEvent.createdBy) {
    const creator = await db.user.findUnique({
      where: { id: prevEvent.createdBy },
    });
    if (creator) {
      organizerName = creator.name || organizerName;
      organizerEmail = creator.email;
    }
  }

  return {
    event: prevEvent,
    subscribers,
    organizerName,
    organizerEmail,
  };
}

/**
 * Step 3: Send personalized email invites in batches of 50.
 * Each email includes a branded HTML body and a .ics calendar attachment.
 */
async function sendInvites(
  input: SendBatchInput & { organizerName: string; organizerEmail: string },
): Promise<BroadcastResult> {
  const { sendEmail, kypwEmailTemplate } = await import("@/lib/email");

  const {
    event,
    subscribers,
    organizerName,
    organizerEmail,
  } = input as {
    event: EventData;
    subscribers: SubscriberData[];
    organizerName: string;
    organizerEmail: string;
  };

  const result: BroadcastResult = {
    totalSubscribers: subscribers.length,
    sent: 0,
    failed: 0,
    failures: [],
  };

  const BATCH_SIZE = 50;

  // Process in batches
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    // Send emails concurrently within a batch
    const batchResults = await Promise.allSettled(
      batch.map(async (subscriber) => {
        const attendeeName = subscriber.firstName || subscriber.email.split("@")[0] || "Friend";

        // Build event URL
        const eventUrl = event.slug
          ? `https://rauell.systems/events/${event.slug}`
          : `https://rauell.systems/events/${event.id}`;

        // Generate personalized .ics invite
        const startDate = event.startAt ?? new Date();
        const endDate = event.endAt ?? undefined;

        const icsParams: CalendarInviteParams = {
          title: event.title,
          description: event.description ?? "",
          startDate,
          endDate,
          location: event.locationName ?? undefined,
          region: event.region ?? undefined,
          organizerName,
          organizerEmail,
          attendeeName,
          attendeeEmail: subscriber.email,
          eventType: event.eventType || undefined,
          eventId: event.id,
          eventUrl,
        };

        const icsContent = generateICSInvite(icsParams);
        const filename = event.slug
          ? `kypw-${event.slug}.ics`
          : `kypw-${event.id.slice(0, 8)}.ics`;

        // Format date for display
        const dateOpts: Intl.DateTimeFormatOptions = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Africa/Nairobi",
          hour12: true,
        };
        const dateDisplay = startDate.toLocaleString("en-KE", dateOpts);

        // Build location display
        const locationParts: string[] = [];
        if (event.region) locationParts.push(event.region);
        if (event.locationName) locationParts.push(event.locationName);
        const locationDisplay = locationParts.length > 0
          ? locationParts.join(", ")
          : "To be announced";

        // Build branded HTML email body
        const typeLabel =
          event.eventType && event.eventType !== "workshop"
            ? event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)
            : "Workshop";

        const emailContent = `
          <h2 style="margin:0 0 8px; font-size:20px; color:#1a3a5c;">You're Invited!</h2>
          <p style="font-size:14px; line-height:1.6; color:#374151;">
            Dear ${attendeeName},
          </p>
          <p style="font-size:14px; line-height:1.6; color:#374151;">
            The <strong>Kenya Youth Parliament for Water (KYPW)</strong> — the official Kenyan national chapter of the
            <strong>World Youth Parliament for Water (WYPW)</strong> and the
            <strong>African Youth Parliament for Water (AYPW)</strong> —
            warmly invites you to:
          </p>
          <div style="background:linear-gradient(135deg,#1a3a5c,#2a5070); border-radius:8px; padding:20px; margin:16px 0;">
            <h1 style="margin:0 0 8px; font-size:18px; color:#ffffff;">${event.title}</h1>
            <span style="display:inline-block; background:rgba(212,168,83,0.2); color:#d4a853; padding:4px 10px; border-radius:4px; font-size:12px; font-weight:600;">${typeLabel}</span>
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; margin:16px 0; border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0; border-bottom:1px solid #e5e7eb; color:#6b7280; font-size:13px; width:100px;">Date</td>
              <td style="padding:10px 0; border-bottom:1px solid #e5e7eb; font-size:14px; font-weight:500;">${dateDisplay}</td>
            </tr>
            <tr>
              <td style="padding:10px 0; border-bottom:1px solid #e5e7eb; color:#6b7280; font-size:13px;">Location</td>
              <td style="padding:10px 0; border-bottom:1px solid #e5e7eb; font-size:14px; font-weight:500;">${locationDisplay}</td>
            </tr>
          </table>
          ${
            event.description
              ? `<p style="font-size:14px; line-height:1.6; color:#374151;">
                  ${event.description.length > 500 ? event.description.slice(0, 500) + "..." : event.description}
                </p>`
              : ""
          }
          <p style="font-size:14px; line-height:1.6; color:#374151;">
            This event advances <strong>Sustainable Development Goal 6</strong> (Clean Water and Sanitation)
            as part of KYPW's civic action for water security across Kenya.
          </p>
          <div style="text-align:center; margin:24px 0;">
            <a href="${eventUrl}" style="display:inline-block; background-color:#1a3a5c; color:#ffffff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
              View Event Details
            </a>
          </div>
          <p style="font-size:12px; line-height:1.6; color:#9ca3af;">
            A calendar invite (.ics) is attached to this email. Open it to add the event to your calendar.
          </p>
        `;

        const html = kypwEmailTemplate({
          subject: `You're Invited: ${event.title}`,
          content: emailContent,
        });

        // Send email with .ics attachment via Resend's raw/attachment API
        // The sendEmail function uses the standard Resend API which supports attachments
        const attachResult = await sendEmailWithAttachment({
          to: subscriber.email,
          subject: `You're Invited: ${event.title} — KYPW`,
          html,
          replyTo: organizerEmail,
          attachment: {
            filename,
            content: icsContent,
            contentType: "text/calendar",
          },
        });

        if (!attachResult.success) {
          throw new Error(attachResult.error ?? "Email send failed");
        }

        return { email: subscriber.email, success: true };
      }),
    );

    // Aggregate batch results
    for (let j = 0; j < batchResults.length; j++) {
      const r = batchResults[j];
      const email = batch[j].email;
      if (r.status === "fulfilled" && r.value.success) {
        result.sent++;
      } else {
        result.failed++;
        const errorMsg = r.status === "rejected"
          ? r.reason?.message ?? String(r.reason)
          : "Unknown error";
        result.failures.push({ email, error: errorMsg });
      }
    }

    // Brief pause between batches to avoid rate limits
    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return result;
}

// ── Email with Attachment ──────────────────────────────

/**
 * Send an email with an .ics attachment via the Resend API.
 * Extends the base sendEmail with attachment support.
 */
async function sendEmailWithAttachment(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachment: {
    filename: string;
    content: string;
    contentType: string;
  };
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "info@rauell.systems";
  const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || "Kenya Youth Parliament of Water";
  const isConfigured = !!RESEND_API_KEY && !RESEND_API_KEY.startsWith("re_kypw_placeholder");

  const from = `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`;
  const replyTo = params.replyTo || RESEND_FROM_EMAIL;

  if (!isConfigured) {
    console.log("[email:mock] Resend not configured - logging email with attachment:");
    console.log(`  From: ${from}`);
    console.log(`  To: ${params.to}`);
    console.log(`  Subject: ${params.subject}`);
    console.log(`  Attachment: ${params.attachment.filename} (${params.attachment.contentType})`);
    return { success: true, id: "mock" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        reply_to: replyTo,
        attachments: [
          {
            filename: params.attachment.filename,
            content: Buffer.from(params.attachment.content, "utf-8").toString("base64"),
            content_type: params.attachment.contentType,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[email:error]", data);
      return { success: false, error: data.message || "Resend API error" };
    }

    return { success: true, id: data.id };
  } catch (err) {
    console.error("[email:error]", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to send email" };
  }
}

// ── Public API ─────────────────────────────────────────

/**
 * Run the event broadcast workflow (awaitable).
 * Fetches event + subscribers, then sends personalized emails in batches.
 */
export async function runEventBroadcastWorkflow(input: EventBroadcastInput) {
  return runWorkflow<BroadcastResult>("event.broadcast", input, [
    {
      name: "fetch-event",
      fn: () => fetchEvent(input),
      retries: 2,
      retryDelayMs: 1000,
    },
    {
      name: "fetch-subscribers",
      fn: (prev: unknown) => fetchSubscribers(prev as EventData),
      retries: 2,
      retryDelayMs: 1000,
    },
    {
      name: "send-invites",
      fn: (prevOutput: unknown) => {
        const data = prevOutput as unknown as {
          event: EventData;
          subscribers: SubscriberData[];
          organizerName: string;
          organizerEmail: string;
        };
        return sendInvites(data);
      },
      retries: 2,
      retryDelayMs: 5000,
      continueOnError: true,
    },
  ]);
}

/**
 * Run the event broadcast workflow in the background (fire-and-forget).
 * Returns immediately with a run ID for later status checking.
 */
export function runEventBroadcastBackground(input: EventBroadcastInput) {
  return runWorkflowBackground<BroadcastResult>("event.broadcast", input, [
    {
      name: "fetch-event",
      fn: () => fetchEvent(input),
      retries: 2,
      retryDelayMs: 1000,
    },
    {
      name: "fetch-subscribers",
      fn: (prev: unknown) => fetchSubscribers(prev as EventData),
      retries: 2,
      retryDelayMs: 1000,
    },
    {
      name: "send-invites",
      fn: (prevOutput: unknown) => {
        const data = prevOutput as unknown as {
          event: EventData;
          subscribers: SubscriberData[];
          organizerName: string;
          organizerEmail: string;
        };
        return sendInvites(data);
      },
      retries: 2,
      retryDelayMs: 5000,
      continueOnError: true,
    },
  ]);
}
