"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Mic,
  Images,
  Languages,
  Sparkles,
  MessageSquareText,
  FileSearch,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { SERVICES } from "@/lib/services";
import { cn } from "@/lib/cn";

const ACCENT_TEXT: Record<"saffron" | "green" | "navy", string> = {
  saffron: "text-saffron-dark",
  green: "text-green",
  navy: "text-navy",
};

const ACCENT_ICON: Record<"saffron" | "green" | "navy", string> = {
  saffron: "border-saffron/30 text-saffron-dark",
  green: "border-green/30 text-green",
  navy: "border-navy/30 text-navy",
};

export default function LandingPage() {
  const t = useT();

  const chips = [
    { icon: CheckCircle2, label: t("chip.free", "Free government service") },
    { icon: Mic, label: t("chip.voice", "Voice-enabled") },
    { icon: Images, label: t("chip.media", "Image · PDF") },
    { icon: Languages, label: t("chip.langs", "10 languages") },
  ];

  const actionLabel: Record<string, string> = {
    schemes: t("svc.schemes.action", "Check eligibility"),
    documents: t("svc.documents.action", "Decode a document"),
    complaints: t("svc.complaints.action", "Report now"),
    tracking: t("svc.tracking.action", "Enter tracking ID"),
    ask: t("svc.ask.action", "Start a chat"),
    dashboard: t("svc.dashboard.action", "View dashboard"),
  };

  const steps = [
    {
      icon: Sparkles,
      title: t("how.step1.title", "Pick a service"),
      desc: t("how.step1.desc", "Choose what you need — schemes, documents, complaints and more."),
    },
    {
      icon: MessageSquareText,
      title: t("how.step2.title", "Explain in your language"),
      desc: t("how.step2.desc", "Describe your situation naturally. No jargon, no forms to decode."),
    },
    {
      icon: FileSearch,
      title: t("how.step3.title", "Get answers & tracking"),
      desc: t("how.step3.desc", "Receive clear answers, required documents and a way to track progress."),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,153,51,0.08),transparent_70%)]"
        />
        <div className="mx-auto max-w-4xl px-5 pb-16 pt-16 text-center sm:pb-24 sm:pt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted shadow-sm">
            <span className="flex -space-x-1" aria-hidden>
              {["bg-saffron", "bg-white border border-border", "bg-green"].map((c, i) => (
                <span key={i} className={cn("h-2.5 w-2.5 rounded-full", c)} />
              ))}
            </span>
            {t("hero.badge", "Built for every citizen · 10 languages")}
          </div>

          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            {t("hero.titleLine1", "Government services,")}
            <br />
            {t("hero.titleLine2Pre", "explained in ")}
            <em className="tricolor-text italic">
              {t("hero.titleAccent", "your language")}
            </em>
            .
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted sm:text-lg">
            {t(
              "hero.subtitle",
              "JanSetu AI is your civic companion. Describe your problem in plain words — get the right scheme, documents, and complaint path. No portals to memorize."
            )}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/services"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-foreground/90 sm:w-auto"
            >
              {t("hero.ctaPrimary", "Start — how it works")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/chat?service=ask"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface sm:w-auto"
            >
              {t("hero.ctaSecondary", "Watch 40-sec demo")}
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {chips.map((chip) => {
              const Icon = chip.icon;
              return (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted"
                >
                  <Icon className="h-3.5 w-3.5 text-green" />
                  {chip.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pick a service */}
      <section id="services" className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            {t("landing.pick.pre", "Pick a ")}
            <span className="tricolor-text">{t("landing.pick.accent", "service")}</span>
            {t("landing.pick.post", " to begin")}
          </h2>
          <p className="text-sm text-muted">
            {t("landing.pick.hint", "Or just tap the chat button and describe your problem.")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.id} href={service.href} className="group block">
                <div className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-foreground/20 group-hover:shadow-md">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl border bg-white",
                      ACCENT_ICON[service.accent]
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {t(service.titleKey, service.defaultTitle)}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
                    {t(service.descKey, service.defaultDesc)}
                  </p>
                  <span
                    className={cn(
                      "mt-4 inline-flex items-center gap-1 text-sm font-medium",
                      ACCENT_TEXT[service.accent]
                    )}
                  >
                    {actionLabel[service.id] ?? t("common.open", "Open")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border bg-surface/50">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              {t("how.heading", "How it works")}
            </h2>
            <p className="mt-3 text-muted">
              {t("how.subheading", "Three simple steps from question to resolution.")}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-border bg-white p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron/10 text-sm font-bold text-saffron-dark">
                      {i + 1}
                    </span>
                    <Icon className="h-5 w-5 text-muted" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto w-full max-w-4xl px-5 py-14 text-center sm:py-20">
        <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          {t("about.heading", "Not another portal")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted">
          {t(
            "about.body",
            "JanSetu AI delivers, action-first and in your own language, the service functions today spread across India.gov.in, UMANG, DigiLocker, CPGRAMS, Swachhata and Bhashini — so any citizen can get things done."
          )}
        </p>
        <div className="mt-8">
          <Link
            href="/services"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-foreground/90"
          >
            {t("about.cta", "Get started")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
