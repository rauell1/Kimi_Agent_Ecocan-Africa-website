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
    // Auth required — event reports may contain sensitive content
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const reports = await db.eventReport.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Report content is required" }, { status: 400 });
    }

    const report = await db.eventReport.create({
      data: {
        eventId: id,
        content,
        model: "manual",
      },
    });

    await logAudit({
      eventId: id,
      userId: user.id,
      action: "report.create",
      entityType: "EventReport",
      entityId: report.id,
      after: report,
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) return NextResponse.json({ error: "reportId is required" }, { status: 400 });

    const before = await db.eventReport.findUnique({ where: { id: reportId } });
    await db.eventReport.delete({ where: { id: reportId, eventId: id } });

    await logAudit({
      eventId: id,
      userId: user.id,
      action: "report.delete",
      entityType: "EventReport",
      entityId: reportId,
      before,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
