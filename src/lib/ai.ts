// Server-only OpenRouter client (OpenAI-compatible Chat Completions API).
// Kept deliberately dependency-free (plain fetch) for reliability. Multimodal:
// pass data-URL images for vision. Gracefully falls back when no API key is set.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  gu: "Gujarati",
  ta: "Tamil",
  kn: "Kannada",
  te: "Telugu",
  bn: "Bengali",
  pa: "Punjabi",
  ur: "Urdu",
};

export function languageName(lang: string): string {
  return LANG_NAMES[lang] ?? "English";
}

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image_url"; image_url: { url: string } };
type Content = string | Array<TextPart | ImagePart>;
export type ChatMessage = { role: "system" | "user" | "assistant"; content: Content };

export function hasAI(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

async function callOpenRouter(
  messages: ChatMessage[],
  opts?: { json?: boolean; temperature?: number; maxTokens?: number }
): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY not set");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://jansetu.ai",
      "X-Title": "JanSetu AI",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: opts?.temperature ?? 0.3,
      max_tokens: opts?.maxTokens ?? 1400,
      ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

const BASE_SYSTEM =
  "You are JanSetu AI, a warm, trustworthy civic assistant for Indian citizens. " +
  "Explain government schemes, documents, complaints and services in simple, plain language. " +
  "Be accurate and honest; if unsure, say so and point to the official source. Keep answers concise and well-structured with short paragraphs or bullet points.";

/** Free-form assistant reply (supports optional vision inputs). */
export async function askLLM(opts: {
  system?: string;
  user: string;
  lang: string;
  imageDataUrls?: string[];
  history?: ChatMessage[];
  fallback?: string;
}): Promise<{ text: string; usedFallback: boolean }> {
  const system = `${BASE_SYSTEM}\n${opts.system ?? ""}\nAlways respond ONLY in ${languageName(
    opts.lang
  )}.`;

  const userContent: Content = opts.imageDataUrls?.length
    ? [
        { type: "text", text: opts.user },
        ...opts.imageDataUrls.map(
          (url): ImagePart => ({ type: "image_url", image_url: { url } })
        ),
      ]
    : opts.user;

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...(opts.history ?? []),
    { role: "user", content: userContent },
  ];

  try {
    const text = await callOpenRouter(messages);
    return { text: text.trim() || (opts.fallback ?? ""), usedFallback: false };
  } catch (err) {
    console.error("[ai] askLLM failed:", err);
    return {
      text:
        opts.fallback ??
        "The AI assistant is not configured yet. Add an OPENROUTER_API_KEY to enable live answers.",
      usedFallback: true,
    };
  }
}

/** Structured JSON reply; returns null on failure so callers can fall back. */
export async function askLLMJson<T = unknown>(opts: {
  system?: string;
  user: string;
  lang: string;
}): Promise<T | null> {
  const system = `${BASE_SYSTEM}\n${opts.system ?? ""}\nRespond in ${languageName(
    opts.lang
  )}. Reply with a single valid JSON object only, no markdown.`;
  try {
    const raw = await callOpenRouter(
      [
        { role: "system", content: system },
        { role: "user", content: opts.user },
      ],
      { json: true, temperature: 0.2 }
    );
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("[ai] askLLMJson failed:", err);
    return null;
  }
}
