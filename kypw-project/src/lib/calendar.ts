/**
 * KYPW Calendar Invite Generator
 *
 * Generates standards-compliant .ics (iCalendar) files for KYPW events.
 * Pure TypeScript — no external dependencies.
 *
 * iCalendar spec: https://www.rfc-editor.org/rfc/rfc5545
 */

// ── Types ──────────────────────────────────────────────

export interface CalendarInviteParams {
  /** Event title */
  title: string;
  /** Event description (rich text or plain text) */
  description: string;
  /** Event start datetime (interpreted as Africa/Nairobi) */
  startDate: Date;
  /** Event end datetime (optional, defaults to start + 1 hour) */
  endDate?: Date;
  /** Venue name + address */
  location?: string;
  /** County/region in Kenya */
  region?: string;
  /** Name of the person who created the event */
  organizerName: string;
  /** Email of the event creator */
  organizerEmail: string;
  /** Recipient's name (personalized!) */
  attendeeName: string;
  /** Recipient's email */
  attendeeEmail: string;
  /** workshop, conference, dialogue, etc. */
  eventType?: string;
  /** Internal event ID for UID */
  eventId?: string;
  /** Link to event page on website */
  eventUrl?: string;
}

// ── Constants ──────────────────────────────────────────

const NAIROBI_OFFSET_HOURS = 3; // EAT = UTC+3, no DST in Kenya

const PRODID = "-//KYPW//Kenya Youth Parliament for Water//EN";

// ── Helpers ────────────────────────────────────────────

/**
 * Convert a Date (assumed to be in Africa/Nairobi local time) to a UTC
 * timestamp, then format as iCalendar DATE-TIME with Z suffix.
 */
function formatUTCDate(date: Date): string {
  // Treat the incoming Date as Africa/Nairobi local time.
  // Subtract the Nairobi offset to get UTC.
  const utcMs = date.getTime() - NAIROBI_OFFSET_HOURS * 60 * 60 * 1000;
  const utcDate = new Date(utcMs);

  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utcDate.getUTCDate()).padStart(2, "0");
  const hours = String(utcDate.getUTCHours()).padStart(2, "0");
  const minutes = String(utcDate.getUTCMinutes()).padStart(2, "0");
  const seconds = String(utcDate.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generate an iCalendar DTSTAMP (must be in UTC).
 */
function generateDTStamp(): string {
  return formatUTCDate(new Date());
}

/**
 * Escape text values for iCalendar.
 * Per RFC 5545 §3.3.11: escape backslashes, semicolons, commas, and newlines.
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Fold a content line at 75 octets per RFC 5545 §3.1.
 * The first line is limited to 75 octets; continuation lines are
 * indented with a single space and limited to 75 octets each.
 */
function foldLine(line: string): string {
  const MAX_OCTETS = 75;
  const lines: string[] = [];

  // Encode to UTF-8 to count octets, not characters
  // For ASCII-compatible content (which .ics mostly is), char length ≈ octet length
  if (Buffer.byteLength(line, "utf-8") <= MAX_OCTETS) {
    return line;
  }

  // First segment: up to 75 octets
  let firstLine = "";
  let octetCount = 0;
  let i = 0;

  for (i = 0; i < line.length; i++) {
    const charOctets = Buffer.byteLength(line[i], "utf-8");
    if (octetCount + charOctets > MAX_OCTETS) break;
    firstLine += line[i];
    octetCount += charOctets;
  }
  lines.push(firstLine);

  // Continuation segments: space + up to 74 more octets (space counts as 1)
  while (i < line.length) {
    let segment = " "; // leading space for continuation
    octetCount = 1; // the space

    while (i < line.length) {
      const charOctets = Buffer.byteLength(line[i], "utf-8");
      if (octetCount + charOctets > MAX_OCTETS) break;
      segment += line[i];
      octetCount += charOctets;
      i++;
    }
    lines.push(segment);
  }

  return lines.join("\r\n");
}

/**
 * Build a full iCalendar content line (property:value), escaped and folded.
 */
function icsLine(property: string, value: string): string {
  return foldLine(`${property}:${escapeICS(value)}`);
}

/**
 * Build a parameterized iCalendar line (property;param=value:val), escaped and folded.
 * Parameters themselves are NOT escaped (they don't contain user content).
 * Only the final value is escaped.
 */
function icsParamLine(
  property: string,
  params: Record<string, string>,
  value: string,
): string {
  const paramStr = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join(";");
  const rawLine = `${property};${paramStr}:${escapeICS(value)}`;
  return foldLine(rawLine);
}

// ── Description Builder ────────────────────────────────

/**
 * Build the personalized event description for the .ics invite.
 */
function buildDescription(params: CalendarInviteParams): string {
  const typeLabel =
    params.eventType && params.eventType !== "workshop"
      ? params.eventType.charAt(0).toUpperCase() + params.eventType.slice(1)
      : "Workshop";

  const truncatedDescription =
    params.description.length > 300
      ? params.description.slice(0, 300).trimEnd() + "..."
      : params.description;

  // Format date/time for display
  const dateStr = formatDateDisplay(params.startDate, params.endDate);

  // Build location string
  const locationParts: string[] = [];
  if (params.region) locationParts.push(params.region);
  if (params.location) locationParts.push(params.location);
  const locationDisplay = locationParts.length > 0 ? locationParts.join(", ") : "TBA";

  // Build URL reference
  const urlDisplay = params.eventUrl || "https://rauell.systems";

  const lines = [
    `You are invited to ${params.title}`,
    "",
    `Dear ${params.attendeeName},`,
    "",
    "The Kenya Youth Parliament for Water (KYPW) — the official Kenyan national chapter of the World Youth Parliament for Water (WYPW) and the African Youth Parliament for Water (AYPW) — invites you to:",
    "",
    params.title,
    "",
    `${typeLabel}: ${truncatedDescription}`,
    "",
    `Date: ${dateStr}`,
    `Location: ${locationDisplay}`,
    "",
    "This event advances Sustainable Development Goal 6 (Clean Water and Sanitation) as part of KYPW's civic action for water security across Kenya.",
    "",
    `For more details, visit: ${urlDisplay}`,
    "",
    `Organised by ${params.organizerName} (${params.organizerEmail})`,
  ];

  return lines.join("\n");
}

/**
 * Format date range for human-readable display.
 */
function formatDateDisplay(start: Date, end?: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
    hour12: true,
  };

  const startStr = start.toLocaleString("en-KE", opts);

  if (!end) return startStr;

  // Check if end is on the same day
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    const endTimeStr = end.toLocaleString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Nairobi",
      hour12: true,
    });
    return `${startStr} – ${endTimeStr}`;
  }

  const endStr = end.toLocaleString("en-KE", opts);
  return `${startStr} – ${endStr}`;
}

// ── Main Generator ─────────────────────────────────────

/**
 * Generate a complete, RFC 5545-compliant .ics file string for a KYPW event.
 *
 * @param params - Event details and attendee information
 * @returns A valid .ics file content string with CRLF line endings
 */
export function generateICSInvite(params: CalendarInviteParams): string {
  // Compute default endDate (1 hour after start) if not provided
  const endDate = params.endDate ?? new Date(params.startDate.getTime() + 60 * 60 * 1000);

  // Generate UID
  const uid = params.eventId
    ? `${params.eventId}@kypw.rauell.systems`
    : `event-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@kypw.rauell.systems`;

  // Build location
  const locationParts: string[] = [];
  if (params.region) locationParts.push(params.region);
  if (params.location) locationParts.push(params.location);
  const locationStr = locationParts.join(", ");

  // Build description
  const description = buildDescription(params);

  // Build categories
  const categories: string[] = ["KYPW", "Water Governance"];
  if (params.eventType) categories.push(params.eventType);
  categories.push("SDG 6");

  // Assemble .ics content
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    `VERSION:2.0`,
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${generateDTStamp()}`,
    `DTSTART:${formatUTCDate(params.startDate)}`,
    `DTEND:${formatUTCDate(endDate)}`,
    icsLine("SUMMARY", params.title),
    icsLine("DESCRIPTION", description),
    ...(locationStr ? [icsLine("LOCATION", locationStr)] : []),
    icsParamLine("ORGANIZER", {
      CN: `"${params.organizerName}"`,
      EMAIL: params.organizerEmail,
    }, `mailto:${params.organizerEmail}`),
    icsParamLine(
      "ATTENDEE",
      {
        CN: `"${params.attendeeName}"`,
        RSVP: "TRUE",
        ROLE: "REQ-PARTICIPANT",
      },
      `mailto:${params.attendeeEmail}`,
    ),
    ...(params.eventUrl ? [`URL:${params.eventUrl}`] : []),
    icsLine("CATEGORIES", categories.join(",")),
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "",
    "END:VCALENDAR",
  ];

  // Join with CRLF per RFC 5545 §3.1
  return lines.join("\r\n");
}
