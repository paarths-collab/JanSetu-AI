import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  classifyComplaint,
  ComplaintAccessDeniedError,
  ComplaintService
} from "./src/complaintService.js";

describe("ComplaintService", () => {
  it("creates a complaint with deterministic routing and acknowledgement", () => {
    const service = new ComplaintService(undefined, () => new Date("2026-07-07T10:00:00.000Z"));

    const complaint = service.createForUser("user-1", {
      imageUrl: "https://example.com/photo.jpg",
      text: "Garbage dump is overflowing near the main road and school gate.",
      location: { address: "MG Road, Pune", ward: "Ward 12", city: "Pune", state: "Maharashtra" }
    });

    const tracked = service.trackForUser("user-1", complaint.id);

    expect(complaint.id).toBe("SB-2026-0001");
    expect(complaint.issue_type).toBe("garbage");
    expect(complaint.department).toBe("Municipal Sanitation Department");
    expect(complaint.severity).toBe("high");
    expect(tracked.updates).toHaveLength(1);
    expect(tracked.updates[0].status).toBe("submitted");
  });

  it("keeps complaint tracking owner scoped", () => {
    const service = new ComplaintService(undefined, () => new Date("2026-07-07T10:00:00.000Z"));
    const complaint = service.createForUser("owner", {
      text: "Streetlight is not working in a dark lane near my house.",
      location: { address: "Lane 4", ward: "Ward 5" }
    });

    expect(() => service.trackForUser("other-user", complaint.id)).toThrow(ComplaintAccessDeniedError);
  });

  it("updates status timeline and resolved timestamp", () => {
    let current = new Date("2026-07-07T10:00:00.000Z");
    const service = new ComplaintService(undefined, () => current);
    const complaint = service.createForUser("user-1", {
      text: "There is a large pothole causing accidents on the main road.",
      location: { address: "Ring Road", ward: "Ward 9" }
    });

    current = new Date("2026-07-08T10:00:00.000Z");
    service.transition(complaint.id, "assigned", "Assigned to PWD field engineer.");
    current = new Date("2026-07-09T10:00:00.000Z");
    service.transition(complaint.id, "resolved", "Road patch completed.");

    const tracked = service.trackForUser("user-1", complaint.id);
    expect(tracked.complaint.status).toBe("resolved");
    expect(tracked.complaint.resolved_at).toBe("2026-07-09T10:00:00.000Z");
    expect(tracked.updates.map((update) => update.status)).toEqual(["submitted", "assigned", "resolved"]);
  });

  it("rejects invalid complaint payloads with contract validation", () => {
    const service = new ComplaintService();
    expect(() =>
      service.createForUser("user-1", {
        text: "short",
        location: { address: "" }
      })
    ).toThrow(z.ZodError);
  });

  it("classifies common civic issue phrases without AI dependency", () => {
    expect(classifyComplaint("contaminated water supply from tap").issue_type).toBe("water_supply");
    expect(classifyComplaint("drain overflow and sewage flooding").severity).toBe("high");
    expect(classifyComplaint("late night loudspeaker noise").department).toBe("Local Police and Pollution Control");
  });
});
