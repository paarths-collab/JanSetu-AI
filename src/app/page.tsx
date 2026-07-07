"use client";

import Link from "next/link";
import {
  Zap,
  Languages,
  FileCheck2,
  LineChart,
  MessageSquareText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { SERVICES } from "@/lib/services";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";

const ACCENT_TINT: Record<"saffron" | "green" | "navy", string> = {
  saffron: "bg-saffron/10 text-saffron",
  green: "bg-green/10 text-green",
  navy: "bg-navy/10 text-navy",
};

const ACCENT_BAR: Record<"saffron" | "green" | "navy", string> = {
  saffron: "bg-saffron",
  green: "bg-green",
  navy: "bg-navy",
};

export default function LandingPage() {
  const t = useT();

  const whyPoints = [
    {
      icon: Zap,
      tint: "bg-saffron/10 text-saffron",
      title: t("why.action.title", "Action-first, not search"),
      desc: t(
        "why.action.desc",
        "Go straight from your problem to the right service — no endless portals."
      ),
    },
    {
      icon: Languages,
      tint: "bg-green/10 text-green",
      title: t("why.language.title", "Your language"),
      desc: t(
        "why.language.desc",
        "Works in 10 Indian languages, so you never get lost in translation."
      ),
    },
    {
      icon: FileCheck2,
      tint: "bg-navy/10 text-navy",
      title: t("why.documents.title", "Documents made clear"),
      desc: t(
        "why.documents.desc",
        "Know exactly what to bring and understand any notice you receive."
      ),
    },
    {
      icon: LineChart,
      tint: "bg-saffron/10 text-saffron",
      title: t("why.tracking.title", "Transparent tracking"),
      desc: t(
        "why.tracking.desc",
        "Follow every complaint with a clear timeline and next step."
      ),
    },
  ];

  const steps = [
    {
      icon: Sparkles,
      title: t("how.step1.title", "Pick a service"),
      desc: t(
        "how.step1.desc",
        "Choose what you need help with — schemes, documents, complaints and more."
      ),
    },
    {
      icon: MessageSquareText,
      title: t("how.step2.title", "Explain in your language"),
      desc: t(
        "how.step2.desc",
        "Describe your situation naturally. No jargon, no forms to decode."
      ),
    },
    {
      icon: FileCheck2,
      title: t("how.step3.title", "Get answers & tracking"),
      desc: t(
        "how.step3.desc",
        "Receive clear answers, required documents and a way to track progress."
      ),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1.5 tricolor-bar"
        />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pb-24 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="saffron" className="mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.badge", "Smart Bharat · Build with AI")}
            </Badge>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {t(
                "hero.title",
                "From your problem to the right government service — in your language."
              )}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted">
              {t(
                "hero.subtitle",
                "JanSetu AI turns confusing government processes into simple, guided steps — schemes, documents, complaints and tracking, all in the language you speak."
              )}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/services">
                <Button size="lg" className="w-full sm:w-auto">
                  {t("hero.ctaPrimary", "Get started")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/schemes">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t("hero.ctaSecondary", "Explore services")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What can we do */}
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("landing.services.heading", "What can we do for you?")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            {t(
              "landing.services.subheading",
              "Six ways JanSetu AI helps you get things done with the government."
            )}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.id} href={service.href} className="group block">
                <Card className="relative h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
                  <div
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 top-0 h-1",
                      ACCENT_BAR[service.accent]
                    )}
                  />
                  <div className="p-6">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        ACCENT_TINT[service.accent]
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {t(service.titleKey, service.defaultTitle)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {t(service.descKey, service.defaultDesc)}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors group-hover:text-saffron">
                      {t("common.open", "Open")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why JanSetu */}
      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("why.heading", "Why JanSetu")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              {t(
                "why.subheading",
                "Built to make government services genuinely accessible for every citizen."
              )}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="flex flex-col">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      point.tint
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {point.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {point.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("how.heading", "How it works")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            {t("how.subheading", "Three simple steps from question to resolution.")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="h-full">
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron/10 text-sm font-bold text-saffron">
                      {i + 1}
                    </span>
                    <Icon className="h-5 w-5 text-muted" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {step.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/services">
            <Button size="lg">
              {t("how.cta", "Get started")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
