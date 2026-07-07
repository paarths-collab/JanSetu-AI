"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Paperclip, X, Send, Bot } from "lucide-react";
import { Button, Spinner } from "@/components/ui";
import { useLang, useT } from "@/lib/i18n";
import { SERVICES } from "@/lib/services";
import { cn } from "@/lib/cn";

type ChatRole = "user" | "assistant";
type Message = { role: ChatRole; content: string };
type Attachment = { id: string; name: string; type: string; dataUrl: string };

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function ChatInner() {
  const t = useT();
  const { lang, dir } = useLang();
  const searchParams = useSearchParams();
  const service = searchParams.get("service") || "ask";

  const serviceDef = useMemo(
    () => SERVICES.find((s) => s.id === service),
    [service]
  );
  const serviceTitle = serviceDef
    ? t(serviceDef.titleKey, serviceDef.defaultTitle)
    : t("svc.ask.title", "Ask Anything");

  const greeting = t("chat.greeting", "Namaste! Tell me what you need help with.");

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the seeded greeting in sync with the UI language until a real chat starts.
  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0].role === "assistant"
        ? [{ role: "assistant", content: greeting }]
        : prev
    );
  }, [greeting]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const onPickFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || !files.length) return;
      const next: Attachment[] = [];
      for (const file of Array.from(files)) {
        try {
          const dataUrl = await readFileAsDataUrl(file);
          next.push({
            id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
            name: file.name,
            type: file.type,
            dataUrl,
          });
        } catch {
          /* ignore unreadable file */
        }
      }
      setAttachments((prev) => [...prev, ...next]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || loading) return;

    const userContent =
      text ||
      (attachments.length
        ? t("chat.sentAttachments", "Please review the attached file(s).")
        : "");

    const userMsg: Message = { role: "user", content: userContent };
    const history = [...messages, userMsg];

    const images = attachments
      .filter((a) => a.type.startsWith("image/"))
      .map((a) => a.dataUrl);
    const pdfs = attachments
      .filter((a) => a.type === "application/pdf")
      .map((a) => ({ name: a.name, dataUrl: a.dataUrl }));

    setMessages(history);
    setInput("");
    setAttachments([]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          lang,
          service,
          images,
          pdfs,
        }),
      });
      const data = (await res.json()) as { reply?: string };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            t("chat.error", "Sorry, something went wrong. Please try again."),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t(
            "chat.error",
            "Sorry, something went wrong. Please try again."
          ),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, attachments, loading, messages, lang, service, t]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void send();
      }
    },
    [send]
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-4 py-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron/10 text-saffron-dark">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-base font-semibold text-foreground">
            {serviceTitle}
          </h1>
          <p className="text-xs text-muted">
            {t("chat.subtitle", "JanSetu AI — your civic assistant")}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-surface/40 p-4"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                m.role === "user"
                  ? "bg-saffron/10 text-foreground"
                  : "border border-border bg-white text-foreground"
              )}
            >
              <div className="prose prose-sm max-w-none break-words prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-a:text-navy">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-2.5 text-sm text-muted shadow-sm">
              <Spinner className="text-saffron" />
              {t("chat.thinking", "Thinking…")}
            </div>
          </div>
        )}
      </div>

      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs text-foreground shadow-sm"
            >
              <span className="max-w-[12rem] truncate">{a.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(a.id)}
                className="text-muted hover:text-foreground"
                aria-label={t("chat.remove", "Remove")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="mt-3 flex items-end gap-2 rounded-2xl border border-border bg-white p-2 shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => onPickFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          aria-label={t("chat.attach", "Attach files")}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-50"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
          rows={1}
          dir={dir}
          placeholder={t("chat.placeholder", "Type your question…")}
          className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none disabled:opacity-50"
        />

        <Button
          onClick={() => void send()}
          disabled={loading || (!input.trim() && attachments.length === 0)}
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4" />
          {t("chat.send", "Send")}
        </Button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Spinner className="text-saffron" />
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
