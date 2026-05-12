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

// GET /api/events/[id]/media - list media for event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const media = await db.eventMedia.findMany({
      where: { eventId: id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Fetch media error:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// POST /api/events/[id]/media - add media entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { url, title, description, fileType, sortOrder } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Get max sort order
    const maxSort = await db.eventMedia.findFirst({
      where: { eventId: id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const media = await db.eventMedia.create({
      data: {
        eventId: id,
        url,
        title: title || null,
        description: description || null,
        fileType: fileType || null,
        sortOrder: sortOrder ?? (maxSort?.sortOrder ?? -1) + 1,
        uploadedBy: user.id,
      },
    });

    await logAudit({
      eventId: id,
      userId: user.id,
      action: "media.create",
      entityType: "EventMedia",
      entityId: media.id,
      after: media,
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("Create media error:", error);
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 });
  }
}
