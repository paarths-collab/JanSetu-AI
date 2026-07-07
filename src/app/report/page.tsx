"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, MapPin, Send, X } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from "@/components/ui";
import { useLang, useT } from "@/lib/i18n";

type Complaint = {
  id: string;
  issue_type: string;
  description: string;
  department: string;
  severity: "low" | "medium" | "high";
  status: string;
  location: { address: string; ward?: string; city?: string; state?: string };
  created_at: string;
};

function severityTone(sev: Complaint["severity"]): "green" | "saffron" | "navy" {
  if (sev === "high") return "saffron";
  if (sev === "medium") return "navy";
  return "green";
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ReportPage() {
  const t = useT();
  const { lang } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [address, setAddress] = useState("");
  const [ward, setWard] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ complaint: Complaint; note: string } | null>(
    null
  );

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readAsDataUrl(file);
    setPhotoDataUrl(dataUrl);
  }

  function clearPhoto() {
    setPhotoDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submit() {
    if (!text.trim() || !address.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          imageDataUrl: photoDataUrl ?? undefined,
          location: {
            address,
            ward: ward || undefined,
            city: "Pune",
            state: "Maharashtra",
          },
          lang,
        }),
      });
      const data = (await res.json()) as {
        complaint?: Complaint;
        note?: string;
        error?: string;
      };
      if (!res.ok || !data.complaint) {
        setError(data.error ?? t("report.error", "Could not file the complaint. Please try again."));
        return;
      }
      setResult({ complaint: data.complaint, note: data.note ?? "" });
    } catch {
      setError(t("report.error", "Could not file the complaint. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const c = result.complaint;
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <Card className="border-green/30">
          <CardHeader>
            <CardTitle className="text-green">
              {t("report.success", "Complaint filed successfully")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs uppercase tracking-wide text-muted">
                {t("report.complaintId", "Complaint ID")}
              </p>
              <p className="mt-1 text-2xl font-bold text-navy">{c.id}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge tone="navy">{c.issue_type}</Badge>
              <Badge tone={severityTone(c.severity)}>
                {t("report.severity", "Severity")}: {c.severity}
              </Badge>
              <Badge tone="saffron">{c.department}</Badge>
              <Badge tone="gray">{c.status}</Badge>
            </div>

            {result.note && (
              <p className="text-sm text-foreground">{result.note}</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={`/track?id=${encodeURIComponent(c.id)}`}>
                <Button variant="green">
                  {t("report.track", "Track this complaint")}
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setText("");
                  setAddress("");
                  setWard("");
                  clearPhoto();
                }}
              >
                {t("report.another", "File another")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-6 flex items-center gap-2">
        <MapPin className="h-6 w-6 text-saffron" />
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("report.heading", "Report a public issue")}
        </h1>
      </div>

      <Card>
        <CardContent className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("report.describe", "Describe the issue")}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder={t(
                "report.describePlaceholder",
                "e.g. Overflowing garbage bin near the market, not collected for days."
              )}
              className="w-full resize-none rounded-xl border border-border bg-white p-3 text-sm text-foreground outline-none focus:border-saffron focus-visible:ring-2 focus-visible:ring-saffron/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("report.uploadPhoto", "Add a photo")}
            </label>
            {photoDataUrl ? (
              <div className="relative w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoDataUrl}
                  alt={t("report.photoPreview", "Photo preview")}
                  className="max-h-56 rounded-xl border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  aria-label={t("report.removePhoto", "Remove photo")}
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-navy shadow-sm hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface p-6 text-muted transition-colors hover:border-saffron hover:text-saffron-dark"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-sm">
                  {t("report.uploadPhoto", "Add a photo")}
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoChange}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("report.location", "Location / address")}
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t(
                "report.locationPlaceholder",
                "Street, landmark, area"
              )}
              className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground outline-none focus:border-saffron focus-visible:ring-2 focus-visible:ring-saffron/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("report.ward", "Ward")}{" "}
              <span className="text-xs font-normal text-muted">
                ({t("report.optional", "optional")})
              </span>
            </label>
            <input
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder={t("report.wardPlaceholder", "e.g. Kothrud")}
              className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground outline-none focus:border-saffron focus-visible:ring-2 focus-visible:ring-saffron/40"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-saffron/10 p-3 text-sm text-saffron-dark">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={submit}
              disabled={loading || !text.trim() || !address.trim()}
            >
              {loading ? <Spinner /> : <Send className="h-4 w-4" />}
              {t("report.submit", "File complaint")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
