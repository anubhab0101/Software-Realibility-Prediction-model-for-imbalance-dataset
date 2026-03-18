import React from "react";
import { Calendar, Clock, Eye, FileText, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PredictionHistoryProps {
  history: any[];
  onSelectPrediction: (prediction: any) => void;
}

export default function PredictionHistory({ history, onSelectPrediction }: PredictionHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPerformanceStatus = (score: number) => {
    if (score >= 80) return { text: "Excellent", className: "bg-emerald-50 text-emerald-700" };
    if (score >= 60) return { text: "Good", className: "bg-amber-50 text-amber-700" };
    return { text: "Needs Improvement", className: "bg-rose-50 text-rose-700" };
  };

  if (history.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 px-5 py-12 text-center text-slate-500">
        <FileText className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-4 text-lg font-medium text-slate-700">No prediction history</p>
        <p className="mt-2 text-sm">Upload code to start building your analysis history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-[24px] border border-slate-100 bg-slate-50/70 px-5 py-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">History Stream</div>
          <div className="mt-1 text-lg font-semibold text-slate-950">
            {history.length} analysis{history.length !== 1 ? "es" : ""}
          </div>
        </div>
        <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600">
          Recent first
        </Badge>
      </div>

      <div className="grid gap-4">
        {history.map((prediction, index) => {
          const performanceScore = prediction.performanceMetrics?.overallScore || 50;
          const status = getPerformanceStatus(performanceScore);

          return (
            <Card
              key={index}
              className="rounded-[24px] border-slate-200/80 bg-white/90 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.4)] transition-shadow hover:shadow-[0_20px_55px_-35px_rgba(15,23,42,0.4)]"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <h3 className="font-medium text-slate-950">
                        {prediction.fileName || `Analysis #${index + 1}`}
                      </h3>
                      <Badge className={`rounded-full px-3 py-1 font-medium ${status.className}`}>
                        {status.text}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(prediction.timestamp || new Date().toISOString())}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Score: {performanceScore}%</span>
                      </div>

                      {prediction.analysisTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Duration: {prediction.analysisTime}ms</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {prediction.type && (
                        <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                          {prediction.type}
                        </Badge>
                      )}
                      {prediction.language && (
                        <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                          {prediction.language}
                        </Badge>
                      )}
                      {prediction.linesOfCode && (
                        <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                          {prediction.linesOfCode} lines
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectPrediction(prediction)}
                    className="ml-4 rounded-2xl border-slate-200 bg-white px-4 text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
