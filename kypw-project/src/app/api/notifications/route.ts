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

// GET /api/notifications - list current user's notifications
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        link: true,
        read: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST /api/notifications - create a notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, link, userId } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ error: "type, title, and message are required" }, { status: 400 });
    }

    // Allow admin/coordinator to create notifications for other users
    const targetUserId = userId || user.id;

    // If creating for another user, require admin/coordinator role
    if (userId && userId !== user.id && user.role !== "admin" && user.role !== "coordinator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const notification = await db.notification.create({
      data: {
        userId: targetUserId,
        type,
        title,
        message,
        link: link || null,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

// PATCH /api/notifications - mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, all } = body as { ids?: string[]; all?: boolean };

    if (all) {
      // Mark all as read
      await db.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      await db.notification.updateMany({
        where: { id: { in: ids }, userId: user.id },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: `${ids.length} notification(s) marked as read` });
    }

    return NextResponse.json({ error: "Provide { ids: string[] } or { all: true }" }, { status: 400 });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
