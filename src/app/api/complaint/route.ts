import { askLLM } from "@/lib/ai";
import { complaintService, DEMO_USER } from "@/lib/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Location = {
  address: string;
  ward?: string;
  city?: string;
  state?: string;
};

export async function POST(req: Request) {
  try {
    const { text, imageDataUrl, location } = (await req.json()) as {
      text?: string;
      imageDataUrl?: string;
      location?: Location;
      lang?: string;
    };

    let enrichedText = (text ?? "").trim();

    if (imageDataUrl) {
      try {
        const { text: vision } = await askLLM({
          system:
            "Describe the civic issue visible in this photo in one sentence for a complaint.",
          user: enrichedText || "Describe the civic issue.",
          lang: "en",
          imageDataUrls: [imageDataUrl],
        });
        if (vision && vision.trim()) {
          enrichedText = `${enrichedText}\n${vision.trim()}`.trim();
        }
      } catch {
        // ignore vision failures — classification still works on the text.
      }
    }

    const complaint = complaintService.createForUser(DEMO_USER, {
      text: enrichedText,
      location: location as Location,
    });

    return Response.json({
      complaint,
      note: "Complaint registered and routed to " + complaint.department,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not register complaint.";
    return Response.json({ error: message }, { status: 400 });
  }
}
