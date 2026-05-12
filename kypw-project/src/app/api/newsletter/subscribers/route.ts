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

export async function GET(request: NextRequest) {
  try {
    // Auth required — subscriber emails are PII
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";

    const subscribers = await db.newsletterSubscriber.findMany({
      where: { status },
      orderBy: { subscribedAt: "desc" },
    });

    const totalActive = await db.newsletterSubscriber.count({ where: { status: "active" } });
    const totalUnsub = await db.newsletterSubscriber.count({ where: { status: "unsubscribed" } });

    return NextResponse.json({
      subscribers,
      stats: { totalActive, totalUnsubscribed: totalUnsub },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load subscribers" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await db.newsletterSubscriber.update({
      where: { email: email.trim().toLowerCase() },
      data: { status: "unsubscribed", unsubscribedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
