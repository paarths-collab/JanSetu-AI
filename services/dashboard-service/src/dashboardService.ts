import {
  Complaint,
  DashboardResponse,
  DashboardResponseSchema
} from "../../../packages/contracts/src/index.js";

const OPEN_STATUSES = new Set(["submitted", "under_review", "assigned", "in_progress"]);

export class DashboardService {
  summarize(complaints: Complaint[]): DashboardResponse {
    const totals = {
      complaints: complaints.length,
      resolved: complaints.filter((complaint) => complaint.status === "resolved").length,
      open: complaints.filter((complaint) => OPEN_STATUSES.has(complaint.status)).length
    };

    return DashboardResponseSchema.parse({
      totals,
      byDepartment: countBy(complaints, (complaint) => complaint.department).map((bucket) => ({
        key: bucket.key,
        department: bucket.key,
        count: bucket.count
      })),
      byStatus: countBy(complaints, (complaint) => complaint.status),
      byWard: countBy(complaints, (complaint) => complaint.location.ward ?? "Unknown"),
      avgResolutionDays: averageResolutionDays(complaints)
    });
  }
}

function countBy(complaints: Complaint[], getKey: (complaint: Complaint) => string) {
  const counts = new Map<string, number>();
  for (const complaint of complaints) {
    const key = getKey(complaint);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function averageResolutionDays(complaints: Complaint[]): number {
  const resolvedDurations = complaints
    .filter((complaint) => complaint.status === "resolved" && complaint.resolved_at)
    .map((complaint) => {
      const created = new Date(complaint.created_at).getTime();
      const resolved = new Date(complaint.resolved_at as string).getTime();
      return Math.max(0, resolved - created) / (1000 * 60 * 60 * 24);
    });

  if (resolvedDurations.length === 0) {
    return 0;
  }

  const average = resolvedDurations.reduce((sum, days) => sum + days, 0) / resolvedDurations.length;
  return Number(average.toFixed(2));
}
