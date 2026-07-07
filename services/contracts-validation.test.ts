import { describe, expect, it } from "vitest";
import {
  CreateComplaintInputSchema,
  DashboardResponseSchema,
  UpsertProfileInputSchema
} from "../packages/contracts/src/index.js";

describe("contract validation", () => {
  it("accepts valid complaint creation requests", () => {
    const result = CreateComplaintInputSchema.safeParse({
      imageUrl: "https://example.com/issue.webp",
      text: "Garbage has not been collected for three days.",
      location: { address: "Station Road", ward: "Ward 3", lat: 18.5204, lng: 73.8567 }
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid coordinates and short complaint text", () => {
    const result = CreateComplaintInputSchema.safeParse({
      text: "bad",
      location: { address: "x", lat: 200, lng: 500 }
    });

    expect(result.success).toBe(false);
  });

  it("rejects unsupported UI languages", () => {
    const result = UpsertProfileInputSchema.safeParse({
      id: "user-1",
      full_name: "Test User",
      email: "test@example.com",
      preferred_language: "fr",
      state: "Delhi",
      district: "New Delhi",
      age: 30,
      occupation: "worker",
      income_range: "unknown"
    });

    expect(result.success).toBe(false);
  });

  it("validates dashboard response shape", () => {
    const result = DashboardResponseSchema.safeParse({
      totals: { complaints: 1, resolved: 0, open: 1 },
      byDepartment: [{ key: "Public Works Department", department: "Public Works Department", count: 1 }],
      byStatus: [{ key: "submitted", count: 1 }],
      byWard: [{ key: "Ward 1", count: 1 }],
      avgResolutionDays: 0
    });

    expect(result.success).toBe(true);
  });
});
