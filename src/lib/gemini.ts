// Server-only Google Gemini client. Calls the Generative Language API directly
// via fetch (no SDK dependency). Supports multimodal (inline images) and JSON mode.

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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

function languageName(lang: string): string {
  return LANG_NAMES[lang] ?? "English";
}

export function hasGemini(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

type TextPart = { text: string };
type InlineDataPart = { inline_data: { mime_type: string; data: string } };
type Part = TextPart | InlineDataPart;

type GeminiRequest = {
  contents: Array<{ role: "user" | "model"; parts: Part[] }>;
  systemInstruction?: { parts: TextPart[] };
  generationConfig?: {
    temperature?: number;
    response_mime_type?: string;
  };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  // data:<mime>;base64,<payload>
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

async function callGemini(payload: GeminiRequest): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  const model = DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as GeminiResponse;
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p?.text ?? "").join("").trim();
}

export async function askGemini(opts: {
  system?: string;
  user: string;
  lang: string;
  imageDataUrls?: string[];
  jsonMode?: boolean;
  fallback?: string;
}): Promise<{ text: string; usedFallback: boolean }> {
  const systemText = `${opts.system ?? ""}\nAlways respond ONLY in ${languageName(opts.lang)}.`.trim();

  const parts: Part[] = [{ text: opts.user }];
  if (opts.imageDataUrls?.length) {
    for (const url of opts.imageDataUrls) {
      const parsed = parseDataUrl(url);
      if (parsed) {
        parts.push({ inline_data: { mime_type: parsed.mimeType, data: parsed.data } });
      }
    }
  }

  const payload: GeminiRequest = {
    contents: [{ role: "user", parts }],
    generationConfig: opts.jsonMode
      ? { response_mime_type: "application/json", temperature: 0.2 }
      : { temperature: 0.3 },
  };
  if (systemText) {
    payload.systemInstruction = { parts: [{ text: systemText }] };
  }

  try {
    const text = await callGemini(payload);
    return {
      text: text || (opts.fallback ?? ""),
      usedFallback: false,
    };
  } catch (err) {
    console.error("[gemini] askGemini failed:", err);
    return {
      text:
        opts.fallback ??
        "The AI assistant is not configured yet. Add a GEMINI_API_KEY to enable live answers.",
      usedFallback: true,
    };
  }
}

export async function askGeminiJson<T = unknown>(opts: {
  system?: string;
  user: string;
  lang: string;
  imageDataUrls?: string[];
}): Promise<T | null> {
  const result = await askGemini({
    system: `${opts.system ?? ""}\nReply with a single valid JSON object only, no markdown.`,
    user: opts.user,
    lang: opts.lang,
    imageDataUrls: opts.imageDataUrls,
    jsonMode: true,
  });
  if (result.usedFallback) return null;
  try {
    return JSON.parse(result.text) as T;
  } catch (err) {
    console.error("[gemini] askGeminiJson parse failed:", err);
    return null;
  }
}
