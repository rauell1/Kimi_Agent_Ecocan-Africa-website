export interface EventRow {
  id: string; title: string; description: string | null; eventType: string; status: string;
  startAt: string | null; endAt: string | null; region: string | null;
  locationName: string | null; locationType: string; coverImageUrl: string | null;
}

export interface Participant {
  id: string; eventId: string; fullName: string; email: string | null; phone: string | null;
  organization: string | null; region: string | null; gender: string | null; ageGroup: string | null;
  roleAtEvent: string | null; attended: boolean;
}

export interface DocItem {
  id: string; eventId: string; type: string; title: string; description: string | null;
  fileUrl: string | null; externalUrl: string | null; createdAt: string;
}

export interface Metrics {
  id?: string; eventId: string; participantsTotal: number; youthCount: number; womenCount: number;
  countiesReached: number; waterPointsAssessed: number; communitiesEngaged: number;
  partnershipsFormed: number; budgetSpent: number; currency: string; narrativeSummary: string | null;
}

export interface ReportItem { id: string; content: string; model: string | null; createdAt: string }

export interface DocRequirement {
  id: string; docType: string; label: string; hint: string | null;
  required: boolean; sortOrder: number; completed: boolean;
}

export interface AuditLogEntry {
  id: string; action: string; entityType: string | null; entityId: string | null;
  before: Record<string, unknown> | null; after: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null; createdAt: string;
  user: { id: string; email: string; name: string | null } | null;
}

export interface CsvValidationResult {
  dryRun: boolean; totalRows: number; validRows: number; rejectedRows: number;
  valid?: Array<Record<string, string | undefined>>;
  rejected: Array<{ rowNumber: number; data: Record<string, string | undefined>; errors: string[] }>;
  inserted?: number; updated?: number;
  importErrors?: Array<{ rowNumber: number; data: Record<string, string | undefined>; errors: string[] }>;
}
