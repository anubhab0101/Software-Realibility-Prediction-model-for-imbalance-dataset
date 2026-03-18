import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  CheckCircle2,
  Database,
  FileText,
  Filter,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

import FileUpload from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type DatasetRecord = {
  id: string;
  name: string;
  description?: string | null;
  rowCount?: number | null;
  columnCount?: number | null;
  uploadedAt?: string | null;
  features?: Record<string, unknown> | null;
  dataQuality?: {
    imbalanceRatio?: number | null;
  } | null;
};

function suggestDatasetName(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getImbalanceMeta(imbalanceRatio?: number | null) {
  if (typeof imbalanceRatio !== "number") {
    return {
      label: "Pending",
      className: "bg-slate-100 text-slate-600",
      progress: 20,
      description: "Profiling pending",
    };
  }
  if (imbalanceRatio < 0.2) {
    return {
      label: "Balanced",
      className: "bg-emerald-50 text-emerald-700",
      progress: Math.max(10, imbalanceRatio * 100),
      description: `${(imbalanceRatio * 100).toFixed(1)}% imbalance`,
    };
  }
  if (imbalanceRatio < 0.4) {
    return {
      label: "Moderate",
      className: "bg-amber-50 text-amber-700",
      progress: Math.max(10, imbalanceRatio * 100),
      description: `${(imbalanceRatio * 100).toFixed(1)}% imbalance`,
    };
  }
  return {
    label: "High",
    className: "bg-rose-50 text-rose-700",
    progress: Math.min(100, imbalanceRatio * 100),
    description: `${(imbalanceRatio * 100).toFixed(1)}% imbalance`,
  };
}

export default function DataUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showProfiledOnly, setShowProfiledOnly] = useState(false);
  const [expandedDatasetId, setExpandedDatasetId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: datasetsData } = useQuery<DatasetRecord[]>({
    queryKey: ["/api/datasets"],
  });

  const datasets = Array.isArray(datasetsData) ? datasetsData : [];
  const totalRows = datasets.reduce((sum, dataset) => sum + (dataset.rowCount ?? 0), 0);
  const averageColumns =
    datasets.length > 0
      ? datasets.reduce((sum, dataset) => sum + (dataset.columnCount ?? 0), 0) / datasets.length
      : 0;
  const profiledDatasets = datasets.filter((dataset) => dataset.dataQuality).length;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredDatasets = [...datasets]
    .filter((dataset) => !showProfiledOnly || !!dataset.dataQuality)
    .filter((dataset) => {
      if (!normalizedQuery) {
        return true;
      }
      const haystack = `${dataset.name} ${dataset.description ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .sort((a, b) => {
      if (sortBy === "rows") {
        return (b.rowCount ?? 0) - (a.rowCount ?? 0);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      const left = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const right = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return right - left;
    });

  useEffect(() => {
    if (selectedFile && !nameTouched && name.trim().length === 0) {
      setName(suggestDatasetName(selectedFile.name));
    }
  }, [selectedFile, nameTouched, name]);

  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; name: string; description: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("name", data.name);
      formData.append("description", data.description);

      return new Promise<DatasetRecord>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/datasets/upload");

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) {
            return;
          }
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid upload response"));
            }
            return;
          }
          reject(new Error("Upload failed"));
        };

        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });
    },
    onMutate: () => {
      setUploadProgress(0);
    },
    onSuccess: () => {
      setUploadProgress(100);
      toast({
        title: "Success",
        description: "Dataset uploaded and analyzed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
      setSelectedFile(null);
      setName("");
      setDescription("");
      setNameTouched(false);
      setExpandedDatasetId(null);
      window.setTimeout(() => setUploadProgress(0), 500);
    },
    onError: () => {
      setUploadProgress(0);
      toast({
        title: "Error",
        description: "Failed to upload dataset",
        variant: "destructive",
      });
    },
  });

  const resolvedName = name.trim() || (selectedFile ? suggestDatasetName(selectedFile.name) : "");
  const isReady = Boolean(selectedFile) && resolvedName.length > 1;

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (resolvedName.length < 2) {
      toast({
        title: "Error",
        description: "Please provide a valid dataset name",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      file: selectedFile,
      name: resolvedName,
      description: description.trim(),
    });
  };

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          <Card className="overflow-hidden rounded-[32px] border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#edf6ff_100%)] shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)]">
            <CardContent className="p-8 lg:p-10">
              <Badge className="rounded-full bg-slate-950 px-3 py-1 text-white hover:bg-slate-950">
                Dataset Operations
              </Badge>
              <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(220px,0.82fr)]">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                      Data Intake Workspace
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-slate-600">
                      Upload, profile, and manage defect datasets with the same research-grade control surface
                      used across the dashboard.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Inventory
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">{datasets.length}</div>
                      <p className="mt-1 text-sm text-slate-500">Datasets available in the workspace.</p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Dataset Rows
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">{totalRows.toLocaleString()}</div>
                      <p className="mt-1 text-sm text-slate-500">Records ready for analysis and training.</p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Avg. Width
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">{averageColumns.toFixed(1)}</div>
                      <p className="mt-1 text-sm text-slate-500">Average feature columns per dataset.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.55)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Ready For Profiling
                      </div>
                      <div className="mt-2 text-3xl font-semibold">
                        {datasets.length > 0 ? Math.round((profiledDatasets / datasets.length) * 100) : 0}%
                      </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    Upload flow supports structured defect datasets and pushes them directly into the analysis
                    pipeline.
                  </p>
                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Accepted Formats</div>
                      <div className="mt-1 text-lg font-semibold text-white">CSV, JSON, XLSX</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Quality Coverage</div>
                      <div className="mt-1 text-lg font-semibold text-white">{profiledDatasets} profiled datasets</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Recommended Target</div>
                      <div className="mt-1 text-lg font-semibold text-white">Binary defect label</div>
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
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">Upload Checklist</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Use the same quality guardrails as the dashboard.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Schema clarity",
                  description: "Keep metric columns numeric and include a clear target variable for defect prediction.",
                  icon: FileText,
                },
                {
                  title: "Balanced profiling",
                  description: "Review imbalance after upload so sampling and ensemble choices stay grounded in data.",
                  icon: BarChart3,
                },
                {
                  title: "Dataset traceability",
                  description: "Name each upload clearly so experiments and models stay easy to compare later.",
                  icon: Database,
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <div className="space-y-6">
            <Card className="rounded-[30px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-950">Upload Dataset</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      Add a new dataset and run the automated analysis pipeline immediately.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <FileUpload
                  onFileSelect={(file) => {
                    setSelectedFile(file);
                    if (!file) {
                      setUploadProgress(0);
                      setName("");
                      setNameTouched(false);
                    }
                  }}
                />

                {selectedFile && (
                  <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      File Summary
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white bg-white px-4 py-3">
                        <div className="text-xs text-slate-400">Name</div>
                        <div className="mt-1 truncate text-sm font-semibold text-slate-950">{selectedFile.name}</div>
                      </div>
                      <div className="rounded-2xl border border-white bg-white px-4 py-3">
                        <div className="text-xs text-slate-400">Size</div>
                        <div className="mt-1 text-sm font-semibold text-slate-950">{formatFileSize(selectedFile.size)}</div>
                      </div>
                      <div className="rounded-2xl border border-white bg-white px-4 py-3">
                        <div className="text-xs text-slate-400">Modified</div>
                        <div className="mt-1 text-sm font-semibold text-slate-950">
                          {new Date(selectedFile.lastModified).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                        Dataset Name
                      </Label>
                      {selectedFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setName(suggestDatasetName(selectedFile.name));
                            setNameTouched(false);
                          }}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          Use suggested name
                        </button>
                      )}
                    </div>
                    <Input
                      id="name"
                      placeholder="Enter dataset name"
                      value={name}
                      onChange={(e) => {
                        setNameTouched(true);
                        setName(e.target.value);
                      }}
                      className="h-12 rounded-2xl border-slate-200 bg-white/90 text-slate-950 shadow-sm placeholder:text-slate-400"
                    />
                  </div>
                  <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Upload Readiness
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {[
                        { label: "Dataset file selected", ready: Boolean(selectedFile) },
                        { label: "Name is set", ready: resolvedName.length > 1 },
                        { label: "Description added (recommended)", ready: description.trim().length > 5 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-slate-600">
                          <CheckCircle2 className={`h-4 w-4 ${item.ready ? "text-emerald-500" : "text-slate-300"}`} />
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                      Description
                    </Label>
                    <span className="text-xs text-slate-400">{description.length} characters</span>
                  </div>
                  <Textarea
                    id="description"
                    placeholder="Describe your dataset"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[132px] rounded-[24px] border-slate-200 bg-white/90 text-slate-950 shadow-sm placeholder:text-slate-400"
                  />
                </div>

                {(uploadMutation.isPending || uploadProgress > 0) && (
                  <div className="space-y-2 rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-3">
                    <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!isReady || uploadMutation.isPending}
                  className="h-12 w-full rounded-2xl bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.6)] hover:bg-slate-800"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload & Analyze"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[30px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">Dataset Library</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Search, filter, and inspect uploaded dataset profiles.
                  </CardDescription>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search datasets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 rounded-2xl border-slate-200 bg-white pl-9"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="rows">Most Rows</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant={showProfiledOnly ? "default" : "outline"}
                  onClick={() => setShowProfiledOnly((prev) => !prev)}
                  className={`h-11 rounded-2xl ${
                    showProfiledOnly
                      ? "bg-slate-950 text-white hover:bg-slate-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Profiled
                </Button>
              </div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Showing {filteredDatasets.length} of {datasets.length} datasets
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredDatasets.map((dataset) => {
                const featureNames = dataset.features ? Object.keys(dataset.features) : [];
                const isExpanded = expandedDatasetId === dataset.id;
                const imbalance = getImbalanceMeta(dataset.dataQuality?.imbalanceRatio);

                return (
                  <div
                    key={dataset.id}
                    className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-base font-semibold text-slate-950">{dataset.name}</div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {dataset.description || "No description provided for this dataset."}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600">
                        {dataset.rowCount ?? 0} rows
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white bg-white px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Columns
                        </div>
                        <div className="mt-1 text-lg font-semibold text-slate-950">{dataset.columnCount ?? 0}</div>
                      </div>
                      <div className="rounded-2xl border border-white bg-white px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Imbalance
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${imbalance.className}`}>
                            {imbalance.label}
                          </span>
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-950">{imbalance.description}</div>
                        <Progress value={imbalance.progress} className="mt-2 h-1.5" />
                      </div>
                      <div className="rounded-2xl border border-white bg-white px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Features
                        </div>
                        <div className="mt-1 text-lg font-semibold text-slate-950">{featureNames.length}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        {dataset.uploadedAt
                          ? `Uploaded ${new Date(dataset.uploadedAt).toLocaleDateString()}`
                          : "Upload date unavailable"}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedDatasetId((prev) => (prev === dataset.id ? null : dataset.id))}
                        className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600 hover:text-blue-700"
                      >
                        {isExpanded ? "Hide details" : "Show details"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <p className="mb-2 text-sm font-medium text-slate-700">Feature Preview</p>
                        {featureNames.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {featureNames.map((feature) => (
                              <span
                                key={feature}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No feature metadata available.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredDatasets.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
                  <Database className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-base font-medium text-slate-700">No matching datasets found</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Try clearing search or disabling filters to see all uploads.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
