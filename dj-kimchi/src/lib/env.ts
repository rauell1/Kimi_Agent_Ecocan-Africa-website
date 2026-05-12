/**
 * Environment variable validation.
 * Called on API route initialization to catch missing config early.
 */

interface EnvSchema {
  [key: string]: {
    required: boolean;
    description: string;
  };
}

const schema: EnvSchema = {
  DATABASE_URL: { required: true, description: "Database connection string" },
  RESEND_API_KEY: { required: true, description: "Resend API key for sending emails" },
};

let validated = false;

export function validateEnv(): void {
  if (validated) return;
  validated = true;

  const missing: string[] = [];
  const warnings: string[] = [];

  for (const [key, config] of Object.entries(schema)) {
    const value = process.env[key];
    if (config.required && (!value || value === "")) {
      missing.push(`${key} (${config.description})`);
    } else if (!config.required && (!value || value === "")) {
      warnings.push(`${key} is not set — using defaults`);
    }
  }

  if (warnings.length > 0) {
    console.warn("[env] ⚠️  Warnings:");
    for (const w of warnings) {
      console.warn(`  - ${w}`);
    }
  }

  if (missing.length > 0) {
    console.error("[env] ❌ Missing required environment variables:");
    for (const m of missing) {
      console.error(`  - ${m}`);
    }
    console.error("[env] Email notifications will NOT work until RESEND_API_KEY is set.");
  }
}
