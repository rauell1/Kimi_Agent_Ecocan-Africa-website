import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

async function getAuthUser() {
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

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, avatarUrl, locale, preferences } = body;

    const updateData: Record<string, unknown> = {};
    if (typeof name === "string") updateData.name = name.trim() || null;
    if (typeof bio === "string") updateData.bio = bio.trim() || null;
    if (typeof avatarUrl === "string") updateData.avatarUrl = avatarUrl.trim() || null;
    if (typeof locale === "string" && ["en", "sw"].includes(locale)) updateData.locale = locale;
    if (typeof preferences === "string") updateData.preferences = preferences;

    const updated = await db.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
        bio: updated.bio,
        locale: updated.locale,
        preferences: updated.preferences,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
