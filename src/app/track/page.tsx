"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, ArrowLeft } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from "@/components/ui";
import { useT } from "@/lib/i18n";

type ComplaintStatus =
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected";

type Complaint = {
  id: string;
  user_id: string;
  issue_type: string;
  description: string;
  location: { address: string; ward?: string; city?: string; state?: string };
  department: string;
  severity: "low" | "medium" | "high";
  status: ComplaintStatus;
  created_at: string;
  resolved_at?: string;
};

type ComplaintUpdate = {
  id: string;
  complaint_id: string;
  status: ComplaintStatus;
  note: string;
  created_at: string;
};

type BadgeTone = "saffron" | "green" | "navy" | "gray";

const STATUS_META: Record<
  ComplaintStatus,
  { label: string; tone: BadgeTone; dot: string }
> = {
  submitted: { label: "Submitted", tone: "saffron", dot: "#FF9933" },
  under_review: { label: "Under review", tone: "saffron", dot: "#FF9933" },
  assigned: { label: "Assigned", tone: "navy", dot: "#000080" },
  in_progress: { label: "In progress", tone: "navy", dot: "#000080" },
  resolved: { label: "Resolved", tone: "green", dot: "#138808" },
  rejected: { label: "Rejected", tone: "gray", dot: "#4b5563" },
};

function statusMeta(status: ComplaintStatus) {
  return STATUS_META[status] ?? STATUS_META.submitted;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function humanizeIssue(issue: string): string {
  return issue.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="text-saffron" />
        </div>
      }
    >
      <TrackInner />
    </Suspense>
  );
}

export default TrackPage;

function TrackInner() {
  const t = useT();
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");

  const [query, setQuery] = useState(urlId ?? "");
  const [list, setList] = useState<Complaint[] | null>(null);
  const [listLoading, setListLoading] = useState(true);

  const [detail, setDetail] = useState<{
    complaint: Complaint;
    updates: ComplaintUpdate[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/track");
      const data = (await res.json()) as { complaints: Complaint[] };
      setList(data.complaints ?? []);
    } catch {
      setList([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setDetailLoading(true);
    setNotFound(false);
    setDetail(null);
    try {
      const res = await fetch(`/api/track?id=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = (await res.json()) as {
        complaint: Complaint;
        updates: ComplaintUpdate[];
      };
      setDetail(data);
    } catch {
      setNotFound(true);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (urlId) {
      setQuery(urlId);
      loadDetail(urlId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDetail(query);
  };

  const clearDetail = () => {
    setDetail(null);
    setNotFound(false);
    setQuery("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">
        {t("track.heading", "Track your complaint")}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {t(
          "track.subheading",
          "Look up a complaint by its ID, or pick one from your list below."
        )}
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              "track.searchPlaceholder",
              "Complaint ID (e.g. SB-2026-0001)"
            )}
            className="h-11 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm text-foreground outline-none focus:border-saffron focus-visible:ring-2 focus-visible:ring-saffron/40"
            aria-label={t("track.searchPlaceholder", "Complaint ID")}
          />
        </div>
        <Button type="submit" className="sm:w-auto">
          {detailLoading ? <Spinner /> : <Search className="h-4 w-4" />}
          {t("track.find", "Track")}
        </Button>
      </form>

      {(detail || notFound || detailLoading) && (
        <div className="mt-4">
          <button
            type="button"
            onClick={clearDetail}
            className="inline-flex items-center gap-1 text-sm font-medium text-navy hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("track.backToList", "Back to my complaints")}
          </button>
        </div>
      )}

      <div className="mt-6">
        {detailLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-saffron" />
          </div>
        ) : notFound ? (
          <Card>
            <CardContent className="text-center text-sm text-muted">
              {t("track.notFound", "No complaint found with that ID")}
            </CardContent>
          </Card>
        ) : detail ? (
          <DetailView complaint={detail.complaint} updates={detail.updates} />
        ) : (
          <ComplaintList
            list={list}
            loading={listLoading}
            onSelect={(id) => {
              setQuery(id);
              loadDetail(id);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ComplaintList({
  list,
  loading,
  onSelect,
}: {
  list: Complaint[] | null;
  loading: boolean;
  onSelect: (id: string) => void;
}) {
  const t = useT();

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="text-saffron" />
      </div>
    );
  }

  if (!list || list.length === 0) {
    return (
      <Card>
        <CardContent className="text-center text-sm text-muted">
          {t("track.empty", "You have not filed any complaints yet.")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted">
        {t("track.yourComplaints", "Your complaints")}
      </h2>
      {list.map((c) => {
        const meta = statusMeta(c.status);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className="w-full text-left"
          >
            <Card className="transition-colors hover:border-saffron/60 hover:shadow-md">
              <CardContent className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-navy">
                    {c.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge tone="gray">{humanizeIssue(c.issue_type)}</Badge>
                    <Badge tone={meta.tone}>
                      {t(`status.${c.status}`, meta.label)}
                    </Badge>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-foreground">
                  {c.description}
                </p>
                {c.location?.ward && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    <MapPin className="h-3.5 w-3.5" />
                    {c.location.ward}
                  </span>
                )}
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

function DetailView({
  complaint,
  updates,
}: {
  complaint: Complaint;
  updates: ComplaintUpdate[];
}) {
  const t = useT();
  const meta = statusMeta(complaint.status);

  const sorted = [...updates].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-mono text-navy">{complaint.id}</CardTitle>
          <Badge tone={meta.tone}>
            {t(`status.${complaint.status}`, meta.label)}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge tone="saffron">{humanizeIssue(complaint.issue_type)}</Badge>
          <Badge tone="gray">{complaint.department}</Badge>
          <Badge
            tone={
              complaint.severity === "high"
                ? "saffron"
                : complaint.severity === "medium"
                ? "navy"
                : "gray"
            }
          >
            {t(`severity.${complaint.severity}`, complaint.severity)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-foreground">{complaint.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {complaint.location.address}
          </span>
          <span>
            {t("track.filedOn", "Filed on")} {formatDate(complaint.created_at)}
          </span>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-navy">
            {t("track.timeline", "Progress timeline")}
          </h3>
          <ol className="relative space-y-6">
            {sorted.map((u, i) => {
              const uMeta = statusMeta(u.status);
              const isLast = i === sorted.length - 1;
              return (
                <li key={u.id} className="relative flex gap-4 pl-1">
                  <div className="relative flex flex-col items-center">
                    <span
                      className="z-10 mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full ring-4 ring-white"
                      style={{ backgroundColor: uMeta.dot }}
                      aria-hidden
                    />
                    {!isLast && (
                      <span className="absolute top-4 h-full w-px bg-border" aria-hidden />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-sm font-medium text-foreground">
                        {t(`status.${u.status}`, uMeta.label)}
                      </span>
                      <span className="text-xs text-muted">
                        {formatDate(u.created_at)}
                      </span>
                    </div>
                    {u.note && (
                      <p className="mt-0.5 text-sm text-muted">{u.note}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
