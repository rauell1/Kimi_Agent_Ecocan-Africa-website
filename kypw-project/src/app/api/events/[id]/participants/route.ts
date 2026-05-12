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
    // Auth required — participant PII (names, emails, phones)
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const participants = await db.eventParticipant.findMany({
      where: { eventId: id },
      orderBy: { fullName: "asc" },
    });
    return NextResponse.json({ participants });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { fullName, email, phone, organization, region, gender, ageGroup, roleAtEvent, attended } = body;

    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    const participant = await db.eventParticipant.create({
      data: {
        eventId: id,
        fullName,
        email: email || null,
        phone: phone || null,
        organization: organization || null,
        region: region || null,
        gender: gender || null,
        ageGroup: ageGroup || null,
        roleAtEvent: roleAtEvent || null,
        attended: attended || false,
      },
    });

    await logAudit({
      eventId: id,
      userId: user.id,
      action: "participant.create",
      entityType: "EventParticipant",
      entityId: participant.id,
      after: participant,
    });

    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    console.error("Create participant error:", error);
    return NextResponse.json({ error: "Failed to add participant" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { participantId, attended } = body;

    if (!participantId) return NextResponse.json({ error: "participantId is required" }, { status: 400 });

    const before = await db.eventParticipant.findUnique({ where: { id: participantId } });

    const participant = await db.eventParticipant.update({
      where: { id: participantId, eventId: id },
      data: { attended: attended !== undefined ? attended : undefined },
    });

    await logAudit({
      eventId: id,
      userId: user.id,
      action: "participant.update",
      entityType: "EventParticipant",
      entityId: participantId,
      before,
      after: participant,
    });

    return NextResponse.json({ participant });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update participant" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get("participantId");

    if (!participantId) return NextResponse.json({ error: "participantId is required" }, { status: 400 });

    const before = await db.eventParticipant.findUnique({ where: { id: participantId } });
    await db.eventParticipant.delete({ where: { id: participantId, eventId: id } });

    await logAudit({
      eventId: id,
      userId: user.id,
      action: "participant.delete",
      entityType: "EventParticipant",
      entityId: participantId,
      before,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove participant" }, { status: 500 });
  }
}
