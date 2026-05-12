import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "No account found with that email" }, { status: 404 });
    }

    const token = `reset_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // In production, send email with reset link.
    // In development, return the token directly for testing.
    const isDev = process.env.NODE_ENV !== "production";

    return NextResponse.json({
      message: "If an account exists with that email, a reset token has been generated.",
      ...(isDev && { token }),
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const resetRecord = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    if (resetRecord.usedAt) {
      return NextResponse.json({ error: "This reset token has already been used" }, { status: 400 });
    }

    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "This reset token has expired" }, { status: 400 });
    }

    const hashedPassword = hashPassword(newPassword);

    await db.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all existing sessions for security
    await db.userSession.deleteMany({
      where: { userId: resetRecord.userId },
    });

    return NextResponse.json({ message: "Password has been reset successfully. Please sign in again." });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
