import { useState } from "react";
import { BarChart3, Code, History, Upload } from "lucide-react";

import CodeUpload from "@/components/code-upload";
import PredictionHistory from "@/components/prediction-history";
import PredictionResults from "@/components/prediction-results";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CodePrediction() {
  const [activeTab, setActiveTab] = useState("upload");
  const [predictionResults, setPredictionResults] = useState<any>(null);
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);

  const averageScore =
    predictionHistory.length > 0
      ? predictionHistory.reduce((sum, item) => sum + (item.performanceMetrics?.overallScore || 0), 0) /
        predictionHistory.length
      : 0;
  const bestScore =
    predictionHistory.length > 0
      ? Math.max(...predictionHistory.map((item) => item.performanceMetrics?.overallScore || 0))
      : 0;

  const handlePredictionComplete = (results: any) => {
    setPredictionResults(results);
    setPredictionHistory((prev) => [results, ...prev]);
    setActiveTab("results");
  };

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          <Card className="overflow-hidden rounded-[32px] border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_45%,#edf5ff_100%)] shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)]">
            <CardContent className="p-8 lg:p-10">
              <Badge className="rounded-full bg-slate-950 px-3 py-1 text-white hover:bg-slate-950">
                Code Intelligence
              </Badge>
              <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.82fr)]">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                      Code Prediction Workspace
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-slate-600">
                      Upload source code, inspect performance forecasts, and review optimization guidance in
                      the same professional language as the dashboard.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Analyses
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">{predictionHistory.length}</div>
                      <p className="mt-1 text-sm text-slate-500">Prediction runs in this session.</p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Avg. Score
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">{averageScore.toFixed(1)}%</div>
                      <p className="mt-1 text-sm text-slate-500">Mean quality across analyzed code.</p>
                    </div>
                    <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Best Score
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">{bestScore.toFixed(1)}%</div>
                      <p className="mt-1 text-sm text-slate-500">Highest result in the session.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.55)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Active Panel
                  </div>
                  <div className="mt-2 text-2xl font-semibold capitalize text-white">{activeTab}</div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    Move between upload, results, history, and docs without leaving the same polished workflow.
                  </p>
                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Input Types</div>
                      <div className="mt-1 text-lg font-semibold text-white">File, GitHub, snippet</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Output Focus</div>
                      <div className="mt-1 text-lg font-semibold text-white">Performance and risk</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">History Mode</div>
                      <div className="mt-1 text-lg font-semibold text-white">Session-based archive</div>
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
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-950">Workflow Notes</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Keep prediction runs structured and comparable.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Upload coherent code blocks for stable and useful predictions.",
                "Review the result tab first, then compare alternatives in history.",
                "Use documentation as a quick operator guide for supported input modes.",
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5 text-sm leading-6 text-slate-500">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-[24px] border border-slate-200 bg-white/85 p-1.5 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.4)] sm:grid-cols-4">
            <TabsTrigger
              value="upload"
              className="flex items-center gap-2 rounded-[18px] px-4 py-3 text-slate-500 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Upload className="h-4 w-4" />
              Upload Code
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center gap-2 rounded-[18px] px-4 py-3 text-slate-500 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4" />
              Results
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 rounded-[18px] px-4 py-3 text-slate-500 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="docs"
              className="flex items-center gap-2 rounded-[18px] px-4 py-3 text-slate-500 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Code className="h-4 w-4" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="rounded-[30px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Code Upload
                </CardTitle>
                <CardDescription>
                  Upload your code files, GitHub repositories, or code snippets for performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeUpload onPredictionComplete={handlePredictionComplete} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card className="rounded-[30px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Prediction Results
                </CardTitle>
                <CardDescription>
                  Performance predictions and optimization suggestions for your code
                </CardDescription>
              </CardHeader>
              <CardContent>
                {predictionResults ? (
                  <PredictionResults results={predictionResults} />
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 px-5 py-12 text-center text-slate-500">
                    <BarChart3 className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-lg font-medium text-slate-700">No predictions yet</p>
                    <p className="mt-2 text-sm">Upload code to get performance predictions.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="rounded-[30px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Prediction History
                </CardTitle>
                <CardDescription>
                  View your previous code analysis results and predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PredictionHistory history={predictionHistory} onSelectPrediction={setPredictionResults} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <Card className="rounded-[30px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Documentation
                </CardTitle>
                <CardDescription>
                  Learn how to use the code prediction system effectively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 lg:grid-cols-3">
                  {[
                    {
                      title: "Supported Inputs",
                      items: [
                        "Single files such as .py, .js, .java, .cpp, .cs, .go, .rs",
                        "GitHub repository URLs",
                        "Code snippets pasted directly",
                        "Compressed archives such as .zip and .tar.gz",
                      ],
                    },
                    {
                      title: "Prediction Metrics",
                      items: [
                        "Execution time estimation",
                        "Memory usage forecast",
                        "CPU utilization profile",
                        "Code complexity analysis",
                        "Optimization recommendations",
                      ],
                    },
                    {
                      title: "Best Practices",
                      items: [
                        "Upload complete runnable sections where possible",
                        "Keep imports visible for better context",
                        "Use history to compare code revisions",
                        "Review risk findings before applying optimizations",
                      ],
                    },
                  ].map((section) => (
                    <div key={section.title} className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5">
                      <h3 className="text-lg font-semibold text-slate-950">{section.title}</h3>
                      <div className="mt-4 space-y-3">
                        {section.items.map((item) => (
                          <div key={item} className="rounded-2xl border border-white bg-white px-4 py-3 text-sm leading-6 text-slate-500">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
