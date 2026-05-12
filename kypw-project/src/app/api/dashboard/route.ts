import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await db.userSession.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [total, upcoming, completed, participants] = await Promise.all([
      db.event.count(),
      db.event.count({ where: { startAt: { gte: new Date() } } }),
      db.event.count({ where: { status: "completed" } }),
      db.eventParticipant.count(),
    ]);

    return NextResponse.json({
      stats: { total, upcoming, completed, participants },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
