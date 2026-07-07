"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { useT } from "@/lib/i18n";

/** Persistent "Chat with JanSetu" launcher shown on every page. */
export function FloatingChat() {
  const t = useT();
  return (
    <Link
      href="/chat?service=ask"
      aria-label={t("chat.floating", "Chat with JanSetu")}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:-translate-y-0.5"
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green" />
      </span>
      <MessageSquareText className="h-4 w-4" />
      {t("chat.floating", "Chat with JanSetu")}
    </Link>
  );
}
