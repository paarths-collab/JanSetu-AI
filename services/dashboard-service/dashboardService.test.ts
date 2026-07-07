import { describe, expect, it } from "vitest";
import { Complaint } from "../../packages/contracts/src/index.js";
import { DashboardService } from "./src/dashboardService.js";

describe("DashboardService", () => {
  it("aggregates totals, departments, status, wards and resolution time", () => {
    const service = new DashboardService();
    const complaints: Complaint[] = [
      complaint({
        id: "SB-2026-0001",
        department: "Municipal Sanitation Department",
        status: "resolved",
        ward: "Ward 1",
        created_at: "2026-07-01T00:00:00.000Z",
        resolved_at: "2026-07-03T00:00:00.000Z"
      }),
      complaint({
        id: "SB-2026-0002",
        department: "Municipal Sanitation Department",
        status: "submitted",
        ward: "Ward 1",
        created_at: "2026-07-02T00:00:00.000Z"
      }),
      complaint({
        id: "SB-2026-0003",
        department: "Public Works Department",
        status: "in_progress",
        ward: "Ward 2",
        created_at: "2026-07-03T00:00:00.000Z"
      })
    ];

    const dashboard = service.summarize(complaints);

    expect(dashboard.totals).toEqual({ complaints: 3, resolved: 1, open: 2 });
    expect(dashboard.byDepartment[0]).toEqual({
      key: "Municipal Sanitation Department",
      department: "Municipal Sanitation Department",
      count: 2
    });
    expect(dashboard.byStatus).toEqual([
      { key: "in_progress", count: 1 },
      { key: "resolved", count: 1 },
      { key: "submitted", count: 1 }
    ]);
    expect(dashboard.byWard[0]).toEqual({ key: "Ward 1", count: 2 });
    expect(dashboard.avgResolutionDays).toBe(2);
  });

  it("returns empty-safe dashboard data", () => {
    const dashboard = new DashboardService().summarize([]);
    expect(dashboard.totals).toEqual({ complaints: 0, resolved: 0, open: 0 });
    expect(dashboard.byDepartment).toEqual([]);
    expect(dashboard.avgResolutionDays).toBe(0);
  });
});

function complaint(overrides: Partial<Complaint> & { ward?: string }): Complaint {
  return {
    id: overrides.id ?? "SB-2026-9999",
    user_id: "user-1",
    issue_type: "garbage",
    description: "Complaint description long enough for tests.",
    location: { address: "Test address", ward: overrides.ward },
    department: overrides.department ?? "Municipal Sanitation Department",
    severity: "medium",
    status: overrides.status ?? "submitted",
    created_at: overrides.created_at ?? "2026-07-01T00:00:00.000Z",
    resolved_at: overrides.resolved_at
  };
}
