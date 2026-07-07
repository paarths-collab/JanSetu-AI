"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { LANGUAGES, useLang, useT, type Lang } from "@/lib/i18n";

export function Nav() {
  const { lang, setLang } = useLang();
  const t = useT();

  const links = [
    { href: "/services", label: t("nav.services", "Services") },
    { href: "/#how-it-works", label: t("nav.how", "How it works") },
    { href: "/dashboard", label: t("nav.transparency", "Transparency") },
    { href: "/#about", label: t("nav.about", "About") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur">
      <div className="tricolor-bar h-1 w-full" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="JanSetu AI home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron/50"
            aria-label={t("lang.label", "Language")}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <Link
            href="/services"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground sm:inline-flex"
          >
            {t("nav.signin", "Sign in")}
          </Link>
          <Link
            href="/services"
            className="inline-flex rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-foreground/90"
          >
            {t("nav.signup", "Sign up")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
