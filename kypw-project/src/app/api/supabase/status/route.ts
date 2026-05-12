import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { db } from "@/lib/db";

function isConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(
    url &&
    url !== "https://placeholder.supabase.co" &&
    key &&
    key !== "placeholder-anon-key"
  );
}

// GET /api/supabase/status — Check connection and show sync counts
export async function GET() {
  try {
    const configured = isConfigured();

    if (!configured) {
      return NextResponse.json({
        configured: false,
        message: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
      });
    }

    const supabase = createClient();

    // Test connection by fetching from profiles
    const { count: profileCount, error: profileError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: eventCount, error: eventError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });

    // Local DB counts
    const localEvents = await db.event.count();
    const localParticipants = await db.eventParticipant.count();

    const connectionOk = !profileError || profileError.code === "42P01";

    return NextResponse.json({
      configured: true,
      connected: connectionOk,
      tablesExist: !profileError || !eventError,
      supabase: {
        profiles: profileCount ?? 0,
        events: eventCount ?? 0,
      },
      local: {
        events: localEvents,
        participants: localParticipants,
      },
      schemaMissing: profileError?.code === "42P01",
    });
  } catch (error) {
    return NextResponse.json({
      configured: isConfigured(),
      connected: false,
      error: error instanceof Error ? error.message : "Connection failed",
    });
  }
}
