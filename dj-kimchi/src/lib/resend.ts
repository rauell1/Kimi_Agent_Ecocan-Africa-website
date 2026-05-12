import { Resend } from "resend";

/**
 * Resend email client — initialized once and reused across API routes.
 * Replace RESEND_API_KEY in .env with your actual Resend API key.
 */

const CONTACT_EMAIL = "deejaykimchi@gmail.com";

// Validate API key on import
const apiKey = process.env.RESEND_API_KEY;
const isConfigured = !!(apiKey && apiKey !== "" && !apiKey.startsWith("re_your_"));

let resend: Resend | null = null;

if (isConfigured) {
  resend = new Resend(apiKey);
} else {
  console.warn(
    "[resend] ⚠️  RESEND_API_KEY not configured — emails will not be sent. " +
    "Set RESEND_API_KEY in .env to your Resend API key."
  );
}

export function isResendConfigured(): boolean {
  return isConfigured;
}

export function getResendClient(): Resend {
  if (!resend) {
    throw new Error("Resend is not configured. Set RESEND_API_KEY in .env");
  }
  return resend;
}

export { CONTACT_EMAIL };
