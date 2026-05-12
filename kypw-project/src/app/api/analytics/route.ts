import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

export async function GET() {
  try {
    // Auth required — analytics expose business metrics
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Events by status
    const eventsByStatusRaw = await db.event.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    const eventsByStatus = eventsByStatusRaw.map((e) => ({
      status: e.status,
      count: e._count.id,
    }));

    // Events by type
    const eventsByTypeRaw = await db.event.groupBy({
      by: ["eventType"],
      _count: { id: true },
    });
    const eventsByType = eventsByTypeRaw.map((e) => ({
      type: e.eventType,
      count: e._count.id,
    }));

    // Participants per event
    const participantsPerEventRaw = await db.eventParticipant.groupBy({
      by: ["eventId"],
      _count: { id: true },
    });
    const eventIds = participantsPerEventRaw.map((e) => e.eventId);
    const eventTitles = eventIds.length
      ? await db.event.findMany({
          where: { id: { in: eventIds } },
          select: { id: true, title: true },
        })
      : [];
    const titleMap = Object.fromEntries(eventTitles.map((e) => [e.id, e.title]));
    const participantsPerEvent = participantsPerEventRaw.map((e) => ({
      eventId: e.eventId,
      title: titleMap[e.eventId] ?? "Unknown",
      count: e._count.id,
    }));

    // Regional distribution
    const regionRaw = await db.event.groupBy({
      by: ["region"],
      _count: { id: true },
      where: { region: { not: null } },
    });
    const regionalDistribution = regionRaw.map((e) => ({
      region: e.region,
      count: e._count.id,
    }));

    // Monthly trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const eventsInPeriod = await db.event.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    });

    const monthlyMap: Record<string, number> = {};
    eventsInPeriod.forEach((e) => {
      const key = `${e.createdAt.getFullYear()}-${String(e.createdAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] ?? 0) + 1;
    });

    // Fill in all months
    const monthlyTrends: Array<{ month: string; count: number }> = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyTrends.push({
        month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        count: monthlyMap[key] ?? 0,
      });
    }

    // Total budget
    const budgetResult = await db.eventMetrics.aggregate({
      _sum: { budgetSpent: true },
    });
    const totalBudget = budgetResult._sum.budgetSpent ?? 0;

    // Total participants
    const totalParticipants = await db.eventParticipant.count();

    // Total regions covered
    const uniqueRegions = await db.event.groupBy({
      by: ["region"],
      where: { region: { not: null } },
    });

    return NextResponse.json({
      eventsByStatus,
      eventsByType,
      participantsPerEvent,
      regionalDistribution,
      monthlyTrends,
      totalBudget,
      totalParticipants,
      totalRegions: uniqueRegions.length,
      totalEvents: eventsByStatus.reduce((sum, e) => sum + e.count, 0),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
