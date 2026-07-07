import schemesJson from "../../data/schemes.json";

export type Scheme = {
  id: string;
  name: string;
  state: string;
  category: string;
  eligibility_rules: Record<string, unknown>;
  required_documents: string[];
  benefits: string;
  application_steps: string[];
  keywords: string[];
  official_url: string;
};

export function loadSchemes(): Scheme[] {
  return schemesJson as Scheme[];
}

/** Plain-text keyword/filter retrieval (no vectors). Returns best matches, or all if none. */
export function filterSchemes(query: string, limit = 6): Scheme[] {
  const schemes = loadSchemes();
  const q = (query || "").toLowerCase();
  const tokens = q.split(/[^\p{L}\p{N}]+/u).filter((t) => t.length > 2);

  const scored = schemes.map((s) => {
    const hay = [s.name, s.category, s.state, s.benefits, ...(s.keywords ?? [])]
      .join(" ")
      .toLowerCase();
    let score = 0;
    for (const t of tokens) if (hay.includes(t)) score += 1;
    for (const k of s.keywords ?? []) if (q.includes(k.toLowerCase())) score += 2;
    return { s, score };
  });

  const matched = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  const chosen = (matched.length ? matched : scored).slice(0, limit);
  return chosen.map((x) => x.s);
}

/** Compact context block for the LLM to reason over. */
export function schemesContext(schemes: Scheme[]): string {
  return schemes
    .map(
      (s) =>
        `### ${s.name} (${s.state}, ${s.category})\n` +
        `Benefits: ${s.benefits}\n` +
        `Eligibility: ${JSON.stringify(s.eligibility_rules)}\n` +
        `Documents: ${(s.required_documents ?? []).join(", ")}\n` +
        `Steps: ${(s.application_steps ?? []).join(" -> ")}\n` +
        `Official: ${s.official_url}`
    )
    .join("\n\n");
}
