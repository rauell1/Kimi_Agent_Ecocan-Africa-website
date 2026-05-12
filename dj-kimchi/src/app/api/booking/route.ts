import { NextRequest, NextResponse } from "next/server";
import type { Booking } from "@prisma/client";
import { db, isDatabaseEnabled } from "@/lib/db";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { getResendClient, isResendConfigured, CONTACT_EMAIL } from "@/lib/resend";

/* ------------------------------------------------------------------ */
/*  Configuration                                                       */
/* ------------------------------------------------------------------ */

const EVENT_TYPES = [
  "club-night",
  "private-party",
  "festival",
  "corporate",
  "wedding",
  "other",
] as const;

const EVENT_LABELS: Record<string, string> = {
  "club-night": "Club Night",
  "private-party": "Private Party",
  festival: "Festival / Concert",
  corporate: "Corporate Event",
  wedding: "Wedding",
  other: "Other",
};

/* ------------------------------------------------------------------ */
/*  Validation Schema (Zod)                                             */
/* ------------------------------------------------------------------ */

const bookingSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(200, "Email must be under 200 characters")
    .toLowerCase(),
  eventType: z.enum(EVENT_TYPES, {
    errorMap: () => ({ message: "Please select a valid event type" }),
  }),
  date: z
    .string()
    .min(1, "Event date is required")
    .refine((d) => {
      const date = new Date(d);
      if (isNaN(date.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Event date must be today or in the future"),
  message: z
    .string()
    .max(2000, "Message must be under 2000 characters")
    .optional()
    .default(""),
});

/* ------------------------------------------------------------------ */
/*  Email Sending (non-blocking / fire-and-forget via Resend)            */
/* ------------------------------------------------------------------ */

function sendBookingEmail(data: {
  name: string;
  email: string;
  eventType: string;
  date: string;
  message: string;
}): Promise<void> {
  const safeName = data.name;
  const safeEmail = data.email;
  const safeMessage = data.message.replace(/\n/g, "<br>");
  const safeEventType = EVENT_LABELS[data.eventType] || data.eventType;
  const safeDate = data.date;

  const html = `
    <div style="background:#0a0a0a; padding:32px; border-radius:12px; font-family:system-ui,sans-serif; color:#f5f5f5; max-width:600px; margin:0 auto;">
      <div style="text-align:center; margin-bottom:24px;">
        <h1 style="font-size:28px; font-weight:900; margin:0; background:linear-gradient(135deg,#a855f7,#22d3ee,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
          DJ KIMCHI
        </h1>
        <p style="color:#888; font-size:13px; letter-spacing:0.2em; text-transform:uppercase; margin-top:8px;">
          New Booking Request
        </p>
      </div>

      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:20px; margin-bottom:20px;">
        <h2 style="font-size:18px; font-weight:700; color:#a855f7; margin:0 0 16px 0;">
          Booking Details
        </h2>

        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr>
            <td style="padding:8px 0; color:#888; width:35%;">Name</td>
            <td style="padding:8px 0; color:#f5f5f5; font-weight:600;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#888;">Email</td>
            <td style="padding:8px 0; color:#f5f5f5;">
              <a href="mailto:${safeEmail}" style="color:#a855f7; text-decoration:none;">${safeEmail}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#888;">Event Type</td>
            <td style="padding:8px 0; color:#f5f5f5; font-weight:600;">${safeEventType}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#888;">Event Date</td>
            <td style="padding:8px 0; color:#f5f5f5; font-weight:600;">${safeDate}</td>
          </tr>
          ${data.message ? `
          <tr>
            <td style="padding:8px 0; color:#888; vertical-align:top;">Message</td>
            <td style="padding:8px 0; color:#ccc;">${safeMessage}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      <p style="color:#666; font-size:12px; text-align:center; margin:0;">
        Submitted via djkimchi.com &bull; Nairobi, Kenya
      </p>
    </div>
  `;

  const resend = getResendClient();

  return resend.emails.send({
    from: "DJ Kimchi Bookings <onboarding@resend.dev>",
    to: [CONTACT_EMAIL],
    replyTo: data.email,
    subject: `New Booking Request from ${data.name} — ${safeEventType}`,
    html,
  }).then((result) => {
    if (result.error) {
      console.error("[booking] Resend error:", result.error.message);
    } else {
      console.log("[booking] Email sent via Resend, ID:", result.data?.id);
    }
  }).catch((err) => {
    console.error("[booking] Resend failed:", err instanceof Error ? err.message : err);
  });
}

/* ------------------------------------------------------------------ */
/*  POST Handler                                                        */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (rateLimit(`booking:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { success: false, error: "Too many booking attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body. Please send JSON." },
        { status: 400 }
      );
    }

    // Validate with Zod
    const result = bookingSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, eventType, date, message } = result.data;

    let booking: Booking | null = null;
    let storageWarning: string | undefined;

    // Save to database when available
    if (isDatabaseEnabled() && db) {
      try {
        booking = await db.booking.create({
          data: {
            name,
            email,
            eventType,
            date: new Date(date),
            message,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[booking] Database save failed:", message);
        storageWarning = "Booking received but storing it failed. The team will still receive your request via email.";
      }
    } else {
      storageWarning =
        "Booking received but database persistence is not configured (set DATABASE_URL to enable storage).";
      console.warn("[booking] Database not configured — skipping persistence. Set DATABASE_URL to enable storage.");
    }

    const emailEnabled = isResendConfigured();

    // Send email notification (fire-and-forget — don't block response)
    if (emailEnabled) {
      sendBookingEmail({ name, email, eventType, date, message });
    } else {
      console.warn("[booking] Resend not configured — email notification skipped. Set RESEND_API_KEY in .env");
    }

    // Ensure at least one delivery channel is available
    if (!booking && !emailEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking could not be processed because neither storage nor email is configured. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Return immediately
    const emailWarning = emailEnabled
      ? undefined
      : "Booking saved but email notifications are not configured.";
    const combinedWarning = [storageWarning, emailWarning].filter(Boolean).join(" ");

    return NextResponse.json({
      success: true,
      message: "Booking submitted! DJ Kimchi's team will get back to you soon.",
      ...(booking && { booking }),
      ...(combinedWarning && { warning: combinedWarning }),
    });
  } catch (error) {
    console.error("[booking] Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, error: "Failed to submit booking. Please try again." },
      { status: 500 }
    );
  }
}
