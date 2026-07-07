import { askLLMJson } from "@/lib/ai";
import { filterSchemes, schemesContext } from "@/lib/schemes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Recommendation = {
  name: string;
  reason: string;
  documents: string[];
  steps: string[];
  url: string;
};

type SchemesResponse = { recommended: Recommendation[] };

export async function POST(req: Request) {
  try {
    const { query, lang } = (await req.json()) as {
      query?: string;
      lang?: string;
    };

    const matches = filterSchemes(query ?? "");

    const fallback = (): Recommendation[] =>
      matches.map((s) => ({
        name: s.name,
        reason: s.benefits,
        documents: s.required_documents ?? [],
        steps: s.application_steps ?? [],
        url: s.official_url,
      }));

    let json: SchemesResponse | null = null;
    try {
      json = await askLLMJson<SchemesResponse>({
        system:
          "You recommend Indian government schemes. Given the citizen query and the reference schemes, return JSON {recommended:[{name, reason, documents:string[], steps:string[], url}]}. Only use the reference schemes.",
        user:
          (query ?? "") +
          "\n\nReference schemes:\n" +
          schemesContext(matches),
        lang: lang ?? "en",
      });
    } catch {
      json = null;
    }

    const recommended =
      json && Array.isArray(json.recommended) && json.recommended.length
        ? json.recommended
        : fallback();

    return Response.json({ recommended, aiUsed: !!json });
  } catch {
    return Response.json({ recommended: [], aiUsed: false });
  }
}
