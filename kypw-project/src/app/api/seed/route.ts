import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  try {
    // Block in production — seed is only for local development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Seed endpoint is disabled in production" },
        { status: 403 },
      );
    }

    // Create admin user
    const adminPassword = hashPassword("admin123");
    await db.user.upsert({
      where: { email: "admin@kypw.ke" },
      update: {},
      create: {
        email: "admin@kypw.ke",
        password: adminPassword,
        name: "KYPW Admin",
        role: "admin",
      },
    });

    // Create sample events
    const events = [
      {
        title: "Nairobi Water Security Workshop",
        description: "A workshop bringing together youth leaders from Nairobi County to discuss water security challenges and solutions.",
        eventType: "workshop",
        status: "published",
        startAt: new Date("2025-03-15T09:00:00"),
        endAt: new Date("2025-03-15T17:00:00"),
        region: "Nairobi",
        locationName: "Kenyatta International Conference Centre",
        locationType: "physical",
      },
      {
        title: "Lake Victoria Basin Dialogue",
        description: "Multi-stakeholder dialogue on water governance in the Lake Victoria basin, focusing on youth participation.",
        eventType: "dialogue",
        status: "published",
        startAt: new Date("2025-04-20T10:00:00"),
        endAt: new Date("2025-04-20T16:00:00"),
        region: "Kisumu",
        locationName: "Kisumu Hotel",
        locationType: "physical",
      },
      {
        title: "Water Data Hackathon 2025",
        description: "48-hour hackathon to develop data-driven solutions for water management across Kenya.",
        eventType: "hackathon",
        status: "ongoing",
        startAt: new Date("2025-06-01T08:00:00"),
        endAt: new Date("2025-06-03T20:00:00"),
        region: "Mombasa",
        locationName: "Technical University of Mombasa",
        locationType: "physical",
      },
      {
        title: "Community Water Monitoring Webinar",
        description: "Online training on community-based water quality monitoring techniques.",
        eventType: "webinar",
        status: "completed",
        startAt: new Date("2025-02-10T14:00:00"),
        endAt: new Date("2025-02-10T16:00:00"),
        region: null,
        locationName: "Zoom",
        locationType: "virtual",
      },
      {
        title: "Turkana Water Point Assessment",
        description: "Field visit to assess water points and community water access in Turkana County.",
        eventType: "field_visit",
        status: "planned",
        startAt: new Date("2025-07-10T06:00:00"),
        endAt: new Date("2025-07-13T18:00:00"),
        region: "Turkana",
        locationName: "Lodwar Town",
        locationType: "physical",
      },
    ];

    for (const evt of events) {
      const slug = evt.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await db.event.upsert({
        where: { slug },
        update: {},
        create: {
          ...evt,
          slug,
          createdBy: "admin",
        },
      });
    }

    return NextResponse.json({ success: true, message: "Seed data created" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
