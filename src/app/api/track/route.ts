import { complaintService, DEMO_USER } from "@/lib/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");

  if (id) {
    try {
      const result = complaintService.trackForUser(DEMO_USER, id);
      return Response.json(result);
    } catch {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
  }

  return Response.json({ complaints: complaintService.listForUser(DEMO_USER) });
}
