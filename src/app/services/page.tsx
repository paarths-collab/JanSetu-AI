"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { SERVICES } from "@/lib/services";
import { Card } from "@/components/ui";
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

const ACCENT_HOVER: Record<"saffron" | "green" | "navy", string> = {
  saffron: "group-hover:text-saffron",
  green: "group-hover:text-green",
  navy: "group-hover:text-navy",
};

export default function ServicesPage() {
  const t = useT();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {t("services.heading", "How can we help you today?")}
        </h1>
        <p className="mx-auto mt-4 text-lg text-muted">
          {t(
            "services.subheading",
            "Pick a service to get started. Explain your situation in your own language and we'll guide you step by step."
          )}
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <Link key={service.id} href={service.href} className="group block">
              <Card className="relative h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 h-1.5",
                    ACCENT_BAR[service.accent]
                  )}
                />
                <div className="flex h-full flex-col p-6 sm:p-7">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl",
                      ACCENT_TINT[service.accent]
                    )}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-foreground">
                    {t(service.titleKey, service.defaultTitle)}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {t(service.descKey, service.defaultDesc)}
                  </p>
                  <span
                    className={cn(
                      "mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors",
                      ACCENT_HOVER[service.accent]
                    )}
                  >
                    {t("common.open", "Open")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
