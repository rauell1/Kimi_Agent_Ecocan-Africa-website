import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { getResendClient, isResendConfigured, CONTACT_EMAIL } from "@/lib/resend";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface InboundEmailData {
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{ filename?: string; content_type?: string }>;
  headers?: Array<{ name: string; value: string }>;
  message_id?: string;
}

interface InboundEmailEvent {
  type: "email.received";
  data: InboundEmailData;
}

/* ------------------------------------------------------------------ */
/*  Webhook signature verification                                      */
/* ------------------------------------------------------------------ */

function verifySignature(
  payload: string,
  headers: Headers
): { ok: boolean; error?: string } {
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (!secret) {
    // Secret not configured — skip verification but log a warning
    console.warn(
      "[inbound] ⚠️  RESEND_WEBHOOK_SECRET not set — skipping signature verification. " +
        "Set it in .env to validate that requests come from Resend."
    );
    return { ok: true };
  }

  try {
    const wh = new Webhook(secret);
    wh.verify(payload, {
      "svix-id": headers.get("svix-id") ?? "",
      "svix-timestamp": headers.get("svix-timestamp") ?? "",
      "svix-signature": headers.get("svix-signature") ?? "",
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invalid signature",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Strip newlines to prevent SMTP header injection */
function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/* ------------------------------------------------------------------ */
/*  Forward inbound email to contact address (fire-and-forget)          */
/* ------------------------------------------------------------------ */

function forwardEmail(data: InboundEmailData): void {
  if (!isResendConfigured()) return;

  const resend = getResendClient();
  const attachmentCount = data.attachments?.length ?? 0;
  const safeFrom = escapeHtml(data.from);
  const safeTo = data.to.map(escapeHtml).join(", ");
  const safeSubject = escapeHtml(data.subject ?? "(no subject)");
  const safeText = data.text ? escapeHtml(data.text) : null;

  const html = `
    <div style="background:#0a0a0a; padding:32px; border-radius:12px; font-family:system-ui,sans-serif; color:#f5f5f5; max-width:600px; margin:0 auto;">
      <div style="text-align:center; margin-bottom:24px;">
        <h1 style="font-size:28px; font-weight:900; margin:0; background:linear-gradient(135deg,#a855f7,#22d3ee,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
          DJ KIMCHI
        </h1>
        <p style="color:#888; font-size:13px; letter-spacing:0.2em; text-transform:uppercase; margin-top:8px;">
          Inbound Email Received
        </p>
      </div>

      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:20px; margin-bottom:20px;">
        <h2 style="font-size:18px; font-weight:700; color:#a855f7; margin:0 0 16px 0;">
          Email Details
        </h2>

        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr>
            <td style="padding:8px 0; color:#888; width:35%;">From</td>
            <td style="padding:8px 0; color:#f5f5f5; font-weight:600;">${safeFrom}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#888;">To</td>
            <td style="padding:8px 0; color:#f5f5f5;">${safeTo}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#888;">Subject</td>
            <td style="padding:8px 0; color:#f5f5f5; font-weight:600;">${safeSubject}</td>
          </tr>
          ${attachmentCount > 0 ? `
          <tr>
            <td style="padding:8px 0; color:#888;">Attachments</td>
            <td style="padding:8px 0; color:#f5f5f5;">${attachmentCount} file(s)</td>
          </tr>
          ` : ""}
        </table>
      </div>

      ${safeText ? `
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:20px; margin-bottom:20px;">
        <h2 style="font-size:16px; font-weight:700; color:#a855f7; margin:0 0 12px 0;">Message</h2>
        <p style="color:#ccc; font-size:14px; line-height:1.6; margin:0; white-space:pre-wrap;">${safeText}</p>
      </div>
      ` : ""}

      <p style="color:#666; font-size:12px; text-align:center; margin:0;">
        Received via djkimchi.com &bull; Nairobi, Kenya
      </p>
    </div>
  `;

  const safeFromHeader = sanitizeHeader(data.from);
  const safeSubjectHeader = sanitizeHeader(data.subject ?? "(no subject)");

  resend.emails
    .send({
      from: "DJ Kimchi Inbound <onboarding@resend.dev>",
      to: [CONTACT_EMAIL],
      replyTo: safeFromHeader,
      subject: `[Inbound] ${safeSubjectHeader} — from ${safeFromHeader}`,
      html,
    })
    .then((result) => {
      if (result.error) {
        console.error("[inbound] Forward email error:", result.error.message);
      } else {
        console.log("[inbound] Forwarded email, ID:", result.data?.id);
      }
    })
    .catch((err) => {
      console.error(
        "[inbound] Forward failed:",
        err instanceof Error ? err.message : err
      );
    });
}

/* ------------------------------------------------------------------ */
/*  POST Handler                                                        */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  // Read raw body for signature verification
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to read request body" },
      { status: 400 }
    );
  }

  // Verify webhook signature
  const verification = verifySignature(rawBody, request.headers);
  if (!verification.ok) {
    console.warn("[inbound] Signature verification failed:", verification.error);
    return NextResponse.json(
      { success: false, error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  // Parse payload
  let event: InboundEmailEvent;
  try {
    event = JSON.parse(rawBody) as InboundEmailEvent;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  // Only handle inbound email events
  if (event.type !== "email.received") {
    return NextResponse.json({ success: true, message: "Event type ignored" });
  }

  const { data } = event;

  console.log(
    `[inbound] Email received — from: ${sanitizeHeader(data.from)}, to: ${data.to.map(sanitizeHeader).join(", ")}, subject: ${sanitizeHeader(data.subject ?? "(no subject)")}`
  );

  // Forward to contact address (non-blocking)
  forwardEmail(data);

  return NextResponse.json({ success: true });
}
