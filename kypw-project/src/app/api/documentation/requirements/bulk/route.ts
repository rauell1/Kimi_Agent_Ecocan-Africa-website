import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { logAudit } from "@/lib/audit";

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

// PATCH: Bulk update checklist across multiple events by event type
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { eventTypes, updates } = body;

    if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
      return NextResponse.json({ error: "eventTypes array is required" }, { status: 400 });
    }
    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ error: "updates object is required" }, { status: 400 });
    }

    // Find all events matching the specified types
    const events = await db.event.findMany({
      where: { eventType: { in: eventTypes } },
      select: { id: true, title: true, eventType: true },
    });

    let totalRequirementsUpdated = 0;
    const affectedEvents: string[] = [];

    for (const event of events) {
      const reqs = await db.eventDocRequirement.findMany({
        where: { eventId: event.id },
      });

      for (const req of reqs) {
        // Match by docType if specified, otherwise update all
        if (updates.docType && req.docType !== updates.docType) continue;

        const updateData: Record<string, unknown> = {};
        if (updates.label !== undefined) updateData.label = updates.label;
        if (updates.hint !== undefined) updateData.hint = updates.hint;
        if (updates.required !== undefined) updateData.required = updates.required;

        if (Object.keys(updateData).length > 0) {
          await db.eventDocRequirement.update({
            where: { id: req.id },
            data: updateData,
          });
          totalRequirementsUpdated++;
        }
      }

      affectedEvents.push(event.id);

      await logAudit({
        eventId: event.id,
        userId: user.id,
        action: "checklist.bulk_update",
        entityType: "EventDocRequirement",
        metadata: { updates, matchedRequirements: reqs.length },
      });
    }

    return NextResponse.json({
      success: true,
      eventsAffected: affectedEvents.length,
      requirementsUpdated: totalRequirementsUpdated,
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Failed to bulk update requirements" }, { status: 500 });
  }
}
