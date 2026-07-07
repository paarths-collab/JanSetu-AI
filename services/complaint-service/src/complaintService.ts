import {
  Complaint,
  ComplaintSchema,
  ComplaintSeverity,
  ComplaintStatus,
  ComplaintUpdate,
  ComplaintUpdateSchema,
  CreateComplaintInput,
  CreateComplaintInputSchema,
  IssueType,
  TrackComplaintResponseSchema
} from "../../../packages/contracts/src/index.js";

type Classification = {
  issue_type: IssueType;
  department: string;
  severity: ComplaintSeverity;
};

export class ComplaintNotFoundError extends Error {
  constructor(complaintId: string) {
    super(`Complaint not found: ${complaintId}`);
    this.name = "ComplaintNotFoundError";
  }
}

export class ComplaintAccessDeniedError extends Error {
  constructor(complaintId: string) {
    super(`User cannot access complaint ${complaintId}`);
    this.name = "ComplaintAccessDeniedError";
  }
}

export class InMemoryComplaintRepository {
  private readonly complaints = new Map<string, Complaint>();
  private readonly updates = new Map<string, ComplaintUpdate[]>();

  insert(complaint: Complaint, initialUpdate: ComplaintUpdate): Complaint {
    const parsedComplaint = ComplaintSchema.parse(complaint);
    const parsedUpdate = ComplaintUpdateSchema.parse(initialUpdate);
    this.complaints.set(parsedComplaint.id, parsedComplaint);
    this.updates.set(parsedComplaint.id, [parsedUpdate]);
    return parsedComplaint;
  }

  getById(complaintId: string): Complaint | undefined {
    return this.complaints.get(complaintId);
  }

  listByUser(userId: string): Complaint[] {
    return [...this.complaints.values()].filter((complaint) => complaint.user_id === userId);
  }

  listAll(): Complaint[] {
    return [...this.complaints.values()];
  }

  updatesFor(complaintId: string): ComplaintUpdate[] {
    return this.updates.get(complaintId) ?? [];
  }

  addUpdate(update: ComplaintUpdate): ComplaintUpdate {
    const parsed = ComplaintUpdateSchema.parse(update);
    const complaint = this.complaints.get(parsed.complaint_id);
    if (!complaint) {
      throw new ComplaintNotFoundError(parsed.complaint_id);
    }

    this.complaints.set(parsed.complaint_id, {
      ...complaint,
      status: parsed.status,
      resolved_at: parsed.status === "resolved" ? parsed.created_at : complaint.resolved_at
    });
    this.updates.set(parsed.complaint_id, [...this.updatesFor(parsed.complaint_id), parsed]);
    return parsed;
  }
}

export class ComplaintService {
  private sequence = 0;

  constructor(
    private readonly repo = new InMemoryComplaintRepository(),
    private readonly now = () => new Date()
  ) {}

  createForUser(userId: string, input: CreateComplaintInput): Complaint {
    const parsed = CreateComplaintInputSchema.parse(input);
    const createdAt = this.now().toISOString();
    const id = this.nextComplaintId(createdAt);
    const classification = classifyComplaint(parsed.text);

    return this.repo.insert(
      {
        id,
        user_id: userId,
        issue_type: classification.issue_type,
        description: parsed.text,
        image_url: parsed.imageUrl,
        location: parsed.location,
        department: classification.department,
        severity: classification.severity,
        status: "submitted",
        created_at: createdAt
      },
      {
        id: `${id}-U1`,
        complaint_id: id,
        status: "submitted",
        note: "Complaint submitted and acknowledgement generated.",
        created_at: createdAt
      }
    );
  }

  trackForUser(userId: string, complaintId: string) {
    const complaint = this.requireComplaint(complaintId);
    if (complaint.user_id !== userId) {
      throw new ComplaintAccessDeniedError(complaintId);
    }

    return TrackComplaintResponseSchema.parse({
      complaint,
      updates: this.repo.updatesFor(complaintId)
    });
  }

  listForUser(userId: string): Complaint[] {
    return this.repo.listByUser(userId);
  }

  listAllForDashboard(): Complaint[] {
    return this.repo.listAll();
  }

  transition(complaintId: string, status: ComplaintStatus, note: string): ComplaintUpdate {
    this.requireComplaint(complaintId);
    const createdAt = this.now().toISOString();
    return this.repo.addUpdate({
      id: `${complaintId}-U${this.repo.updatesFor(complaintId).length + 1}`,
      complaint_id: complaintId,
      status,
      note,
      created_at: createdAt
    });
  }

  private requireComplaint(complaintId: string): Complaint {
    const complaint = this.repo.getById(complaintId);
    if (!complaint) {
      throw new ComplaintNotFoundError(complaintId);
    }
    return complaint;
  }

  private nextComplaintId(isoDate: string): string {
    this.sequence += 1;
    const year = new Date(isoDate).getUTCFullYear();
    return `SB-${year}-${String(this.sequence).padStart(4, "0")}`;
  }
}

export function classifyComplaint(text: string): Classification {
  const normalized = text.toLowerCase();

  if (matches(normalized, ["garbage", "trash", "waste", "dump", "kachra"])) {
    return {
      issue_type: "garbage",
      department: "Municipal Sanitation Department",
      severity: matches(normalized, ["school", "hospital", "main road", "overflow"]) ? "high" : "medium"
    };
  }

  if (matches(normalized, ["pothole", "road broken", "crater", "gaddha"])) {
    return {
      issue_type: "pothole",
      department: "Public Works Department",
      severity: matches(normalized, ["accident", "injury", "highway", "main road"]) ? "high" : "medium"
    };
  }

  if (matches(normalized, ["streetlight", "light not working", "dark lane"])) {
    return {
      issue_type: "streetlight",
      department: "Municipal Electrical Department",
      severity: matches(normalized, ["unsafe", "women", "crime", "accident"]) ? "high" : "low"
    };
  }

  if (matches(normalized, ["water", "pipeline", "tap", "leak"])) {
    return {
      issue_type: "water_supply",
      department: "Water Supply Department",
      severity: matches(normalized, ["contaminated", "sewage", "no water"]) ? "high" : "medium"
    };
  }

  if (matches(normalized, ["drain", "sewer", "sewage", "flooding"])) {
    return {
      issue_type: "drainage",
      department: "Drainage and Sewerage Department",
      severity: matches(normalized, ["flood", "sewage", "overflow"]) ? "high" : "medium"
    };
  }

  if (matches(normalized, ["noise", "loudspeaker", "construction noise"])) {
    return {
      issue_type: "noise",
      department: "Local Police and Pollution Control",
      severity: "low"
    };
  }

  return {
    issue_type: "other",
    department: "Public Grievance Cell",
    severity: "medium"
  };
}

function matches(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}
