"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileText, Clock, CheckCircle2, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Spinner } from "@/components/ui";
import { useT } from "@/lib/i18n";

const PALETTE = ["#FF9933", "#138808", "#000080", "#e8842a", "#4b5563"];

type Dashboard = {
  totals: { complaints: number; resolved: number; open: number };
  byDepartment: { key: string; department: string; count: number }[];
  byStatus: { key: string; count: number }[];
  byWard: { key: string; count: number }[];
  avgResolutionDays: number;
};

function humanize(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DashboardPage() {
  const t = useT();
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = (await res.json()) as Dashboard;
        if (active) setData(json);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-saffron" />
      </div>
    );
  }

  const statusData = data.byStatus.map((s) => ({
    name: humanize(s.key),
    value: s.count,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">
        {t("dashboard.heading", "Civic transparency dashboard")}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {t(
          "dashboard.subheading",
          "A public, real-time view of civic complaints and how they get resolved."
        )}
      </p>

      {/* KPI row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<FileText className="h-5 w-5" />}
          accent="#000080"
          label={t("dashboard.total", "Total complaints")}
          value={data.totals.complaints}
        />
        <KpiCard
          icon={<Clock className="h-5 w-5" />}
          accent="#FF9933"
          label={t("dashboard.open", "Open")}
          value={data.totals.open}
        />
        <KpiCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="#138808"
          label={t("dashboard.resolved", "Resolved")}
          value={data.totals.resolved}
        />
        <KpiCard
          icon={<Timer className="h-5 w-5" />}
          accent="#e8842a"
          label={t("dashboard.avgResolution", "Avg resolution (days)")}
          value={data.avgResolutionDays}
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {t("dashboard.byDepartment", "Complaints by department")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.byDepartment}
                  margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis
                    dataKey="department"
                    tick={{ fontSize: 11, fill: "#4b5563" }}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#4b5563" }}
                    label={{
                      value: t("dashboard.count", "Count"),
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 11, fill: "#4b5563" },
                    }}
                  />
                  <Tooltip cursor={{ fill: "rgba(255,153,51,0.08)" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.byDepartment.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.byStatus", "Complaints by status")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.byWard", "Complaints by ward")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.byWard}
                  margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis
                    dataKey="key"
                    tick={{ fontSize: 11, fill: "#4b5563" }}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#4b5563" }}
                    label={{
                      value: t("dashboard.count", "Count"),
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 11, fill: "#4b5563" },
                    }}
                  />
                  <Tooltip cursor={{ fill: "rgba(19,136,8,0.08)" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.byWard.map((_, i) => (
                      <Cell key={i} fill={PALETTE[(i + 1) % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  accent,
  label,
  value,
}: {
  icon: React.ReactNode;
  accent: string;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-navy">{value}</div>
          <div className="text-xs text-muted">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
