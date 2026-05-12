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

interface CsvRow {
  full_name: string;
  email?: string;
  phone?: string;
  organization?: string;
  region?: string;
  gender?: string;
  age_group?: string;
  role_at_event?: string;
  [key: string]: string | undefined;
}

function parseCsv(csvText: string): CsvRow[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCsvLine(line);
    const row: CsvRow = {} as CsvRow;
    headers.forEach((h, idx) => {
      (row as Record<string, string | undefined>)[h] = values[idx]?.trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

const VALID_GENDERS = ["male", "female", "other", "prefer_not"];
const VALID_AGE_GROUPS = ["under-18", "18-35", "36-50", "50+"];

function validateRow(row: CsvRow, rowIndex: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const rowNum = rowIndex + 2; // +1 for header, +1 for 0-index

  if (!row.full_name || row.full_name.trim().length < 2) {
    errors.push("Full name is required (min 2 characters)");
  }

  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push("Invalid email format");
  }

  if (row.phone && row.phone.trim().length > 40) {
    errors.push("Phone number too long (max 40 chars)");
  }

  if (row.gender) {
    const normalized = row.gender.toLowerCase().trim();
    if (!VALID_GENDERS.includes(normalized)) {
      errors.push(`Invalid gender. Must be one of: ${VALID_GENDERS.join(", ")}`);
    }
  }

  if (row.age_group) {
    const normalized = row.age_group.toLowerCase().trim().replace(/\s/g, "");
    if (!VALID_AGE_GROUPS.includes(normalized)) {
      errors.push(`Invalid age group. Must be one of: ${VALID_AGE_GROUPS.join(", ")}`);
    }
  }

  if (row.full_name && row.full_name.length > 120) {
    errors.push("Full name too long (max 120 chars)");
  }

  if (row.organization && row.organization.length > 150) {
    errors.push("Organization name too long (max 150 chars)");
  }

  if (row.region && row.region.length > 100) {
    errors.push("Region too long (max 100 chars)");
  }

  return { valid: errors.length === 0, errors };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: eventId } = await params;
    const body = await request.json();
    const { csv, dryRun = false, mode = "insert" } = body;

    if (!csv || typeof csv !== "string") {
      return NextResponse.json({ error: "CSV content is required" }, { status: 400 });
    }

    if (csv.length > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "CSV too large (max 2 MB)" }, { status: 400 });
    }

    // Verify event exists
    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const rows = parseCsv(csv);
    if (rows.length === 0) {
      return NextResponse.json({ error: "No data rows found in CSV" }, { status: 400 });
    }

    // Validate all rows
    const validRows: { row: CsvRow; index: number }[] = [];
    const rejectedRows: { row: CsvRow; index: number; errors: string[] }[] = [];

    rows.forEach((row, index) => {
      const validation = validateRow(row, index);
      if (validation.valid) {
        validRows.push({ row, index });
      } else {
        rejectedRows.push({ row, index, errors: validation.errors });
      }
    });

    if (dryRun) {
      // Return validation results without writing anything
      await logAudit({
        eventId,
        userId: user.id,
        action: "participant.import",
        entityType: "EventParticipant",
        metadata: {
          mode: "dry_run",
          totalRows: rows.length,
          validRows: validRows.length,
          rejectedRows: rejectedRows.length,
        },
      });

      return NextResponse.json({
        dryRun: true,
        totalRows: rows.length,
        validRows: validRows.length,
        rejectedRows: rejectedRows.length,
        valid: validRows.map((v) => v.row),
        rejected: rejectedRows.map((r) => ({
          rowNumber: r.index + 2,
          data: r.row,
          errors: r.errors,
        })),
      });
    }

    // Actually import
    let inserted = 0;
    let updated = 0;
    const importErrors: { row: CsvRow; index: number; errors: string[] }[] = [];

    for (const { row, index } of validRows) {
      try {
        const gender = row.gender?.toLowerCase().trim() || null;
        const ageGroup = row.age_group?.toLowerCase().trim().replace(/\s/g, "") || null;

        if (mode === "update" && row.email) {
          // Check for existing participant by email
          const existing = await db.eventParticipant.findFirst({
            where: { eventId, email: row.email },
          });
          if (existing) {
            await db.eventParticipant.update({
              where: { id: existing.id },
              data: {
                fullName: row.full_name.trim(),
                phone: row.phone?.trim() || existing.phone,
                organization: row.organization?.trim() || existing.organization,
                region: row.region?.trim() || existing.region,
                gender: gender || existing.gender,
                ageGroup: ageGroup || existing.ageGroup,
                roleAtEvent: row.role_at_event?.trim() || existing.roleAtEvent,
              },
            });
            updated++;
            continue;
          }
        }

        await db.eventParticipant.create({
          data: {
            eventId,
            fullName: row.full_name.trim(),
            email: row.email?.trim() || null,
            phone: row.phone?.trim() || null,
            organization: row.organization?.trim() || null,
            region: row.region?.trim() || null,
            gender: gender || null,
            ageGroup: ageGroup || null,
            roleAtEvent: row.role_at_event?.trim() || null,
            attended: false,
          },
        });
        inserted++;
      } catch (err) {
        importErrors.push({
          row,
          index,
          errors: [err instanceof Error ? err.message : "Database write failed"],
        });
      }
    }

    // Log the import
    await logAudit({
      eventId,
      userId: user.id,
      action: "participant.import",
      entityType: "EventParticipant",
      metadata: {
        mode,
        totalRows: rows.length,
        validRows: validRows.length,
        rejectedRows: rejectedRows.length,
        inserted,
        updated,
        importErrors: importErrors.length,
      },
    });

    return NextResponse.json({
      dryRun: false,
      totalRows: rows.length,
      validRows: validRows.length,
      rejectedRows: rejectedRows.length,
      inserted,
      updated,
      importErrors: importErrors.map((e) => ({
        rowNumber: e.index + 2,
        data: e.row,
        errors: e.errors,
      })),
      rejected: rejectedRows.map((r) => ({
        rowNumber: r.index + 2,
        data: r.row,
        errors: r.errors,
      })),
    });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: "Failed to import participants" }, { status: 500 });
  }
}
