import { NextResponse } from "next/server";
import { db, isDatabaseConfigured, isDatabaseEnabled } from "@/lib/db";
import { isResendConfigured } from "@/lib/resend";

export async function GET() {
  const startTime = Date.now();
  let dbStatus: "connected" | "error" | "not_configured" = "connected";
  let dbLatencyMs = 0;

  if (isDatabaseEnabled() && db) {
    try {
      const dbStart = Date.now();
      await db.$queryRaw`SELECT 1 as ok`;
      dbLatencyMs = Date.now() - dbStart;
    } catch {
      dbStatus = "error";
    }
  } else if (!isDatabaseConfigured()) {
    dbStatus = "not_configured";
  }

  const totalMs = Date.now() - startTime;
  const isHealthy = dbStatus !== "error";

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTimeMs: totalMs,
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        email: {
          provider: "resend",
          status: isResendConfigured() ? "configured" : "not_configured",
        },
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
