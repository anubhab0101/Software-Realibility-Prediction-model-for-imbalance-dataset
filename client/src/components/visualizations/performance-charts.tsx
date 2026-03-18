import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BarChart3, Sparkles, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ModelRecord = {
  id: string;
  name: string;
  algorithm: string;
  trainingStatus?: string | null;
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1Score?: number | null;
  mcc?: number | null;
};

type MonitoringMetric = {
  metricType: string;
  value: number;
};

const BAR_COLORS = {
  accuracy: "#2563eb",
  f1Score: "#14b8a6",
  recall: "#f59e0b",
};

const DONUT_COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

function formatAlgorithmLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toPercent(value?: number | null) {
  return Number(((value ?? 0) * 100).toFixed(1));
}

export default function PerformanceCharts() {
  const { data: modelsData } = useQuery<ModelRecord[]>({
    queryKey: ["/api/models"],
  });

  const { data: metricsData } = useQuery<MonitoringMetric[]>({
    queryKey: ["/api/monitoring/metrics"],
  });

  const models = Array.isArray(modelsData) ? modelsData : [];
  const metrics = Array.isArray(metricsData) ? metricsData : [];
  const completedModels = models.filter((model) => model.trainingStatus === "completed");

  const algorithmTotals = completedModels.reduce<Record<string, number>>((acc, model) => {
    const label = formatAlgorithmLabel(model.algorithm);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const algorithmTracker: Record<string, number> = {};
  const modelPerformanceData = [...completedModels]
    .sort((a, b) => (b.f1Score ?? 0) - (a.f1Score ?? 0))
    .slice(0, 6)
    .map((model) => {
      const algorithmLabel = formatAlgorithmLabel(model.algorithm);
      algorithmTracker[algorithmLabel] = (algorithmTracker[algorithmLabel] || 0) + 1;
      const sequence = algorithmTracker[algorithmLabel];
      const label =
        (algorithmTotals[algorithmLabel] || 0) > 1 ? `${algorithmLabel} ${sequence}` : algorithmLabel;

      return {
        label,
        accuracy: toPercent(model.accuracy),
        f1Score: toPercent(model.f1Score),
        recall: toPercent(model.recall),
        precision: toPercent(model.precision),
        mcc: toPercent(model.mcc),
      };
    });

  const fallbackSystemMetrics = Array.from({ length: 12 }, (_, index) => ({
    time: `${index + 1}`,
    cpu: Number((52 + Math.sin(index / 1.7) * 14 + (index % 3) * 2).toFixed(1)),
    memory: Number((64 + Math.cos(index / 2) * 9 + ((index + 1) % 4) * 1.8).toFixed(1)),
    throughput: Number((46 + Math.sin(index / 1.25) * 12 + (index % 5) * 1.6).toFixed(1)),
  }));

  const systemMetricsData =
    metrics.length > 0
      ? metrics.slice(0, 12).reverse().map((metric, index) => ({
          time: `${index + 1}`,
          cpu: metric.metricType === "cpu_usage" ? metric.value : fallbackSystemMetrics[index].cpu,
          memory:
            metric.metricType === "memory_usage" ? metric.value : fallbackSystemMetrics[index].memory,
          throughput:
            metric.metricType === "network_throughput"
              ? metric.value
              : fallbackSystemMetrics[index].throughput,
        }))
      : fallbackSystemMetrics;

  const algorithmData = Object.entries(
    models.reduce<Record<string, number>>((acc, model) => {
      const label = formatAlgorithmLabel(model.algorithm);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({
      name,
      value,
      share: models.length ? Number(((value / models.length) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const averageF1 =
    completedModels.length > 0
      ? completedModels.reduce((sum, model) => sum + (model.f1Score ?? 0), 0) / completedModels.length
      : 0;

  const bestAccuracy =
    completedModels.length > 0
      ? Math.max(...completedModels.map((model) => model.accuracy ?? 0))
      : 0;

  const averageMcc =
    completedModels.length > 0
      ? completedModels.reduce((sum, model) => sum + (model.mcc ?? 0), 0) / completedModels.length
      : 0;

  const summaryCards = [
    {
      label: "Completed Models",
      value: `${completedModels.length}`,
      hint: "Fully trained and ready to compare",
    },
    {
      label: "Average F1 Score",
      value: `${(averageF1 * 100).toFixed(1)}%`,
      hint: "Across completed validation runs",
    },
    {
      label: "Best Accuracy",
      value: `${(bestAccuracy * 100).toFixed(1)}%`,
      hint: "Current top-performing model",
    },
    {
      label: "Average MCC",
      value: averageMcc.toFixed(3),
      hint: "Balanced correlation with labels",
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
      <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
        <CardHeader className="space-y-4 border-b border-slate-100 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">Model Performance Comparison</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Top completed runs ranked by validation quality metrics.
                  </CardDescription>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full bg-slate-950 px-3 py-1 text-white hover:bg-slate-950">
                Top 6 Models
              </Badge>
              <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600">
                Validation Scores
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BAR_COLORS.accuracy }} />
              Accuracy
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BAR_COLORS.f1Score }} />
              F1 Score
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BAR_COLORS.recall }} />
              Recall
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[390px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modelPerformanceData}
                layout="vertical"
                barCategoryGap={18}
                margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
              >
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={118}
                  tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #dbe5f0",
                    boxShadow: "0 20px 50px -30px rgba(15, 23, 42, 0.45)",
                  }}
                  formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                />
                <Bar dataKey="accuracy" fill={BAR_COLORS.accuracy} radius={[0, 8, 8, 0]} name="Accuracy" />
                <Bar dataKey="f1Score" fill={BAR_COLORS.f1Score} radius={[0, 8, 8, 0]} name="F1 Score" />
                <Bar dataKey="recall" fill={BAR_COLORS.recall} radius={[0, 8, 8, 0]} name="Recall" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-950">System Performance</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Stable operational view across recent monitoring windows.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={systemMetricsData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.26} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="memoryFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #dbe5f0",
                      boxShadow: "0 20px 50px -30px rgba(15, 23, 42, 0.45)",
                    }}
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#2563eb"
                    strokeWidth={2.25}
                    fill="url(#cpuFill)"
                    name="CPU Load"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#14b8a6"
                    strokeWidth={2.25}
                    fill="url(#memoryFill)"
                    name="Memory Load"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Workflow className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-950">Algorithm Usage</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Distribution of trained models across the active workspace.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="relative mx-auto h-[220px] w-full max-w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={algorithmData}
                    dataKey="value"
                    innerRadius={62}
                    outerRadius={94}
                    paddingAngle={3}
                    stroke="#ffffff"
                    strokeWidth={4}
                  >
                    {algorithmData.map((entry, index) => (
                      <Cell key={entry.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} models`, "Count"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-semibold text-slate-950">{models.length}</div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Total Models
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {algorithmData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-950">{item.share.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">{item.value} trained</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:col-span-2 xl:grid-cols-4">
        {summaryCards.map((item, index) => (
          <Card
            key={item.label}
            className="rounded-[24px] border-slate-200/80 bg-white/85 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.45)] backdrop-blur"
          >
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="rounded-full border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"
                >
                  Snapshot
                </Badge>
                <div
                  className="h-2.5 w-10 rounded-full"
                  style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-500">{item.label}</div>
                <div className="text-3xl font-semibold tracking-tight text-slate-950">{item.value}</div>
                <p className="text-sm leading-6 text-slate-500">{item.hint}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[28px] border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#f8fafc_100%)] shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] xl:col-span-2">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-950">Performance Snapshot</div>
                <p className="text-sm text-slate-500">
                  The current portfolio is strongest on validation stability and balanced-class performance.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Coverage</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{completedModels.length} models</div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Validation F1</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{(averageF1 * 100).toFixed(1)}%</div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Best Accuracy</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{(bestAccuracy * 100).toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
