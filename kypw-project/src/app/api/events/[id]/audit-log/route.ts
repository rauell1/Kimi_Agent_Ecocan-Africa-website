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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0"));
    const action = searchParams.get("action");

    const where: Record<string, unknown> = { eventId: id };
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        before: log.before ? JSON.parse(log.before) : null,
        after: log.after ? JSON.parse(log.after) : null,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
        createdAt: log.createdAt.toISOString(),
        user: log.user ? { id: log.user.id, email: log.user.email, name: log.user.name } : null,
      })),
      total,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 });
  }
}
