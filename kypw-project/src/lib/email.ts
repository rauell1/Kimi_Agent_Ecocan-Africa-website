/**
 * KYPW Email Service - powered by Resend.com
 *
 * Configuration:
 *   RESEND_API_KEY      - from Resend.com dashboard
 *   RESEND_FROM_EMAIL   - sender address (info@rauell.systems)
 *   RESEND_FROM_NAME    - display name for the sender
 *
 * In development / when RESEND_API_KEY is a placeholder,
 * emails are silently logged to the server console instead of sent.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "info@rauell.systems";
const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || "Kenya Youth Parliament of Water";

/** True when a real Resend API key is configured */
export function isResendConfigured(): boolean {
  return !!RESEND_API_KEY && !RESEND_API_KEY.startsWith("re_kypw_placeholder");
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send an email via Resend, or log it when not configured.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const from = `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`;
  const replyTo = params.replyTo || RESEND_FROM_EMAIL;

  if (!isResendConfigured()) {
    console.log("[email:mock] Resend not configured - logging email:");
    console.log(`  From: ${from}`);
    console.log(`  To: ${JSON.stringify(params.to)}`);
    console.log(`  Reply-To: ${replyTo}`);
    console.log(`  Subject: ${params.subject}`);
    console.log(`  HTML: ${params.html.slice(0, 200)}...`);
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
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: replyTo,
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

/**
 * Build a branded KYPW email HTML template.
 */
export function kypwEmailTemplate({
  subject,
  content,
}: {
  subject: string;
  content: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" max-width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#1a3a5c,#2a5070); border-radius:8px; padding:12px 16px;">
                    <span style="color:#d4a853; font-size:18px;">💧</span>
                    <span style="color:#ffffff; font-weight:600; font-size:16px; margin-left:8px;">Kenya Youth Parliament of Water</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff; border-radius:12px; padding:32px; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:24px; text-align:center; color:#6b7280; font-size:12px;">
              <p>KYPW &bull; Nairobi, Kenya</p>
              <p style="margin-top:4px;">
                <a href="mailto:kypwyouthforwater@gmail.com" style="color:#06b6d4;">kypwyouthforwater@gmail.com</a>
                &nbsp;&bull;&nbsp;
                <a href="https://rauell.systems" style="color:#06b6d4;">rauell.systems</a>
              </p>
              <p style="margin-top:8px; color:#9ca3af;">
                Aligned with the World Youth Parliament for Water &bull; SDG 6
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send a contact form notification to KYPW email.
 */
export async function sendContactNotification({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const contactEmail = "kypwyouthforwater@gmail.com";
  const html = kypwEmailTemplate({
    subject: `New Contact Message from ${name}`,
    content: `
      <h2 style="margin:0 0 16px; font-size:20px; color:#1a3a5c;">New Contact Message</h2>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; margin-bottom:20px;">
        <tr>
          <td style="padding:8px 0; border-bottom:1px solid #e5e7eb; color:#6b7280; font-size:14px; width:120px;">From</td>
          <td style="padding:8px 0; border-bottom:1px solid #e5e7eb; font-size:14px;"><strong>${name}</strong></td>
        </tr>
        <tr>
          <td style="padding:8px 0; border-bottom:1px solid #e5e7eb; color:#6b7280; font-size:14px;">Email</td>
          <td style="padding:8px 0; border-bottom:1px solid #e5e7eb; font-size:14px;"><a href="mailto:${email}" style="color:#06b6d4;">${email}</a></td>
        </tr>
      </table>
      <div style="background-color:#f9fafb; border-radius:8px; padding:16px; font-size:14px; line-height:1.6; color:#374151;">
        ${message.replace(/\n/g, "<br />")}
      </div>
    `,
  });

  return sendEmail({
    to: contactEmail,
    subject: `[KYPW Website] New message from ${name}`,
    html,
    replyTo: email,
  });
}

/**
 * Send a newsletter welcome email.
 */
export async function sendNewsletterWelcome({
  email,
  firstName,
}: {
  email: string;
  firstName?: string | null;
}) {
  const greeting = firstName ? `Hi ${firstName}` : "Hello";
  const html = kypwEmailTemplate({
    subject: "Welcome to the KYPW Newsletter!",
    content: `
      <h2 style="margin:0 0 16px; font-size:20px; color:#1a3a5c;">${greeting}, welcome aboard! 🌊</h2>
      <p style="font-size:14px; line-height:1.6; color:#374151;">
        Thanks for subscribing to the <strong>Kenya Youth Parliament of Water</strong> newsletter.
        You'll now receive updates on events, civic action, and impact stories from across Kenya's water sector.
      </p>
      <p style="font-size:14px; line-height:1.6; color:#374151;">
        Together, we're defending water as a right - county by county, river by river.
      </p>
      <div style="text-align:center; margin-top:24px;">
        <a href="https://rauell.systems" style="display:inline-block; background-color:#1a3a5c; color:#ffffff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
          Explore our work
        </a>
      </div>
    `,
  });

  return sendEmail({
    to: email,
    subject: "Welcome to the KYPW Newsletter! 💧",
    html,
  });
}
