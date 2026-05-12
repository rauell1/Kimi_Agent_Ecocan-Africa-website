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
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get("public") === "true";
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (publicOnly) {
      where.status = "published";
    } else if (status) {
      where.status = status;
    }

    const posts = await db.newsPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("List news error:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, content, excerpt, status, coverUrl } = body;

    if (!title || title.trim().length < 2) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!content || content.trim().length < 2) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 120);

    const post = await db.newsPost.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt?.trim() || null,
        status: status || "draft",
        coverUrl: coverUrl || null,
        authorId: user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create news error:", error);
    return NextResponse.json({ error: "Failed to create news post" }, { status: 500 });
  }
}
