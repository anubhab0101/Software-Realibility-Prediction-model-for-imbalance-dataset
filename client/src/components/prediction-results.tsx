import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  MemoryStick, 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  Code,
  TrendingUp,
  TrendingDown
} from "lucide-react";

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
    analysisTime
  } = results;

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Analysis Results</h2>
          <p className="text-muted-foreground">
            {fileName ? `Analysis for: ${fileName}` : 'Code Performance Prediction'}
          </p>
        </div>
        <Badge variant="secondary">
          Analyzed in {formatTime(analysisTime)}
        </Badge>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
          <CardDescription>
            Combined assessment of execution time, memory usage, and code quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className={`text-4xl font-bold ${getPerformanceColor(performanceMetrics?.overallScore || 50)}`}>
              {performanceMetrics?.overallScore || 50}%
            </div>
            <div className="flex-1">
              <Progress 
                value={performanceMetrics?.overallScore || 50} 
                className="h-3"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {performanceMetrics?.overallScore >= 80 
                  ? "Excellent performance" 
                  : performanceMetrics?.overallScore >= 60 
                    ? "Good performance with room for improvement"
                    : "Needs significant optimization"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              Execution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Predicted</span>
                <span className="font-medium">
                  {formatTime(performanceMetrics?.executionTime?.predicted || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Baseline</span>
                <span className="text-sm text-muted-foreground">
                  {formatTime(performanceMetrics?.executionTime?.baseline || 0)}
                </span>
              </div>
              <Progress 
                value={Math.min(100, (performanceMetrics?.executionTime?.predicted / performanceMetrics?.executionTime?.baseline) * 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MemoryStick className="h-5 w-5 text-purple-500" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peak Usage</span>
                <span className="font-medium">
                  {Math.round(performanceMetrics?.memoryUsage?.peak || 0)} MB
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(performanceMetrics?.memoryUsage?.average || 0)} MB
                </span>
              </div>
              <Progress 
                value={Math.min(100, (performanceMetrics?.memoryUsage?.peak / 100) * 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cpu className="h-5 w-5 text-orange-500" />
              CPU Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average</span>
                <span className="font-medium">
                  {Math.round(performanceMetrics?.cpuUtilization?.average || 0)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peak</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(performanceMetrics?.cpuUtilization?.peak || 0)}%
                </span>
              </div>
              <Progress 
                value={performanceMetrics?.cpuUtilization?.average || 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Quality Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Quality Analysis
          </CardTitle>
          <CardDescription>
            Assessment of code maintainability, complexity, and best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Complexity Score</span>
                  <Badge className={getPerformanceBg(complexityAnalysis?.score || 50)}>
                    {complexityAnalysis?.score || 50}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {complexityAnalysis?.description || 'Code complexity assessment'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Key Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cyclomatic Complexity</span>
                    <span>{complexityAnalysis?.cyclomaticComplexity || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lines of Code</span>
                    <span>{complexityAnalysis?.linesOfCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Functions/Methods</span>
                    <span>{complexityAnalysis?.functionCount || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Quality Indicators</h4>
              <div className="space-y-3">
                {codeQuality?.indicators?.map((indicator: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    {indicator.status === 'good' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{indicator.name}</p>
                      <p className="text-xs text-muted-foreground">{indicator.description}</p>
                    </div>
                    <Badge variant={indicator.status === 'good' ? 'default' : 'secondary'}>
                      {indicator.value}
                    </Badge>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">
                    No quality indicators available
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Risk Assessment
          </CardTitle>
          <CardDescription>
            Potential performance bottlenecks and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskAssessment?.risks?.map((risk: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">{risk.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      {risk.severity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Impact: {risk.impact}
                    </span>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No significant risks identified</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Optimization Suggestions
          </CardTitle>
          <CardDescription>
            Recommended improvements to enhance performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationSuggestions?.suggestions?.map((suggestion: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-800 text-sm font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Expected improvement: {suggestion.expectedImprovement}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.category}
                    </Badge>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-sm text-muted-foreground">
                No optimization suggestions available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}