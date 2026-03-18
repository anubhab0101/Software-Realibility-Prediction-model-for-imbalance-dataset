import React from "react";
import { AlertTriangle, CheckCircle, Clock, Code, Cpu, MemoryStick, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PredictionResultsProps {
  results: any;
}

export default function PredictionResults({ results }: PredictionResultsProps) {
  if (!results) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No results available</p>
        <p className="text-sm">Upload code to get performance predictions</p>
      </div>
    );
  }

  const {
    performanceMetrics,
    complexityAnalysis,
    optimizationSuggestions,
    riskAssessment,
    codeQuality,
    fileName,
    analysisTime,
  } = results;

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  const getPerformanceBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700";
    if (score >= 60) return "bg-amber-50 text-amber-700";
    return "bg-rose-50 text-rose-700";
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const overallScore = performanceMetrics?.overallScore || 50;
  const executionPredicted = performanceMetrics?.executionTime?.predicted || 0;
  const executionBaseline = performanceMetrics?.executionTime?.baseline || 1;
  const executionLoad = executionBaseline > 0 ? Math.min(100, (executionPredicted / executionBaseline) * 100) : 0;
  const memoryPeak = performanceMetrics?.memoryUsage?.peak || 0;
  const memoryAverage = performanceMetrics?.memoryUsage?.average || 0;
  const memoryLoad = Math.min(100, memoryPeak);
  const cpuAverage = performanceMetrics?.cpuUtilization?.average || 0;
  const cpuPeak = performanceMetrics?.cpuUtilization?.peak || 0;
  const indicators = Array.isArray(codeQuality?.indicators) ? codeQuality.indicators : [];
  const risks = Array.isArray(riskAssessment?.risks) ? riskAssessment.risks : [];
  const suggestions = Array.isArray(optimizationSuggestions?.suggestions) ? optimizationSuggestions.suggestions : [];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_45%,#eef6ff_100%)] shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)]">
        <CardContent className="p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.22fr)_minmax(260px,0.82fr)]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full bg-slate-950 px-3 py-1 text-white hover:bg-slate-950">Analysis Result</Badge>
                <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600">
                  Analyzed in {formatTime(analysisTime)}
                </Badge>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Performance Analysis Results</h2>
                <p className="text-sm leading-6 text-slate-500">
                  {fileName ? `Analysis for: ${fileName}` : "Code performance prediction summary"}
                </p>
              </div>
              <div className="flex items-end gap-6">
                <div className={`text-5xl font-semibold tracking-tight ${getPerformanceColor(overallScore)}`}>
                  {overallScore}%
                </div>
                <div className="flex-1 space-y-2">
                  <Progress value={overallScore} className="h-3 rounded-full" />
                  <p className="text-sm text-slate-500">
                    {overallScore >= 80
                      ? "Excellent performance profile with only minor optimization opportunities."
                      : overallScore >= 60
                        ? "Strong baseline with clear areas available for tuning."
                        : "Performance and maintainability issues need attention before shipping."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-slate-950 p-5 text-white shadow-[0_20px_55px_-34px_rgba(15,23,42,0.6)]">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Run Snapshot</div>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Complexity Score</div>
                  <div className="mt-1 text-lg font-semibold text-white">{complexityAnalysis?.score || 50}%</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Peak Memory</div>
                  <div className="mt-1 text-lg font-semibold text-white">{Math.round(memoryPeak)} MB</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Average CPU</div>
                  <div className="mt-1 text-lg font-semibold text-white">{Math.round(cpuAverage)}%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            title: "Execution Time",
            icon: Clock,
            accent: "bg-blue-50 text-blue-600",
            primary: formatTime(executionPredicted),
            secondary: `Baseline ${formatTime(executionBaseline)}`,
            progress: executionLoad,
          },
          {
            title: "Memory Usage",
            icon: MemoryStick,
            accent: "bg-violet-50 text-violet-600",
            primary: `${Math.round(memoryPeak)} MB`,
            secondary: `Average ${Math.round(memoryAverage)} MB`,
            progress: memoryLoad,
          },
          {
            title: "CPU Utilization",
            icon: Cpu,
            accent: "bg-amber-50 text-amber-600",
            primary: `${Math.round(cpuAverage)}%`,
            secondary: `Peak ${Math.round(cpuPeak)}%`,
            progress: cpuAverage,
          },
        ].map((metric) => (
          <Card
            key={metric.title}
            className="rounded-[24px] border-slate-200/80 bg-white/90 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.4)]"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">{metric.title}</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{metric.primary}</div>
                  <p className="mt-1 text-sm text-slate-500">{metric.secondary}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.accent}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
              <Progress value={metric.progress} className="mt-4 h-2.5 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-950">
            <Code className="h-5 w-5" />
            Code Quality Analysis
          </CardTitle>
          <CardDescription className="text-slate-500">
            Assessment of complexity, maintainability, and implementation hygiene.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-950">Complexity Score</span>
                <Badge className={getPerformanceBg(complexityAnalysis?.score || 50)}>
                  {complexityAnalysis?.score || 50}%
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {complexityAnalysis?.description || "Code complexity assessment"}
              </p>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Cyclomatic Complexity</span>
                  <span className="font-medium text-slate-950">{complexityAnalysis?.cyclomaticComplexity || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Lines of Code</span>
                  <span className="font-medium text-slate-950">{complexityAnalysis?.linesOfCode || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Functions / Methods</span>
                  <span className="font-medium text-slate-950">{complexityAnalysis?.functionCount || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5">
              <h4 className="text-base font-semibold text-slate-950">Quality Indicators</h4>
              <div className="mt-4 space-y-3">
                {indicators.length > 0 ? (
                  indicators.map((indicator: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3">
                      {indicator.status === "good" ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-950">{indicator.name}</p>
                        <p className="text-xs text-slate-500">{indicator.description}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600"
                      >
                        {indicator.value}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-slate-200 bg-white/80 px-4 py-8 text-center text-sm text-slate-500">
                    No quality indicators available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Risk Assessment
            </CardTitle>
            <CardDescription className="text-slate-500">
              Potential performance bottlenecks and stability concerns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {risks.length > 0 ? (
              risks.map((risk: any, index: number) => (
                <div key={index} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-950">{risk.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{risk.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                          {risk.severity}
                        </span>
                        <span className="text-xs text-slate-500">Impact: {risk.impact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
                <CheckCircle className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
                No significant risks identified.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Optimization Suggestions
            </CardTitle>
            <CardDescription className="text-slate-500">
              Recommended improvements to raise performance and maintainability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion: any, index: number) => (
                <div key={index} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-950">{suggestion.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{suggestion.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="text-xs text-slate-500">
                          Expected improvement: {suggestion.expectedImprovement}
                        </span>
                        <Badge
                          variant="outline"
                          className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600"
                        >
                          {suggestion.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
                No optimization suggestions available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
