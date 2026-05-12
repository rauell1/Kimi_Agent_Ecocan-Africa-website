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
    // Auth required — documentation metadata is dashboard-only
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const docs = await db.eventDocumentation.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch documentation" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { type, title, description, fileUrl, externalUrl } = body;

    if (!title || title.trim().length < 2) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const doc = await db.eventDocumentation.create({
      data: {
        eventId: id,
        type: type || "photo",
        title,
        description: description || null,
        fileUrl: fileUrl || null,
        externalUrl: externalUrl || null,
        uploadedBy: user.id,
      },
    });

    await logAudit({
      eventId: id,
      userId: user.id,
      action: "documentation.create",
      entityType: "EventDocumentation",
      entityId: doc.id,
      after: doc,
    });

    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add documentation" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("docId");

    if (!docId) return NextResponse.json({ error: "docId is required" }, { status: 400 });

    const before = await db.eventDocumentation.findUnique({ where: { id: docId } });
    await db.eventDocumentation.delete({ where: { id: docId, eventId: id } });

    await logAudit({
      eventId: id,
      userId: user.id,
      action: "documentation.delete",
      entityType: "EventDocumentation",
      entityId: docId,
      before,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove documentation" }, { status: 500 });
  }
}
