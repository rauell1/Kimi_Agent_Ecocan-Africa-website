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
    const { id } = await params;
    const post = await db.newsPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "News post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Get news error:", error);
    return NextResponse.json({ error: "Failed to fetch news post" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { title, content, excerpt, status, coverUrl } = body;

    const existing = await db.newsPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "News post not found" }, { status: 404 });
    }

    let slug: string | undefined;
    if (title && title.trim() !== existing.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 120);
    }

    const post = await db.newsPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content: content.trim() }),
        ...(excerpt !== undefined && { excerpt: excerpt?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(coverUrl !== undefined && { coverUrl: coverUrl || null }),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Update news error:", error);
    return NextResponse.json({ error: "Failed to update news post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await db.newsPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "News post not found" }, { status: 404 });
    }

    await db.newsPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete news error:", error);
    return NextResponse.json({ error: "Failed to delete news post" }, { status: 500 });
  }
}
