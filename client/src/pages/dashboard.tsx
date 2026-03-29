import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  Brain,
  Clock3,
  Database,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import PerformanceCharts from "@/components/visualizations/performance-charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type HealthResponse = {
  services?: Record<string, boolean>;
  timestamp?: string;
};

type DatasetRecord = {
  id: string;
  name: string;
  rowCount?: number | null;
  columnCount?: number | null;
  uploadedAt?: string | null;
};

type ModelRecord = {
  id: string;
  name: string;
  algorithm: string;
  trainingStatus?: string | null;
  accuracy?: number | null;
  f1Score?: number | null;
  createdAt?: string | null;
};

function formatAlgorithmLabel(value: string) {
  if (value === "mlp_gemini") {
    return "MLP + Gemini";
  }
  if (value === "neural_network") {
    return "Ensemble Method";
  }
  if (value === "ensemble") {
    return "Ensemble";
  }
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Dashboard() {
  const { data: healthData } = useQuery<HealthResponse>({
    queryKey: ["/api/health"],
    refetchInterval: 30000,
  });

  const { data: datasetsData } = useQuery<DatasetRecord[]>({
    queryKey: ["/api/datasets"],
  });

  const { data: modelsData } = useQuery<ModelRecord[]>({
    queryKey: ["/api/models"],
  });

  const datasets = Array.isArray(datasetsData) ? datasetsData : [];
  const models = Array.isArray(modelsData) ? modelsData : [];
  const services = Object.entries(healthData?.services ?? {});
  const healthyServices = services.filter(([, status]) => status).length;
  const completedModels = models.filter((model) => model.trainingStatus === "completed");
  const totalRows = datasets.reduce((sum, dataset) => sum + (dataset.rowCount ?? 0), 0);
  const averageF1 =
    completedModels.length > 0
      ? completedModels.reduce((sum, model) => sum + (model.f1Score ?? 0), 0) / completedModels.length
      : 0;
  const bestModel = [...completedModels].sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0))[0];
  const latestDataset = [...datasets].sort((a, b) => {
    const left = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const right = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return right - left;
  })[0];

  const statCards = [
    {
      label: "Datasets",
      value: `${datasets.length}`,
      description: "Curated datasets in the workspace",
      accent: "bg-blue-600",
      icon: Database,
    },
    {
      label: "Completed Models",
      value: `${completedModels.length}`,
      description: "Successful training runs ready to compare",
      accent: "bg-emerald-500",
      icon: Brain,
    },
    {
      label: "Average F1",
      value: `${(averageF1 * 100).toFixed(1)}%`,
      description: "Portfolio quality across completed models",
      accent: "bg-amber-500",
      icon: Activity,
    },
    {
      label: "Healthy Services",
      value: `${healthyServices}/${services.length || 0}`,
      description: "Platform services reporting healthy status",
      accent: "bg-slate-950",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
          <Card className="overflow-hidden rounded-[32px] border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_42%,#edf4ff_100%)] shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)]">
            <CardContent className="p-8 lg:p-10">
              <Badge className="rounded-full bg-slate-950 px-3 py-1 text-white hover:bg-slate-950">
                Live Research Dashboard
              </Badge>
              <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.8fr)]">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                      Research Command Center
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-slate-600">
                      Monitor software reliability experiments, compare model quality, and keep the full
                      ML workflow visible from a single operational view.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Total Rows
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">{totalRows.toLocaleString()}</div>
                      <p className="mt-1 text-sm text-slate-500">Records currently available for training.</p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Best Model
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">
                        {bestModel ? `${((bestModel.accuracy ?? 0) * 100).toFixed(1)}%` : "0.0%"}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {bestModel ? formatAlgorithmLabel(bestModel.algorithm) : "Waiting for completed runs"}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Latest Dataset
                      </div>
                      <div className="mt-2 truncate text-2xl font-semibold text-slate-950">
                        {latestDataset?.name ?? "None"}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {latestDataset?.columnCount ?? 0} columns available for analysis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.55)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Operations
                      </div>
                      <div className="mt-2 text-3xl font-semibold">
                        {services.length > 0 ? Math.round((healthyServices / services.length) * 100) : 0}%
                      </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    Healthy service ratio across the platform, aligned with active dataset and model usage.
                  </p>
                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Completed Training</div>
                      <div className="mt-1 text-lg font-semibold text-white">{completedModels.length} models</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Average F1 Score</div>
                      <div className="mt-1 text-lg font-semibold text-white">{(averageF1 * 100).toFixed(1)}%</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Dataset Inventory</div>
                      <div className="mt-1 text-lg font-semibold text-white">{datasets.length} active datasets</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200/80 bg-white/90 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">Workspace Pulse</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Fast snapshot of the current research environment.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Health Status</div>
                <div className="mt-2 text-3xl font-semibold text-slate-950">
                  {healthyServices} / {services.length || 0}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">Services currently reporting healthy telemetry.</p>
              </div>
              <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Training Portfolio</div>
                <div className="mt-2 text-3xl font-semibold text-slate-950">{models.length}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">All registered models across experimentation cycles.</p>
              </div>
              <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Dataset Footprint</div>
                <div className="mt-2 text-3xl font-semibold text-slate-950">{totalRows.toLocaleString()}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">Rows available for model fitting and benchmarking.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <Card
              key={stat.label}
              className="rounded-[24px] border-slate-200/80 bg-white/85 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.4)] backdrop-blur"
            >
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`h-2.5 w-10 rounded-full ${stat.accent}`} />
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                  <div className="text-3xl font-semibold tracking-tight text-slate-950">{stat.value}</div>
                  <p className="text-sm leading-6 text-slate-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">System Health Matrix</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Service readiness and operational availability across the platform.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {services.map(([service, status]) => (
                <div
                  key={service}
                  className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-3 w-3 rounded-full ${status ? "bg-emerald-500" : "bg-rose-500"}`}
                      />
                      <div className="text-base font-semibold capitalize text-slate-950">{service}</div>
                    </div>
                    <Badge
                      className={`rounded-full px-3 py-1 ${
                        status
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                          : "bg-rose-50 text-rose-700 hover:bg-rose-50"
                      }`}
                    >
                      {status ? "Healthy" : "Issue"}
                    </Badge>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-200">
                    <div
                      className={`h-2 rounded-full ${status ? "bg-emerald-500" : "bg-rose-500"}`}
                      style={{ width: status ? "100%" : "34%" }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">Recent Models</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Latest experiments and their current quality signals.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {models.slice(0, 5).map((model) => (
                <div
                  key={model.id}
                  className="rounded-[22px] border border-slate-100 bg-slate-50/70 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-950">{model.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{formatAlgorithmLabel(model.algorithm)}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600"
                    >
                      {model.trainingStatus ?? "pending"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        F1 Score
                      </div>
                      <div className="mt-1 text-xl font-semibold text-slate-950">
                        {model.f1Score ? `${(model.f1Score * 100).toFixed(1)}%` : "--"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Accuracy
                      </div>
                      <div className="mt-1 text-xl font-semibold text-slate-950">
                        {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : "--"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {models.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center text-sm text-slate-500">
                  No models have been created yet. Train a model to populate the activity stream.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <Badge
            variant="outline"
            className="rounded-full border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500"
          >
            Analytics Board
          </Badge>
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Performance Overview</h2>
            <p className="text-base text-slate-500">
              Compare trained model quality, system behavior, and algorithm distribution in one place.
            </p>
          </div>
        </div>

        <PerformanceCharts />
      </div>
    </div>
  );
}
