import { complaintService, dashboardService } from "@/lib/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    dashboardService.summarize(complaintService.listAllForDashboard())
  );
}
