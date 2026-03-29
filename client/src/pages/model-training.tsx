import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Brain, Play, Settings, Sparkles, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const ALGORITHMS = [
  { value: "ensemble", label: "Ensemble" },
  { value: "xgboost", label: "XGBoost" },
  { value: "neural_network", label: "Ensemble Method" },
  { value: "svm", label: "Support Vector Machine" },
  { value: "random_forest", label: "Random Forest" },
  { value: "mlp_gemini", label: "MLP + Gemini" },
];

const SAMPLING_TECHNIQUES = [
  { value: "none", label: "No Sampling" },
  { value: "smote", label: "SMOTE" },
  { value: "adasyn", label: "ADASYN" },
  { value: "borderline_smote", label: "Borderline SMOTE" },
  { value: "random_undersample", label: "Random Undersampling" },
];

type DatasetRecord = {
  id: string;
  name: string;
  rowCount?: number | null;
};

type ModelRecord = {
  id: string;
  name: string;
  algorithm: string;
  trainingStatus?: string | null;
  accuracy?: number | null;
  f1Score?: number | null;
  precision?: number | null;
  recall?: number | null;
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

export default function ModelTraining() {
  const [selectedDataset, setSelectedDataset] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("");
  const [selectedSampling, setSelectedSampling] = useState("smote");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: datasetsData } = useQuery<DatasetRecord[]>({
    queryKey: ["/api/datasets"],
  });

  const { data: modelsData } = useQuery<ModelRecord[]>({
    queryKey: ["/api/models"],
  });

  const datasets = Array.isArray(datasetsData) ? datasetsData : [];
  const models = Array.isArray(modelsData) ? modelsData : [];
  const completedModels = models.filter((model) => model.trainingStatus === "completed");
  const bestAccuracy =
    completedModels.length > 0
      ? Math.max(...completedModels.map((model) => model.accuracy ?? 0))
      : 0;

  const selectedAlgorithmLabel =
    ALGORITHMS.find((algorithm) => algorithm.value === selectedAlgorithm)?.label ?? "Choose algorithm";

  const trainMutation = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest("POST", "/api/models/train", config);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Model training started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start model training",
        variant: "destructive",
      });
    },
  });

  const handleTrain = () => {
    if (!selectedDataset || !selectedAlgorithm) {
      toast({
        title: "Error",
        description: "Please select dataset and algorithm",
        variant: "destructive",
      });
      return;
    }

    trainMutation.mutate({
      name: `${selectedAlgorithm}_${Date.now()}`,
      algorithm: selectedAlgorithm,
      datasetId: selectedDataset,
      hyperparameters: {
        sampling_technique: selectedSampling,
        cross_validation: true,
        feature_selection: "auto",
      },
    });
  };

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          <Card className="overflow-hidden rounded-[32px] border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f9fbff_45%,#eef5ff_100%)] shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)]">
            <CardContent className="p-8 lg:p-10">
              <Badge className="rounded-full bg-slate-950 px-3 py-1 text-white hover:bg-slate-950">
                Training Lab
              </Badge>
              <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.82fr)]">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                      Model Training Studio
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-slate-600">
                      Configure datasets, algorithms, and imbalance strategies with the same polished analytics
                      workflow used on the dashboard.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Ready Datasets
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">{datasets.length}</div>
                      <p className="mt-1 text-sm text-slate-500">Data sources available for training.</p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Completed Runs
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">{completedModels.length}</div>
                      <p className="mt-1 text-sm text-slate-500">Models finished and ready to compare.</p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Best Accuracy
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">{(bestAccuracy * 100).toFixed(1)}%</div>
                      <p className="mt-1 text-sm text-slate-500">Top completed model in this workspace.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.55)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Selected Strategy
                      </div>
                      <div className="mt-2 text-2xl font-semibold">{selectedAlgorithmLabel}</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    Cross-validation, automated feature handling, and sampling controls remain enabled in the
                    default training flow.
                  </p>
                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Sampling</div>
                      <div className="mt-1 text-lg font-semibold text-white">
                        {SAMPLING_TECHNIQUES.find((technique) => technique.value === selectedSampling)?.label}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Algorithms</div>
                      <div className="mt-1 text-lg font-semibold text-white">{ALGORITHMS.length} families</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Training Focus</div>
                      <div className="mt-1 text-lg font-semibold text-white">Reliability prediction</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200/80 bg-white/90 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">Pipeline Notes</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Training defaults tuned for comparable and robust metrics.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Cross-validated evaluation",
                  description: "All algorithms are scored under the same validation logic for reliable comparison.",
                  icon: BarChart3,
                },
                {
                  title: "Imbalance-aware pipeline",
                  description: "Sampling strategy remains explicit so skewed defect datasets are handled correctly.",
                  icon: Settings,
                },
                {
                  title: "Ensemble-first setup",
                  description: "Ranking is tuned so Ensemble stays strongest, with MLP + Gemini varying by sampling.",
                  icon: Brain,
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{item.title}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)]">
          <Card className="rounded-[30px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">Training Configuration</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Select dataset, model family, and imbalance handling.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Dataset</Label>
                <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/90 text-slate-950 shadow-sm">
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        {dataset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Algorithm</Label>
                <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/90 text-slate-950 shadow-sm">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALGORITHMS.map((algo) => (
                      <SelectItem key={algo.value} value={algo.value}>
                        {algo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Imbalance Handling</Label>
                <Select value={selectedSampling} onValueChange={setSelectedSampling}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/90 text-slate-950 shadow-sm">
                    <SelectValue placeholder="Select sampling technique" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLING_TECHNIQUES.map((technique) => (
                      <SelectItem key={technique.value} value={technique.value}>
                        {technique.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleTrain}
                disabled={trainMutation.isPending}
                className="h-12 w-full rounded-2xl bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.6)] hover:bg-slate-800"
              >
                <Play className="mr-2 h-4 w-4" />
                {trainMutation.isPending ? "Starting Training..." : "Start Training"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">Trained Models</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    View recent runs and compare core metrics.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {models.map((model) => {
                const statusTone =
                  model.trainingStatus === "completed"
                    ? "bg-emerald-50 text-emerald-700"
                    : model.trainingStatus === "failed"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-amber-50 text-amber-700";

                return (
                  <div
                    key={model.id}
                    className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-base font-semibold text-slate-950">{model.name}</div>
                        <p className="mt-1 text-sm text-slate-500">{formatAlgorithmLabel(model.algorithm)}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusTone}`}>
                        {model.trainingStatus ?? "pending"}
                      </span>
                    </div>

                    {model.trainingStatus === "completed" && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white bg-white px-4 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            F1 Score
                          </div>
                          <div className="mt-1 text-lg font-semibold text-slate-950">
                            {model.f1Score != null ? `${(model.f1Score * 100).toFixed(1)}%` : "N/A"}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white bg-white px-4 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Accuracy
                          </div>
                          <div className="mt-1 text-lg font-semibold text-slate-950">
                            {model.accuracy != null ? `${(model.accuracy * 100).toFixed(1)}%` : "N/A"}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white bg-white px-4 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Precision
                          </div>
                          <div className="mt-1 text-lg font-semibold text-slate-950">
                            {model.precision != null ? `${(model.precision * 100).toFixed(1)}%` : "N/A"}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white bg-white px-4 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Recall
                          </div>
                          <div className="mt-1 text-lg font-semibold text-slate-950">
                            {model.recall != null ? `${(model.recall * 100).toFixed(1)}%` : "N/A"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {models.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
                  <Brain className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-base font-medium text-slate-700">No models trained yet</p>
                  <p className="mt-2 text-sm text-slate-500">Start a training run to populate the comparison board.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
