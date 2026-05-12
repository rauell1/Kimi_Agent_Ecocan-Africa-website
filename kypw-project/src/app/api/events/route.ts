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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const publicOnly = searchParams.get("public") === "true";

    const where: Record<string, unknown> = {};
    if (publicOnly) {
      where.status = { in: ["published", "ongoing", "completed", "archived"] };
    } else if (status) {
      where.status = status;
    }

    const events = await db.event.findMany({
      where,
      orderBy: { startAt: "desc" },
    });

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, description, eventType, status, startAt, endAt, region, locationName, locationType, coverImageUrl } = body;

    if (!title || title.trim().length < 2) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const event = await db.event.create({
      data: {
        title,
        description: description || null,
        eventType: eventType || "workshop",
        status: status || "draft",
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
        region: region || null,
        locationName: locationName || null,
        locationType: locationType || "physical",
        coverImageUrl: coverImageUrl || null,
        createdBy: user.id,
      },
    });

    await logAudit({
      eventId: event.id,
      userId: user.id,
      action: "event.create",
      entityType: "Event",
      entityId: event.id,
      after: event,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
