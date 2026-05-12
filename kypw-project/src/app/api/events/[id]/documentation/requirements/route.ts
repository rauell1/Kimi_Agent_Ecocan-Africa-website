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

// GET: Fetch checklist requirements for an event
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const requirements = await db.eventDocRequirement.findMany({
      where: { eventId: id },
      orderBy: { sortOrder: "asc" },
    });

    // Fetch existing documentation to compute completion status
    const docs = await db.eventDocumentation.findMany({
      where: { eventId: id },
      select: { type: true, id: true },
    });
    const docTypes = new Set(docs.map((d) => d.type));

    const requirementsWithStatus = requirements.map((req) => ({
      id: req.id,
      docType: req.docType,
      label: req.label,
      hint: req.hint,
      required: req.required,
      sortOrder: req.sortOrder,
      completed: docTypes.has(req.docType),
    }));

    return NextResponse.json({ requirements: requirementsWithStatus });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 });
  }
}

// PUT: Update checklist requirements (bulk replace or individual updates)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: eventId } = await params;
    const body = await request.json();
    const { requirements } = body;

    if (!Array.isArray(requirements)) {
      return NextResponse.json({ error: "requirements array is required" }, { status: 400 });
    }

    // Get current requirements for audit diff
    const existingReqs = await db.eventDocRequirement.findMany({
      where: { eventId },
      orderBy: { sortOrder: "asc" },
    });
    const beforeMap = new Map(existingReqs.map((r) => [r.id, r]));

    // Delete all existing requirements and recreate
    await db.eventDocRequirement.deleteMany({ where: { eventId } });

    const created: Array<Awaited<ReturnType<typeof db.eventDocRequirement.create>>> = [];
    for (let i = 0; i < requirements.length; i++) {
      const req = requirements[i];
      const createdReq = await db.eventDocRequirement.create({
        data: {
          eventId,
          docType: req.docType || "other",
          label: req.label || "Untitled",
          hint: req.hint || null,
          required: req.required !== false,
          sortOrder: req.sortOrder ?? i,
        },
      });
      created.push(createdReq);
    }

    // Audit log
    await logAudit({
      eventId,
      userId: user.id,
      action: "checklist.update",
      entityType: "EventDocRequirement",
      before: existingReqs,
      after: created,
      metadata: { count: created.length, previousCount: existingReqs.length },
    });

    // Fetch existing documentation to compute completion status
    const docs = await db.eventDocumentation.findMany({
      where: { eventId },
      select: { type: true },
    });
    const docTypes = new Set(docs.map((d) => d.type));

    return NextResponse.json({
      requirements: created.map((req) => ({
        id: req.id,
        docType: req.docType,
        label: req.label,
        hint: req.hint,
        required: req.required,
        sortOrder: req.sortOrder,
        completed: docTypes.has(req.docType),
      })),
    });
  } catch (error) {
    console.error("Update requirements error:", error);
    return NextResponse.json({ error: "Failed to update requirements" }, { status: 500 });
  }
}

// POST: Apply checklist template defaults for a given event type
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: eventId } = await params;
    const body = await request.json();
    const { eventType } = body;

    // Default templates per event type
    const templates: Record<string, Array<{ docType: string; label: string; hint: string; required: boolean }>> = {
      workshop: [
        { docType: "photo", label: "Workshop photos", hint: "Group and activity photos (min 5)", required: true },
        { docType: "attendance_sheet", label: "Attendance sheet", hint: "Signed participant register", required: true },
        { docType: "feedback_form", label: "Participant feedback", hint: "Collected feedback forms or survey results", required: true },
        { docType: "report", label: "Workshop report", hint: "Post-event narrative summary", required: false },
      ],
      webinar: [
        { docType: "attendance_sheet", label: "Attendance list", hint: "Registered attendees and actual participants", required: true },
        { docType: "feedback_form", label: "Post-webinar survey", hint: "Participant satisfaction survey results", required: true },
        { docType: "report", label: "Webinar summary", hint: "Key discussion points and outcomes", required: false },
      ],
      field_visit: [
        { docType: "photo", label: "Site photos", hint: "Before and after photos of the visited site", required: true },
        { docType: "attendance_sheet", label: "Team attendance", hint: "List of team members who participated", required: true },
        { docType: "report", label: "Field visit report", hint: "Findings, observations, and recommendations", required: true },
        { docType: "video", label: "Video documentation", hint: "Short video clip of the site visit", required: false },
      ],
      hackathon: [
        { docType: "photo", label: "Event photos", hint: "Team photos, presentations, and demos", required: true },
        { docType: "attendance_sheet", label: "Participants list", hint: "All registered hackathon participants", required: true },
        { docType: "report", label: "Winning solutions", hint: "Documentation of winning projects/pitches", required: true },
        { docType: "feedback_form", label: "Participant feedback", hint: "Post-event survey responses", required: false },
      ],
      conference: [
        { docType: "photo", label: "Conference photos", hint: "Keynote, sessions, networking (min 10)", required: true },
        { docType: "attendance_sheet", label: "Delegate register", hint: "Full list of conference delegates", required: true },
        { docType: "report", label: "Conference proceedings", hint: "Session summaries, key takeaways", required: true },
        { docType: "feedback_form", label: "Delegate feedback", hint: "Post-conference survey results", required: true },
        { docType: "video", label: "Session recordings", hint: "Video recordings of keynote sessions", required: false },
      ],
      dialogue: [
        { docType: "photo", label: "Dialogue photos", hint: "Photos from the dialogue session", required: true },
        { docType: "attendance_sheet", label: "Attendance sheet", hint: "Participant attendance list", required: true },
        { docType: "report", label: "Dialogue summary", hint: "Key discussion points and resolutions", required: true },
        { docType: "feedback_form", label: "Participant feedback", hint: "Feedback forms collected", required: false },
      ],
      campaign: [
        { docType: "photo", label: "Campaign photos", hint: "Activity and outreach photos", required: true },
        { docType: "report", label: "Campaign report", hint: "Reach, impact, and outcomes", required: true },
      ],
    };

    const template = templates[eventType] || templates.other || [
      { docType: "photo", label: "Event photos", hint: "Photos from the event", required: true },
      { docType: "attendance_sheet", label: "Attendance sheet", hint: "Participant register", required: true },
      { docType: "report", label: "Event report", hint: "Summary of the event", required: false },
    ];

    // Get current requirements for audit
    const existingReqs = await db.eventDocRequirement.findMany({
      where: { eventId },
    });

    // Replace existing
    await db.eventDocRequirement.deleteMany({ where: { eventId } });

    const created = await db.eventDocRequirement.createMany({
      data: template.map((t, i) => ({
        eventId,
        docType: t.docType,
        label: t.label,
        hint: t.hint,
        required: t.required,
        sortOrder: i,
      })),
    });

    await logAudit({
      eventId,
      userId: user.id,
      action: "checklist.update",
      entityType: "EventDocRequirement",
      before: existingReqs,
      after: template,
      metadata: { action: "reset_template", eventType, count: template.length },
    });

    return NextResponse.json({
      success: true,
      count: created.count,
      template: template.map((t, i) => ({
        ...t,
        sortOrder: i,
        completed: false,
      })),
    });
  } catch (error) {
    console.error("Reset requirements error:", error);
    return NextResponse.json({ error: "Failed to reset requirements" }, { status: 500 });
  }
}

// Bulk update across multiple events
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { eventIds, updates } = body;

    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      return NextResponse.json({ error: "eventIds array is required" }, { status: 400 });
    }
    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ error: "updates object is required" }, { status: 400 });
    }

    let totalUpdated = 0;
    for (const eventId of eventIds) {
      const existingReqs = await db.eventDocRequirement.findMany({
        where: { eventId },
      });

      for (const req of existingReqs) {
        const updateData: Record<string, unknown> = {};
        if (updates.label !== undefined) updateData.label = updates.label;
        if (updates.hint !== undefined) updateData.hint = updates.hint;
        if (updates.required !== undefined) updateData.required = updates.required;

        if (Object.keys(updateData).length > 0) {
          await db.eventDocRequirement.update({
            where: { id: req.id },
            data: updateData,
          });
          totalUpdated++;
        }
      }

      await logAudit({
        eventId,
        userId: user.id,
        action: "checklist.bulk_update",
        entityType: "EventDocRequirement",
        metadata: { updates, affectedRequirements: existingReqs.length },
      });
    }

    return NextResponse.json({ success: true, totalUpdated, eventsAffected: eventIds.length });
  } catch (error) {
    console.error("Bulk update requirements error:", error);
    return NextResponse.json({ error: "Failed to bulk update requirements" }, { status: 500 });
  }
}
