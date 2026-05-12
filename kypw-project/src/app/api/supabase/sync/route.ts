import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

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
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  const session = await db.userSession.findUnique({
    where: { token }, include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

// POST /api/supabase/sync — Sync local data to Supabase
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!isConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
    }

    const body = await request.json();
    const { direction = "push", tables } = body; // "push" or "pull"

    const supabase = createClient();
    const results: Record<string, { synced: number; errors: string[] }> = {};

    const tablesToSync = tables ?? ["events", "participants", "documentation", "metrics", "reports"];

    if (direction === "push") {
      // Push local (Prisma) → Supabase
      for (const table of tablesToSync) {
        const errors: string[] = [];
        let synced = 0;

        try {
          if (table === "events") {
            const events = await db.event.findMany();
            for (const e of events) {
              const { error } = await supabase.from("events").upsert({
                id: e.id, title: e.title, description: e.description,
                event_type: e.eventType, status: e.status,
                start_at: e.startAt?.toISOString() ?? null,
                end_at: e.endAt?.toISOString() ?? null,
                region: e.region, location_name: e.locationName,
                location_type: e.locationType, is_public: e.status === "published",
                slug: e.slug, created_by: e.createdBy,
              }, { onConflict: "id" });
              if (error) errors.push(`${e.title}: ${error.message}`);
              else synced++;
            }
          } else if (table === "participants") {
            const parts = await db.eventParticipant.findMany();
            for (const p of parts) {
              const { error } = await supabase.from("participants").upsert({
                id: p.id, event_id: p.eventId, full_name: p.fullName,
                email: p.email, phone: p.phone, organization: p.organization,
                region: p.region, gender: p.gender, age_group: p.ageGroup,
                role_at_event: p.roleAtEvent, attended: p.attended,
              }, { onConflict: "id" });
              if (error) errors.push(`${p.fullName}: ${error.message}`);
              else synced++;
            }
          } else if (table === "documentation") {
            const docs = await db.eventDocumentation.findMany();
            for (const d of docs) {
              const { error } = await supabase.from("event_documentation").upsert({
                id: d.id, event_id: d.eventId, type: d.type,
                title: d.title, description: d.description,
                file_url: d.fileUrl, external_url: d.externalUrl,
                uploaded_by: d.uploadedBy,
              }, { onConflict: "id" });
              if (error) errors.push(`${d.title}: ${error.message}`);
              else synced++;
            }
          } else if (table === "metrics") {
            const metrics = await db.eventMetrics.findMany();
            for (const m of metrics) {
              const { error } = await supabase.from("event_metrics").upsert({
                id: m.id, event_id: m.eventId,
                participants_total: m.participantsTotal,
                youth_count: m.youthCount, women_count: m.womenCount,
                counties_reached: m.countiesReached,
                water_points_assessed: m.waterPointsAssessed,
                communities_engaged: m.communitiesEngaged,
                partnerships_formed: m.partnershipsFormed,
                budget_spent: m.budgetSpent, currency: m.currency,
                narrative_summary: m.narrativeSummary,
              }, { onConflict: "event_id" });
              if (error) errors.push(`Event ${m.eventId}: ${error.message}`);
              else synced++;
            }
          } else if (table === "reports") {
            const reports = await db.eventReport.findMany();
            for (const r of reports) {
              const { error } = await supabase.from("event_reports").upsert({
                id: r.id, event_id: r.eventId,
                content: r.content, model: r.model,
              }, { onConflict: "id" });
              if (error) errors.push(`Report ${r.id}: ${error.message}`);
              else synced++;
            }
          }
        } catch (err) {
          errors.push(err instanceof Error ? err.message : "Sync failed");
        }

        results[table] = { synced, errors };
      }
    }

    return NextResponse.json({ direction, results, syncedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
