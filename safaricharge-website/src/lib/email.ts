import { Resend } from 'resend';
import { APP_CONFIG, SESSION_CONFIG } from '@/lib/config';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export type EmailTemplateType =
  | 'verification'
  | 'employee_pending'
  | 'employee_approved'
  | 'new_employee_notification';

export type EmailJobPayload = {
  type: EmailTemplateType;
  to: string | string[];
  data: Record<string, unknown>;
};

let resendClient: Resend | null = null;

function getResendClient() {
  if (!env.RESEND_API_KEY) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }

  return resendClient;
}

function renderLayout(title: string, body: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="font-family: Segoe UI, Arial, sans-serif; background: #f5f7f7; margin: 0; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 40px rgba(5, 31, 32, 0.08);">
          <div style="background: linear-gradient(135deg, #235347, #052659); padding: 28px 32px; color: #ffffff;">
            <div style="font-size: 24px; font-weight: 700;">${APP_CONFIG.name}</div>
            <div style="font-size: 11px; letter-spacing: 0.14em; opacity: 0.8;">POWERING AFRICA'S ELECTRIC FUTURE</div>
          </div>
          <div style="padding: 32px;">${body}</div>
          <div style="padding: 20px 32px; background: #f5f7f7; color: #516564; font-size: 12px;">
            ${APP_CONFIG.name} v${APP_CONFIG.version}<br />
            ${APP_CONFIG.url}
          </div>
        </div>
      </body>
    </html>
  `;
}

function renderEmail(payload: EmailJobPayload) {
  switch (payload.type) {
    case 'verification': {
      const code = String(payload.data.code || '');
      const name = String(payload.data.name || 'there');

      return {
        subject: 'Your SafariCharge verification code',
        html: renderLayout(
          'Verify your email',
          `
            <h1 style="margin-top: 0; color: #051F20;">Hello ${name},</h1>
            <p style="color: #235347; line-height: 1.6;">
              Use the verification code below to complete your sign-in. The code expires in
              ${SESSION_CONFIG.verificationCodeExpiryMinutes} minutes.
            </p>
            <div style="margin: 28px 0; padding: 24px; border-radius: 16px; background: #f0f7f5; border: 1px solid #8EB69B;">
              <div style="font-size: 34px; letter-spacing: 0.35em; font-weight: 700; color: #235347; text-align: center;">${code}</div>
            </div>
            <p style="color: #516564; line-height: 1.6; margin-bottom: 0;">
              If you did not request this code, you can safely ignore this email.
            </p>
          `
        ),
      };
    }
    case 'employee_pending': {
      const name = String(payload.data.name || 'there');

      return {
        subject: 'Employee registration received',
        html: renderLayout(
          'Employee registration pending',
          `
            <h1 style="margin-top: 0; color: #051F20;">Hello ${name},</h1>
            <p style="color: #235347; line-height: 1.6;">
              Your employee registration has been received and is awaiting approval from the SafariCharge admin team.
            </p>
            <div style="padding: 20px; border-radius: 16px; background: #fff7e6; border: 1px solid #f5c26b; color: #8a5a00;">
              Status: Pending approval
            </div>
          `
        ),
      };
    }
    case 'employee_approved': {
      const name = String(payload.data.name || 'there');
      const securityLevel = String(payload.data.securityLevel || 'BASIC');

      return {
        subject: 'Your employee account has been approved',
        html: renderLayout(
          'Employee account approved',
          `
            <h1 style="margin-top: 0; color: #051F20;">Welcome aboard, ${name}</h1>
            <p style="color: #235347; line-height: 1.6;">
              Your employee account is now active. You can log in immediately and begin using the platform.
            </p>
            <div style="padding: 20px; border-radius: 16px; background: #f0f7f5; border: 1px solid #8EB69B; color: #235347;">
              Assigned security level: <strong>${securityLevel}</strong>
            </div>
            <p style="margin-top: 24px;">
              <a href="${APP_CONFIG.url}" style="display: inline-block; padding: 14px 22px; border-radius: 10px; background: #235347; color: #ffffff; text-decoration: none; font-weight: 600;">
                Open SafariCharge
              </a>
            </p>
          `
        ),
      };
    }
    case 'new_employee_notification': {
      const name = String(payload.data.name || 'Unknown applicant');
      const email = String(payload.data.email || 'unknown');
      const phone = String(payload.data.phone || 'Not provided');

      return {
        subject: 'New employee registration pending review',
        html: renderLayout(
          'New employee pending review',
          `
            <h1 style="margin-top: 0; color: #051F20;">Admin notification</h1>
            <p style="color: #235347; line-height: 1.6;">
              A new employee registration requires review.
            </p>
            <table style="width: 100%; border-collapse: collapse; background: #f0f7f5; border-radius: 16px; overflow: hidden;">
              <tr><td style="padding: 12px; font-weight: 600;">Name</td><td style="padding: 12px;">${name}</td></tr>
              <tr><td style="padding: 12px; font-weight: 600;">Email</td><td style="padding: 12px;">${email}</td></tr>
              <tr><td style="padding: 12px; font-weight: 600;">Phone</td><td style="padding: 12px;">${phone}</td></tr>
            </table>
          `
        ),
      };
    }
  }
}

export async function sendTransactionalEmail(payload: EmailJobPayload) {
  const email = renderEmail(payload);
  const client = getResendClient();

  if (!client) {
    logger.warn('Email provider not configured. Email simulated.', payload);
    return {
      simulated: true,
    };
  }

  const { data, error } = await client.emails.send({
    from: `${APP_CONFIG.name} <${env.RESEND_FROM_EMAIL}>`,
    to: Array.isArray(payload.to) ? payload.to : [payload.to],
    subject: email.subject,
    html: email.html,
  });

  if (error) {
    throw new Error(error.message);
  }

  logger.info('Transactional email sent', {
    type: payload.type,
    to: payload.to,
    emailId: data?.id,
  });

  return {
    emailId: data?.id,
  };
}
