import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { cookies } from "next/headers";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  const session = await db.userSession.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const metrics = await db.eventMetrics.findUnique({ where: { eventId: id } });
    return NextResponse.json({ metrics });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const before = await db.eventMetrics.findUnique({ where: { eventId: id } });

    const metrics = await db.eventMetrics.upsert({
      where: { eventId: id },
      create: {
        eventId: id,
        participantsTotal: body.participantsTotal ?? 0,
        youthCount: body.youthCount ?? 0,
        womenCount: body.womenCount ?? 0,
        countiesReached: body.countiesReached ?? 0,
        waterPointsAssessed: body.waterPointsAssessed ?? 0,
        communitiesEngaged: body.communitiesEngaged ?? 0,
        partnershipsFormed: body.partnershipsFormed ?? 0,
        budgetSpent: body.budgetSpent ?? 0,
        currency: body.currency ?? "KES",
        narrativeSummary: body.narrativeSummary || null,
      },
      update: {
        participantsTotal: body.participantsTotal ?? 0,
        youthCount: body.youthCount ?? 0,
        womenCount: body.womenCount ?? 0,
        countiesReached: body.countiesReached ?? 0,
        waterPointsAssessed: body.waterPointsAssessed ?? 0,
        communitiesEngaged: body.communitiesEngaged ?? 0,
        partnershipsFormed: body.partnershipsFormed ?? 0,
        budgetSpent: body.budgetSpent ?? 0,
        currency: body.currency ?? "KES",
        narrativeSummary: body.narrativeSummary || null,
      },
    });

    await logAudit({
      eventId: id,
      userId: user.id,
      action: "metrics.update",
      entityType: "EventMetrics",
      entityId: metrics.id,
      before,
      after: metrics,
    });

    return NextResponse.json({ metrics });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save metrics" }, { status: 500 });
  }
}
