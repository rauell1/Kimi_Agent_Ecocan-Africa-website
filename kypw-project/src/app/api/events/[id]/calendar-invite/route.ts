/**
 * Calendar Invite Download Endpoint
 *
 * GET /api/events/:id/calendar-invite?email=...&name=...
 *
 * Generates a personalized .ics calendar invite for an event.
 * Public — no auth required (shareable event invites).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateICSInvite, type CalendarInviteParams } from "@/lib/calendar";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Personalization from query params (optional)
    const attendeeEmail = searchParams.get("email")?.trim() || undefined;
    const attendeeName = searchParams.get("name")?.trim() || undefined;

    // Fetch event from database
    const event = await db.event.findUnique({
      where: { id },
      include: {
        participants: {
          where: attendeeEmail ? { email: attendeeEmail } : {},
          take: 1,
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Determine organizer info
    let organizerName = "Kenya Youth Parliament for Water";
    let organizerEmail = "kypwyouthforwater@gmail.com";

    if (event.createdBy) {
      const creator = await db.user.findUnique({
        where: { id: event.createdBy },
      });
      if (creator) {
        organizerName = creator.name || organizerName;
        organizerEmail = creator.email;
      }
    }

    // Build event URL — derive from request origin for environment flexibility
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://rauell.systems";
    const eventUrl = `${origin}/events/${event.slug ?? event.id}`;

    // Default dates — if missing, use now
    const startDate = event.startAt ?? new Date();
    const endDate = event.endAt ?? undefined;

    // Build calendar params
    const icsParams: CalendarInviteParams = {
      title: event.title,
      description: event.description ?? "",
      startDate,
      endDate,
      location: event.locationName ?? undefined,
      region: event.region ?? undefined,
      organizerName,
      organizerEmail,
      attendeeName: attendeeName || "Guest",
      attendeeEmail: attendeeEmail || "guest@rauell.systems",
      eventType: event.eventType || undefined,
      eventId: event.id,
      eventUrl,
    };

    // Generate the .ics content
    const icsContent = generateICSInvite(icsParams);

    // Build filename from slug or ID
    const filename = event.slug
      ? `kypw-${event.slug}.ics`
      : `kypw-${event.id.slice(0, 8)}.ics`;

    // Return as downloadable .ics file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(Buffer.byteLength(icsContent, "utf-8")),
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("[calendar-invite:error]", error);
    return NextResponse.json(
      { error: "Failed to generate calendar invite" },
      { status: 500 },
    );
  }
}
