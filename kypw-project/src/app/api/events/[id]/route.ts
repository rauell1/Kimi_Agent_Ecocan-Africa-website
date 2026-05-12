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
    const event = await db.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const before = await db.event.findUnique({ where: { id } });

    const event = await db.event.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.eventType !== undefined && { eventType: body.eventType }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.startAt !== undefined && { startAt: body.startAt ? new Date(body.startAt) : null }),
        ...(body.endAt !== undefined && { endAt: body.endAt ? new Date(body.endAt) : null }),
        ...(body.region !== undefined && { region: body.region }),
        ...(body.locationName !== undefined && { locationName: body.locationName }),
        ...(body.locationType !== undefined && { locationType: body.locationType }),
        ...(body.coverImageUrl !== undefined && { coverImageUrl: body.coverImageUrl }),
      },
    });

    await logAudit({
      eventId: id,
      userId: user.id,
      action: "event.update",
      entityType: "Event",
      entityId: id,
      before,
      after: event,
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const before = await db.event.findUnique({ where: { id } });
    await db.event.delete({ where: { id } });

    await logAudit({
      eventId: id,
      userId: user.id,
      action: "event.delete",
      entityType: "Event",
      entityId: id,
      before,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
