import { askLLM, type ChatMessage } from "@/lib/ai";
import { SERVICE_SCOPE } from "@/lib/services";
import { filterSchemes, schemesContext } from "@/lib/schemes";
import { getDocumentProxy, extractText } from "unpdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingMessage = { role: "user" | "assistant"; content: string };
type IncomingPdf = { name: string; dataUrl: string };

type ChatBody = {
  messages?: IncomingMessage[];
  lang?: string;
  service?: string;
  images?: string[];
  pdfs?: IncomingPdf[];
};

async function pdfToText(dataUrl: string): Promise<string> {
  try {
    const base64 = dataUrl.split(",")[1] ?? "";
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const pdf = await getDocumentProxy(bytes);
    const { text } = await extractText(pdf, { mergePages: true });
    return typeof text === "string" ? text : String(text ?? "");
  } catch (err) {
    console.error("[chat] PDF extraction failed:", err);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatBody;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lang = body.lang || "en";
    const service = body.service || "ask";
    const images = Array.isArray(body.images) ? body.images : [];
    const pdfs = Array.isArray(body.pdfs) ? body.pdfs : [];

    // Split history and the latest user message.
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const lastUserText = lastUser?.content ?? "";

    const priorMessages = messages.slice(0, messages.length - 1);
    const history: ChatMessage[] = priorMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // System prompt: base scope + optional schemes reference knowledge.
    const scope = SERVICE_SCOPE[service] ?? SERVICE_SCOPE.ask;
    let system = scope;

    if (service === "schemes" || service === "ask") {
      const schemes = filterSchemes(lastUserText);
      if (schemes.length) {
        system += `\n\nUse these official schemes as reference:\n${schemesContext(
          schemes
        )}`;
      }
    }

    // Append extracted PDF text to the user message.
    let userText = lastUserText;
    for (const pdf of pdfs) {
      if (!pdf?.dataUrl) continue;
      const text = await pdfToText(pdf.dataUrl);
      if (text.trim()) {
        userText += `\n\n[Attached document "${pdf.name}"]:\n${text}`;
      }
    }

    const result = await askLLM({
      system,
      user: userText,
      lang,
      imageDataUrls: images,
      history,
    });

    return Response.json({ reply: result.text });
  } catch (err) {
    console.error("[chat] POST failed:", err);
    return Response.json(
      { reply: "Sorry, something went wrong. Please try again." },
      { status: 200 }
    );
  }
}
