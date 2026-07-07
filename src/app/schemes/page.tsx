"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from "@/components/ui";
import { useLang, useT } from "@/lib/i18n";

type Recommendation = {
  name: string;
  reason: string;
  documents: string[];
  steps: string[];
  url: string;
};

const EXAMPLE_KEYS: { key: string; fallback: string }[] = [
  { key: "schemes.example1", fallback: "I am a farmer in Maharashtra needing crop support" },
  { key: "schemes.example2", fallback: "Scholarship for my daughter's college education" },
  { key: "schemes.example3", fallback: "Housing help for a low-income family" },
  { key: "schemes.example4", fallback: "Health insurance for senior citizens" },
];

export default function SchemesPage() {
  const t = useT();
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function findSchemes() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, lang }),
      });
      const data = (await res.json()) as { recommended?: Recommendation[] };
      setResults(data.recommended ?? []);
    } catch {
      setError(t("schemes.error", "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="mb-6 flex items-center gap-2 text-navy">
        <Sparkles className="h-6 w-6 text-saffron" />
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("schemes.heading", "Find a scheme for you")}
        </h1>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder={t(
              "schemes.searchPlaceholder",
              "Describe your situation — e.g. your work, income, family, or what help you need."
            )}
            className="w-full resize-none rounded-xl border border-border bg-white p-3 text-sm text-foreground outline-none focus:border-saffron focus-visible:ring-2 focus-visible:ring-saffron/40"
          />

          <div className="flex flex-wrap gap-2">
            {EXAMPLE_KEYS.map((ex) => {
              const label = t(ex.key, ex.fallback);
              return (
                <button
                  key={ex.key}
                  type="button"
                  onClick={() => setQuery(label)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted transition-colors hover:border-saffron hover:text-saffron-dark"
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button onClick={findSchemes} disabled={loading || !query.trim()}>
              {loading ? <Spinner /> : <Search className="h-4 w-4" />}
              {t("schemes.find", "Find schemes")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="mt-6 rounded-xl bg-surface p-4 text-sm text-muted">
          {error}
        </p>
      )}

      {loading && (
        <div className="mt-10 flex flex-col items-center gap-3 text-muted">
          <Spinner className="h-6 w-6 text-saffron" />
          <p className="text-sm">
            {t("schemes.loading", "Searching schemes for you…")}
          </p>
        </div>
      )}

      {!loading && results && results.length === 0 && (
        <div className="mt-10 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted">
            {t(
              "schemes.empty",
              "No matching schemes found. Try describing your situation with different words."
            )}
          </p>
        </div>
      )}

      {!loading && results && results.length > 0 && (
        <div className="mt-8 space-y-5">
          {results.map((r, i) => (
            <Card key={`${r.name}-${i}`}>
              <CardHeader>
                <CardTitle>{r.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-3">
                {r.reason && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green">
                      {t("schemes.why", "Why you may be eligible")}
                    </p>
                    <p className="text-sm text-foreground">{r.reason}</p>
                  </div>
                )}

                {r.documents?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy">
                      {t("schemes.documents", "Documents you'll need")}
                    </p>
                    <ul className="space-y-1.5">
                      {r.documents.map((doc, di) => (
                        <li
                          key={di}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {r.steps?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-saffron-dark">
                      {t("schemes.steps", "How to apply")}
                    </p>
                    <ol className="space-y-1.5">
                      {r.steps.map((step, si) => (
                        <li
                          key={si}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-saffron/10 text-xs font-semibold text-saffron-dark">
                            {si + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {r.url && (
                  <div>
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        {t("schemes.official", "Official website")}
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
